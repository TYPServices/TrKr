# Plaid Cost Analysis for TrKr

Last updated: April 2026

---

## Plaid Pricing Model

Plaid charges per **Item** (one linked institution per user) per month.
Pricing is negotiated and not published — estimates below are based on publicly available ranges from 2025-2026.

| Scale | Items/User | Monthly Items | Est. Cost/Item | Monthly Cost | Annual Cost |
|-------|-----------|--------------|----------------|-------------|------------|
| 10K users | 2 | 20,000 | ~$0.30 | ~$6,000 | ~$72K |
| 100K users | 2 | 200,000 | ~$0.20–0.25 | ~$40–50K | ~$480–600K |
| 1M users | 2 | 2,000,000 | ~$0.08–0.12 | ~$160–240K | ~$1.9–2.9M |

> These estimates assume 2 linked items per user (e.g., checking + brokerage). Heavy users may link 4–5.

### Revenue Context (TrKr Pro @ $4.99/mo)

| Scale | Plaid Cost | Pro Revenue (20% conversion) | Net Margin Impact |
|-------|-----------|------------------------------|-------------------|
| 10K | $6K/mo | $9,980/mo | Plaid = 60% of revenue |
| 100K | $45K/mo | $99,800/mo | Plaid = 45% of revenue |
| 1M | $200K/mo | $998K/mo | Plaid = 20% of revenue |

**Key takeaway**: Plaid is the single largest variable cost. Cost efficiency is critical from day 1.

---

## Cost Reduction Strategies

### 1. Webhook-driven sync (highest impact)
- Instead of polling Plaid every N hours, only sync when Plaid sends a webhook
- Reduces Plaid API transaction calls by **~80%**
- Implemented in `src/lib/plaid.ts` → `resolveWebhookAction()`

### 2. Sync throttling
- Even if a webhook fires, enforce a minimum 4-hour gap between full syncs per item
- Implemented in `src/lib/plaid.ts` → `isSyncThrottled()`

### 3. Item deduplication
- Prevent users from accidentally linking the same institution twice
- Each duplicate doubles your Plaid bill for that user
- Implemented in `src/lib/plaid.ts` → `isDuplicateItem()`

### 4. Selective product activation
- Plaid bills differently by product. TrKr only activates `transactions` + `investments`
- **Not** activated: `identity`, `assets`, `income`, `liabilities`
- This avoids premium product surcharges

### 5. Webhooks over polling for investments
- Investment holdings update less frequently than transactions
- Only sync holdings when Plaid sends `HOLDINGS/DEFAULT_UPDATE`

---

## Alternative Data Providers

| Provider | Coverage | Price vs. Plaid | Notes |
|----------|----------|----------------|-------|
| **Plaid** | 12,000+ institutions | Baseline | Best coverage, highest cost |
| **MX** | 6,000+ institutions | ~30–40% cheaper | Good API, less consumer-brand recognition |
| **Finicity** (Mastercard) | 10,000+ institutions | ~20–30% cheaper | API-first, strong investment data |
| **Yodlee** | 17,000+ institutions | Similar to Plaid | Older platform, less developer-friendly |

**Recommendation:**
- **0–50K users**: Use Plaid (best coverage, easiest auth flows, reduces churn from failed bank links)
- **50K+ users**: Renegotiate Plaid contract OR evaluate MX as parallel option for price leverage
- **100K+ users**: Dual-provider strategy — Plaid for top 50 institutions, MX for the rest

---

## When to Renegotiate

Plaid offers enterprise pricing at volume. Trigger points to reach out:
- **$5K/mo** in Plaid spend (negotiate 10–15% reduction)
- **$20K/mo** (negotiate 20–30% reduction, volume discount)
- **$50K/mo** (negotiate a flat-rate enterprise agreement)

---

## Integration Architecture (Cost-Efficient)

```
User links bank
  → App calls your backend (Supabase Edge Function)
  → Backend calls POST /link/token/create (server-side — never in app)
  → App opens Plaid Link with token
  → User authenticates
  → Plaid sends public_token to app
  → App sends public_token to backend
  → Backend calls POST /item/public_token/exchange
  → Backend stores access_token (encrypted, never sent to app)
  → Plaid sends webhook on data updates
  → Backend calls POST /transactions/sync or /investments/holdings/get
  → Synced data stored in Supabase
  → App reads from Supabase (not Plaid directly)
```

This architecture ensures:
- Plaid credentials never touch the client app
- All sync is webhook-driven (minimizing API calls)
- Supabase serves as the cache layer (Plaid is the source of truth)
