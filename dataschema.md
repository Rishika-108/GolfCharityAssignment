# Premium Charity Platform — Final Database Schema

## Overview

This schema supports:

* Users & Subscriptions
* Payments & Prize Pool
* Charity Donations
* Scores & Draw System
* Winners & Proof Verification
* Notifications & Admin Logs

---

# 👤 1. Users (Profile Extension)

Supabase provides `auth.users`, so we extend it.

## profiles

| Column     | Type      | Notes                    |
| ---------- | --------- | ------------------------ |
| id         | uuid (PK) | References auth.users.id |
| full_name  | text      |                          |
| email      | text      |                          |
| country    | text      |                          |
| created_at | timestamp |                          |

---

# 💳 2. Subscriptions

## subscriptions

| Column                 | Type                    | Notes                               |
| ---------------------- | ----------------------- | ----------------------------------- |
| id                     | uuid (PK)               |                                     |
| user_id                | uuid (FK → profiles.id) |                                     |
| plan_type              | enum                    | monthly, yearly                     |
| status                 | enum                    | active, canceled, past_due, expired |
| start_date             | timestamp               |                                     |
| end_date               | timestamp               |                                     |
| stripe_subscription_id | text                    |                                     |
| created_at             | timestamp               |                                     |

---

# 💰 3. Payments

## payments

| Column            | Type      | Notes           |
| ----------------- | --------- | --------------- |
| id                | uuid (PK) |                 |
| user_id           | uuid (FK) |                 |
| amount            | numeric   |                 |
| currency          | text      |                 |
| status            | enum      | success, failed |
| stripe_payment_id | text      |                 |
| created_at        | timestamp |                 |

---

# 💸 4. Subscription Allocations (Money Split)

## subscription_allocations

| Column            | Type                    |
| ----------------- | ----------------------- |
| id                | uuid (PK)               |
| payment_id        | uuid (FK → payments.id) |
| prize_pool_amount | numeric                 |
| charity_amount    | numeric                 |
| platform_fee      | numeric                 |
| created_at        | timestamp               |

---

# ❤️ 5. Charities

## charities

| Column      | Type      |
| ----------- | --------- |
| id          | uuid (PK) |
| name        | text      |
| description | text      |
| image_url   | text      |
| country     | text      |
| is_featured | boolean   |
| created_at  | timestamp |

---

# 🙋 6. User Charity Preferences

## user_charities

| Column                  | Type      | Notes       |
| ----------------------- | --------- | ----------- |
| id                      | uuid (PK) |             |
| user_id                 | uuid (FK) |             |
| charity_id              | uuid (FK) |             |
| contribution_percentage | numeric   | CHECK >= 10 |
| created_at              | timestamp |             |

---

# 💝 7. Charity Transactions (Actual Donations)

## charity_transactions

| Column     | Type      |                      |
| ---------- | --------- | -------------------- |
| id         | uuid (PK) |                      |
| user_id    | uuid (FK) |                      |
| charity_id | uuid (FK) |                      |
| amount     | numeric   |                      |
| source     | enum      | subscription, direct |
| created_at | timestamp |                      |

---

# ⛳ 8. Scores

## scores

| Column     | Type      | Notes                        |
| ---------- | --------- | ---------------------------- |
| id         | uuid (PK) |                              |
| user_id    | uuid (FK) |                              |
| score      | int       | CHECK score BETWEEN 1 AND 45 |
| played_at  | date      |                              |
| created_at | timestamp |                              |

**Backend Rule:** Max 5 scores per user

---

# 🎲 9. Draws

## draws

| Column       | Type      |                               |
| ------------ | --------- | ----------------------------- |
| id           | uuid (PK) |                               |
| month        | int       |                               |
| year         | int       |                               |
| draw_type    | enum      | random, algorithmic           |
| status       | enum      | pending, simulated, published |
| draw_numbers | int[]     |                               |
| is_locked    | boolean   |                               |
| created_at   | timestamp |                               |
| published_at | timestamp |                               |

---

# 👥 10. Draw Participants (CRITICAL)

## draw_participants

| Column      | Type      |
| ----------- | --------- |
| id          | uuid (PK) |
| draw_id     | uuid (FK) |
| user_id     | uuid (FK) |
| is_eligible | boolean   |
| created_at  | timestamp |

