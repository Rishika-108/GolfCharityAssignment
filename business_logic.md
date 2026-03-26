# 🧠 Golf Charity Platform — Business Logic Specification

# 1. 👤 Authentication & User Logic

## Registration Flow

When a new user registers:

### Required Steps

1. Create account (name, email, password)
2. Select charity
3. Select charity contribution % (≥ 10%)
4. Select subscription plan (monthly/yearly)
5. Complete payment
6. Enter first golf scores

---

## Registration System Flow

```
Create User
→ Create Subscription (status = pending)
→ Redirect to Payment
→ Payment Success
→ Subscription → active
→ User allowed to enter scores
→ Eligible for draw ONLY after 5 valid scores
```

---

## User States

| State     | Description                         |
| --------- | ----------------------------------- |
| Pending   | Payment not completed               |
| Active    | Paid subscriber                     |
| Cancelled | Cancelled but active until end_date |
| Past_Due  | Payment failed (grace period)       |
| Expired   | Subscription ended                  |
| Suspended | Admin blocked                       |
| Deleted   | Soft deleted                        |

---

## Access Control

| Feature            | Active | Past_Due | Expired   | Suspended |
| ------------------ | ------ | -------- | --------- | --------- |
| Dashboard          | Yes    | Limited  | Limited   | No        |
| Enter Scores       | Yes    | No       | No        | No        |
| Draw Participation | Yes    | No       | No        | No        |
| Charity Selection  | Yes    | No       | No        | No        |
| Winnings View      | Yes    | Yes      | View only | No        |

---

# 2. 💳 Subscription & Payment Logic

## Plans

| Plan    | Billing Cycle |
| ------- | ------------- |
| Monthly | 30 days       |
| Yearly  | 365 days      |

---

## Subscription Lifecycle

```
Pending → Active → Renewal Due → Renewed → Active
                           ↓
                        Failed
                           ↓
                        Past_Due (Grace Period - 7 days)
                           ↓
                         Expired
```

---

## Grace Period Rule

If payment fails:

```
→ status = past_due
→ user gets 7 days to retry
→ IF payment succeeds → active
→ ELSE → expired
```

---

## Revenue Allocation per Payment

Each successful payment is split:

```
charity_amount = subscription_amount × charity_percentage
prize_pool_amount = subscription_amount × prize_pool_percentage
platform_revenue = remaining amount
```

### Rules

* Minimum charity contribution = 10%
* All allocations must be stored per transaction
* Allocation is immutable after payment

---

## Refund & Chargeback Rules

| Scenario           | Action                 |
| ------------------ | ---------------------- |
| Refund BEFORE draw | Remove from prize pool |
| Refund AFTER draw  | No change              |
| Chargeback         | Suspend user account   |

---

# 3. ⛳ Score Management Logic

## Score Rules

Each score must include:

* Value (1–45, Stableford)
* Date played (cannot be future)
* Optional: course name, proof image

---

## 5-Score Rolling Rule

```
IF total_scores < 5:
    Add score
ELSE:
    Remove oldest score
    Add new score
```

---

## Score Ordering

```
Display: ORDER BY played_at DESC
```

---

## Score Lock Rule

Scores become locked at draw cutoff time
(e.g., last day of month 23:59)

---

# 4. 🎲 Draw Engine Logic

## Core Concept

**A user’s 5 Stableford scores act as their draw numbers**

---

## Draw Frequency

* Once per month
* Triggered by admin
* Cannot run twice for same month

---

## Draw Execution Flow

```
1. Identify eligible users
2. Snapshot participants
3. Generate draw numbers
4. Calculate matches
5. Store results
6. Calculate winners
7. Publish results (lock draw)
```

---

## Draw Eligibility

A user is eligible ONLY IF:

```
subscription_status = active
AND score_count = 5
AND scores_valid = true
AND NOT suspended
```

---

## Participant Snapshot (CRITICAL)

At draw time:

```
→ Capture all eligible users
→ Store in draw_participants
→ Use ONLY this snapshot for results
```

---

## Draw Number Generation

Generate 5 numbers:

* Range: 1–45
* Must be unique
* Must be sorted

---

## Match Calculation

```
matches = count(intersection(user_scores, draw_numbers))
```

---

## Match Tiers

| Matches | Result    |
| ------- | --------- |
| 5       | Jackpot   |
| 4       | Tier 2    |
| 3       | Tier 3    |
| 0–2     | No reward |

---

