/**
 * Plaid cost-efficient integration patterns for TrKr.
 *
 * Install the Plaid SDK when ready to integrate:
 *   npx expo install react-native-plaid-link-sdk
 *
 * This file contains pure utility logic (no Plaid SDK dependency) so it is
 * testable and cost-guardrail patterns are in place before the first API call.
 */

// ── Types ────────────────────────────────────────────────────────────────────

export interface PlaidItem {
  itemId: string;
  institutionId: string;
  institutionName: string;
  userId: string;
  lastSyncedAt: string | null;
  syncStatus: 'ok' | 'error' | 'pending';
}

export interface PlaidWebhookPayload {
  webhook_type: 'TRANSACTIONS' | 'INVESTMENTS' | 'ITEM' | 'AUTH' | 'HOLDINGS';
  webhook_code: string;
  item_id: string;
  new_transactions?: number;
  removed_transactions?: string[];
  error?: { error_code: string; error_message: string };
}

export type WebhookHandlerResult =
  | { action: 'sync'; itemId: string }
  | { action: 'skip'; reason: string }
  | { action: 'error_recovery'; itemId: string };

// ── Cost control constants ────────────────────────────────────────────────────

/** Minimum time between syncs per Plaid Item (avoids redundant API calls). */
export const MIN_SYNC_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours

/**
 * Products to activate when creating a Plaid Link token.
 * Only enable what you use — each product may have cost implications.
 * NOT included: 'identity', 'assets', 'income' (unnecessary for TrKr MVP).
 */
export const PLAID_PRODUCTS = ['transactions', 'investments'] as const;
export type PlaidProduct = (typeof PLAID_PRODUCTS)[number];

// ── Item deduplication ───────────────────────────────────────────────────────

/**
 * Returns true if the user already has a linked item for this institution.
 * Check this before calling /link/token/create to prevent duplicate billing.
 */
export function isDuplicateItem(
  existingItems: PlaidItem[],
  newInstitutionId: string,
  userId: string,
): boolean {
  return existingItems.some(
    (item) => item.institutionId === newInstitutionId && item.userId === userId,
  );
}

// ── Sync throttling ──────────────────────────────────────────────────────────

/**
 * Returns true if this item was synced too recently to sync again.
 * Use this before triggering a manual refresh to avoid excess API calls.
 */
export function isSyncThrottled(item: PlaidItem): boolean {
  if (!item.lastSyncedAt) return false;
  const elapsed = Date.now() - new Date(item.lastSyncedAt).getTime();
  return elapsed < MIN_SYNC_INTERVAL_MS;
}

/** Returns the earliest time this item can be synced again, or null if never synced. */
export function nextSyncAvailableAt(item: PlaidItem): Date | null {
  if (!item.lastSyncedAt) return null;
  return new Date(new Date(item.lastSyncedAt).getTime() + MIN_SYNC_INTERVAL_MS);
}

// ── Webhook-driven sync ──────────────────────────────────────────────────────

/**
 * Resolves what action to take for an incoming Plaid webhook.
 *
 * Webhook-driven sync reduces Plaid API calls by ~80% vs. polling.
 * Deploy this logic in a Cloudflare Worker or Supabase Edge Function
 * registered as a Plaid webhook receiver.
 */
export function resolveWebhookAction(
  payload: PlaidWebhookPayload,
  item: PlaidItem,
): WebhookHandlerResult {
  // Item errors need recovery (re-linking) regardless of throttle
  if (payload.webhook_type === 'ITEM' && payload.webhook_code === 'ERROR') {
    return { action: 'error_recovery', itemId: payload.item_id };
  }

  const isSyncable =
    (payload.webhook_type === 'TRANSACTIONS' && payload.webhook_code === 'SYNC_UPDATES_AVAILABLE') ||
    (payload.webhook_type === 'INVESTMENTS' && payload.webhook_code === 'DEFAULT_UPDATE') ||
    (payload.webhook_type === 'HOLDINGS' && payload.webhook_code === 'DEFAULT_UPDATE');

  if (!isSyncable) {
    return { action: 'skip', reason: `Unhandled: ${payload.webhook_type}/${payload.webhook_code}` };
  }

  if (isSyncThrottled(item)) {
    const next = nextSyncAvailableAt(item)?.toISOString() ?? 'unknown';
    return { action: 'skip', reason: `Throttled until ${next}` };
  }

  return { action: 'sync', itemId: payload.item_id };
}

// ── Link token request builder ────────────────────────────────────────────────

/**
 * Builds the request body for POST /link/token/create.
 * Call this server-side (Supabase Edge Function or Cloudflare Worker) —
 * never expose your Plaid client_secret to the app.
 */
export function buildLinkTokenRequest(userId: string, webhookUrl?: string) {
  return {
    user: { client_user_id: userId },
    client_name: 'TrKr',
    products: [...PLAID_PRODUCTS],
    country_codes: ['US'],
    language: 'en',
    ...(webhookUrl ? { webhook: webhookUrl } : {}),
  };
}
