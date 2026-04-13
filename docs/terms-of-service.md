TRKR Data Deletion and Retention Policy
Version 1.0 | TYP Services LLC
______________________________________________
1. Purpose
This policy defines how TrKr retains, archives, and deletes consumer data in compliance with the GLBA Safeguards Rule, CCPA/CPRA, and Plaid Developer Policy.
2. Retention Schedule
Data type	Retention period
Account profile info	While account is active
Plaid access tokens	While connection is active
Transaction history	24 months from transaction date
Investment holdings	While account is active
Budget categories/goals	While account is active
Security audit logs	12 months
Authentication logs	12 months
OTP codes (hashed)	10 minutes (auto-expire)
Session tokens	30 days (auto-expire)
Biometric enrollments	90 days since last use
Plaid webhook data	30 days
Net worth snapshots	While account is active
Property value history	While account is active
3. Automated Cleanup
The following automated processes enforce retention:
•	Expired OTPs: Cleared immediately after expiry (10-minute TTL in database).
•	Expired sessions: Purged daily via cron job.
•	Old transactions: Transactions older than 24 months are purged monthly via a scheduled database function.
•	Inactive biometric devices: Revoked after 90 days of no use via a scheduled job.
•	Old audit logs: Entries older than 12 months are purged monthly.
4. User-Initiated Deletion
4.1 Delete Individual Connections
Users can disconnect any bank account in Settings. Upon disconnection:
•	Plaid item is removed via plaid.itemRemove().
•	Access token is deleted from the database.
•	Associated accounts, holdings, and transactions are deleted within 24 hours.
4.2 Delete Entire Account
Users can request full account deletion via:
•	In-app: Settings > Legal > Data Deletion Request
•	Email: privacy@trkr.app
Upon deletion request:
1.	Immediate:
o	User session is terminated.
o	Account is marked for deletion.
o	Login is disabled.
2.	Within 24 hours:
o	All Plaid connections are revoked via API.
o	All biometric enrollments are cleared.
3.	Within 30 days:
o	All database records are permanently deleted (profiles, accounts, holdings, transactions, budget categories, goals, debts, properties, biometric devices, security audit log, net worth snapshots).
o	Supabase Auth user record is deleted.
o	RevenueCat customer record is anonymized.
4.	Verification:
o	Confirmation email is sent to the user.
o	Deletion is logged for compliance records.
o	Log entry is retained for 12 months per regulatory requirement, containing only: deletion date, email hash, completion status.
5. Plaid-Specific Requirements
Per Plaid Developer Policy:
•	When a user disconnects a Plaid item, we call plaid.itemRemove() to revoke access.
•	We delete all data received through that Plaid item from our database within 24 hours.
•	Users can also revoke access via Plaid Portal (my.plaid.com) independently.
•	If Plaid notifies us of a user consent revocation, we delete the associated data within 24 hours.
6. Regulatory Compliance
This policy satisfies:
•	GLBA Safeguards Rule: 16 CFR 314.4(c)(6) — disposal of consumer information.
•	CCPA/CPRA: Right to deletion (Cal. Civ. Code 1798.105).
•	Plaid Developer Policy: Data deletion obligations.
•	Apple App Store Guidelines: Section 5.1.1(v) — account deletion requirement.
7. Exceptions
We may retain data beyond the stated periods if:
•	Required by law or legal process.
•	Necessary to resolve disputes.
•	Required to enforce our Terms of Service.
•	Needed to prevent fraud.
In such cases, we retain only the minimum data necessary and delete it as soon as the legal obligation is fulfilled.