## Draw Locking

Once published:

```
→ draw becomes immutable
→ no edits allowed
```

---

## Simulation Mode

Uses same logic:

```
→ Does NOT persist winners
→ Used for preview only
```

---

# 5. 💰 Prize Pool Logic

## Monthly Prize Pool

```
monthly_prize_pool =
SUM(prize_pool_amount from all ACTIVE users at draw time)
+ previous_jackpot_rollover
```

---

## Prize Distribution

| Tier    | Percentage |
| ------- | ---------- |
| 5 Match | 40%        |
| 4 Match | 35%        |
| 3 Match | 25%        |

---

## Multiple Winners

```
individual_prize = tier_pool / number_of_winners
```

---

## Jackpot Rollover

```
IF no 5-match winners:
→ rollover += 5-match pool
→ added to next draw
```

---

## Disqualification Handling

```
IF all winners in a tier are disqualified:
→ rollover that tier amount to next draw
```

---

# 6. ❤️ Charity Contribution Logic

## Contribution Rule

```
charity_donation = subscription_amount × charity_percentage
```

---

## Tracking Requirements

System must track:

* Total donations per charity
* Total donations per user
* Monthly totals
* Lifetime totals

---

## Additional Feature

Users can make **direct donations** not tied to gameplay.

---

# 7. 🏆 Winner Verification & Payout Logic

## Winner Flow

```
Draw Completed
→ Winners Identified
→ Notification Sent
→ User uploads proof
→ Admin reviews
→ Approve / Reject
→ If approved → payout
```

---

## Winner Status Flow

| Status        | Meaning              |
| ------------- | -------------------- |
| Pending Proof | Waiting for upload   |
| Under Review  | Admin checking       |
| Approved      | Valid winner         |
| Rejected      | Invalid/disqualified |
| Paid          | Payment completed    |

---

## Proof Rules

* Must be uploaded within defined timeframe (e.g., 7 days)
* Must match score date
* Must show valid score evidence

---

## Timeout Rule

```
IF proof not uploaded in time:
→ status = rejected
```

---

## Payout Rule

Only **Approved winners** get paid.

---

# 8. 🛠️ Admin Logic

| Module        | Actions                |
| ------------- | ---------------------- |
| Users         | View, edit, suspend    |
| Subscriptions | Modify                 |
| Scores        | Edit/delete            |
| Draw          | Run, simulate, publish |
| Prize Pool    | Adjust                 |
| Charities     | Add/edit/remove        |
| Winners       | Approve/reject         |
| Payouts       | Mark paid              |
| Reports       | View analytics         |

---

# 9. 🔔 Notification Logic

| Event            | Notification         |
| ---------------- | -------------------- |
| Signup           | Welcome              |
| Payment success  | Receipt              |
| Payment failed   | Retry alert          |
| Renewal reminder | Before billing       |
| Draw results     | Monthly summary      |
| Winner           | Congratulations      |
| Proof reminder   | Before deadline      |
| Payout           | Payment confirmation |

---

# 10. 📊 Reporting & Analytics Logic

## Admin Dashboard Metrics

* Total users
* Active subscribers
* Monthly revenue
* Total prize pool
* Charity donations
* Jackpot rollover
* Draw statistics
* Total winnings paid
* Most popular charity
* Average score
* User growth rate

---

# 11. ⚠️ System Rules & Edge Cases

## Score Rules

* No future dates
* Range must be 1–45
* Only latest 5 scores count
* Scores locked after cutoff

---

## Subscription Rules

* Expired users excluded from draw
* Renewed users re-included
* Cancelled users remain active until end_date

---

## Draw Rules

* Cannot run twice per month
* Must lock after publish
* Only snapshot participants used
* Numbers cannot change post-publish

---

## Payment Rules

* Refund before draw → adjust pool
* Refund after draw → no change
* Chargeback → suspend account

---

## Winner Rules

* Proof required
* Admin approval mandatory
* Multiple winners split prize
* Disqualified users removed
* If all disqualified → rollover

---

# 🧩 Complete System Flow

```
User Registers
→ Subscribes
→ Payment Success
→ Enters Scores
→ Maintains 5 Scores
→ Eligible for Draw
→ Monthly Draw Runs
→ Matches Calculated
→ Winners Determined
→ Proof Submission
→ Admin Approval
→ Payout Processed
→ Charity Donations Recorded
→ Reports Updated
```

---

# End of Business Logic Specification

---
