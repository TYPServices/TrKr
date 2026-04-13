TRKR CONSUMER CONSENT FRAMEWORK
Version 1.0 | TYP Services LLC
1. Consent Collection Points
TrKr collects explicit consent at the following moments:
1.	Account Registration
o	Trigger: User creates an account.
o	Consent shown: “By creating an account, you agree to our Privacy Policy and Terms of Service.”
o	Links: Privacy Policy; Terms of Service (tappable).
o	Method: Checkbox (unchecked by default) + Create button.
o	Stored: consent_registration timestamp in profiles table.
o	Bank Account Linking (Plaid)
o	Trigger: User taps “Link Account”.
o	Consent shown: Plaid’s consent screen (Plaid Link), which (i) shows TrKr’s name and logo, (ii) lists the specific data types requested, (iii) shows which accounts will be shared, and (iv) includes a link to Plaid’s privacy policy.
o	Method: Plaid-managed consent flow (required by Plaid).
o	Stored: Plaid manages consent records; TrKr stores a connection timestamp in the plaid_items table.
o	MFA Enrollment
o	Trigger: User sets up 2FA.
o	Consent shown: “TrKr requires 2FA to protect your financial data. Your authenticator secret is encrypted and stored securely.”
o	Method: Proceed button after reading the explanation.
o	Stored: two_factor_enabled flag in profiles.
o	Biometric Enrollment
o	Trigger: User enables Face ID / Touch ID.
o	Consent shown: iOS system prompt using the NSFaceIDUsageDescription string: “TrKr uses Face ID to securely unlock your financial dashboard.”
o	Method: iOS system biometric prompt (Apple-managed).
o	Stored: face_id_enabled flag + biometric_devices record.
o	Home Value Lookup (Zillow)
o	Trigger: User enters a property address.
o	Consent shown: “Your address will be sent to Zillow to retrieve an estimated home value. See Zillow’s privacy policy.”
o	Method: Confirm button before the API call.
o	Stored: data_source flag in the properties table.
o	Push Notifications
o	Trigger: First dividend or budget alert.
o	Consent shown: iOS system notification prompt.
o	Method: iOS-managed permission dialog.
o	Stored: push_token in profiles (null if declined).
o	TrKr Pro Subscription
o	Trigger: User taps upgrade.
o	Consent shown: Apple’s standard in-app purchase confirmation with price, renewal terms, and cancellation policy.
o	Method: Apple-managed purchase flow (Face ID / password).
o	Stored: subscription field in profiles + RevenueCat.
2. Consent Records
All consent events are logged in security_audit_log:
Event	Metadata stored
CONSENT_REGISTRATION	timestamp, IP, device
PLAID_ITEM_LINKED	institution, item_id
2FA_ENABLED	method (totp/email/sms)
BIOMETRIC_ENROLLED	device_id, type
ZILLOW_LOOKUP_CONSENTED	address (hashed)
PUSH_NOTIFICATIONS_GRANTED	timestamp
SUBSCRIPTION_PURCHASED	plan, timestamp
3. Consent Withdrawal
Users can withdraw consent at any time:
Action	How to withdraw
Bank connection	Settings > Linked Accounts > Disconnect
Biometric login	Settings > Security > Face ID toggle off
Push notifications	iOS Settings > TrKr > Notifications
Home value tracking	Portfolio > Home Value > Delete
Entire account	Settings > Legal > Delete Account
Plaid independently	Plaid Portal (my.plaid.com)
Withdrawal of consent triggers appropriate data deletion per our Data Deletion and Retention Policy.
4. Minors
TrKr does not collect data from users under age 18. Age verification is implicit via Apple ID / Google account requirements and financial institution access.
5. Consent for Data Sharing
We never share data without consent. Per Section 4 of our Privacy Policy, data is shared only with service providers necessary to operate the app. No data is sold, rented, or shared for advertising.
6. Plaid Consent Requirements
Per Plaid’s developer documentation:
•	Transparency: Users see Plaid’s branded consent screen with our app name and the data types requested.
•	Data minimization: We request only the Plaid products we need (e.g., transactions, investments).
•	Enforcement: Plaid’s API returns only the data types the user explicitly approved.
•	Revocability: Users can revoke via Plaid Portal or our app at any time.