**Purpose:** Snapshot of users included in draw

---

# 🧪 11. Draw Simulations

## draw_simulations

| Column            | Type      |
| ----------------- | --------- |
| id                | uuid (PK) |
| draw_id           | uuid (FK) |
| simulated_numbers | int[]     |
| results_json      | json      |
| created_at        | timestamp |

---

# 🧮 12. Draw Results

## draw_results

| Column        | Type      |
| ------------- | --------- |
| id            | uuid (PK) |
| draw_id       | uuid (FK) |
| user_id       | uuid (FK) |
| matched_count | int       |
| is_winner     | boolean   |
| created_at    | timestamp |

**matched_count values:** 3, 4, 5

---

# 💰 13. Prize Pools

## prize_pools

| Column          | Type      |
| --------------- | --------- |
| id              | uuid (PK) |
| draw_id         | uuid (FK) |
| total_pool      | numeric   |
| match_5_pool    | numeric   |
| match_4_pool    | numeric   |
| match_3_pool    | numeric   |
| rollover_amount | numeric   |
| created_at      | timestamp |

---

# 🔗 14. Prize Pool Contributions (Optional but Recommended)

## prize_pool_contributions

| Column     | Type      |
| ---------- | --------- |
| id         | uuid (PK) |
| payment_id | uuid (FK) |
| draw_id    | uuid (FK) |
| amount     | numeric   |
| created_at | timestamp |

---

# 🏆 15. Winners

## winners

| Column       | Type      |                                   |
| ------------ | --------- | --------------------------------- |
| id           | uuid (PK) |                                   |
| draw_id      | uuid (FK) |                                   |
| user_id      | uuid (FK) |                                   |
| match_type   | enum      | match_3, match_4, match_5         |
| prize_amount | numeric   |                                   |
| status       | enum      | pending, approved, rejected, paid |
| created_at   | timestamp |                                   |

---

# 📸 16. Proof Uploads

## proofs

| Column      | Type      |                             |
| ----------- | --------- | --------------------------- |
| id          | uuid (PK) |                             |
| winner_id   | uuid (FK) |                             |
| file_url    | text      |                             |
| status      | enum      | pending, approved, rejected |
| uploaded_at | timestamp |                             |
| reviewed_at | timestamp |                             |

---

# 🔔 17. Notifications

## notifications

| Column     | Type      |                                   |
| ---------- | --------- | --------------------------------- |
| id         | uuid (PK) |                                   |
| user_id    | uuid (FK) |                                   |
| type       | enum      | subscription, draw_result, winner |
| status     | enum      | sent, failed                      |
| created_at | timestamp |                                   |

---

# 🛠️ 18. Admin Logs (Audit Trail)

## admin_logs

| Column      | Type      |
| ----------- | --------- |
| id          | uuid (PK) |
| admin_id    | uuid      |
| action      | text      |
| entity_type | text      |
| entity_id   | uuid      |
| created_at  | timestamp |

---

# 🔗 Relationship Summary

| Relationship                | Type |
| --------------------------- | ---- |
| User → Subscription         | 1:1  |
| User → Scores               | 1:N  |
| User → Payments             | 1:N  |
| User → Charity Preference   | 1:1  |
| User → Charity Transactions | 1:N  |
| Draw → Participants         | 1:N  |
| Draw → Results              | 1:N  |
| Draw → Winners              | 1:N  |
| Draw → Prize Pool           | 1:1  |
| Winner → Proof              | 1:1  |

---

# ⚙️ Critical Backend Rules

## ✅ Score Rule

* Max **5 scores per user**

## ✅ Draw Eligibility

Only users who:

* Have **active subscription**
* Have **5 scores submitted**

## ✅ Prize Distribution

| Match   | Percentage             |
| ------- | ---------------------- |
| Match 5 | 40% (rollover allowed) |
| Match 4 | 35%                    |
| Match 3 | 25%                    |

## ✅ Draw Locking

* Once draw is **published → immutable**

---

# 🔐 Security (Supabase RLS)

## Users Can:

* View their own profile
* Edit their own profile
* View their payments
* View their scores
* View their charity donations
* View their draw results
* Upload proof if winner

## Admin Can:

* Full access to all tables
* Manage draws
* Approve winners
* Review proofs
* View logs
* Manage charities

---

# End of Database Schema

---
