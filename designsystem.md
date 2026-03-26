# Evergreen + Earth Design System (Refined for Platform)

## 1. Design Philosophy (Very Important)

It is a **Premium Membership Platform with Impact + Rewards**

So the UI should feel:

* Clean
* Trustworthy
* Calm
* Premium
* Purpose-driven
* Not playful
* Not casino-like
* Not sporty

**Design keywords:**

```
Calm
Premium
Clean
Purposeful
Trustworthy
Minimal
Soft shadows
Rounded cards
Subtle motion
```

---

# 2. Color System — Role Based Usage

Instead of just listing colors, define **when each color is used**.

## Primary Evergreen (Main Platform UI)

| Token       | Hex     | Use                                   |
| ----------- | ------- | ------------------------------------- |
| Deep Forest | #1b4332 | Page titles, sidebar, headings        |
| Emerald     | #2d6a4f | Primary buttons, links, active states |
| Sage        | #40916c | Gradients, charts                     |
| Leaf        | #52b788 | Highlights, icons                     |
| Mint        | #d8f3dc | Badges, highlights                    |
| Mint Light  | #f4fdf6 | Section backgrounds                   |
| Mint Border | #b7e4c7 | Borders                               |

### Usage Rule

```
Deep Forest → Text / Headings
Emerald → Actions
Mint → Information / Impact
Ghost White → Page background
White → Cards
```

This rule keeps UI consistent.

---

# 3. Earth Palette (Admin / Secondary Role)

Use Earth colors mainly for:

* Admin dashboard
* Supervisor tools
* Internal panels
* Management UI

| Token        | Hex     | Use           |
| ------------ | ------- | ------------- |
| Saddle Brown | #774936 | Admin buttons |
| Clay         | #fde8d8 | Admin cards   |
| Clay Border  | #f4c0a0 | Admin borders |

**Important:**
Do NOT mix Earth palette into main user dashboard heavily.

---

# 4. Neutrals (Structure)

| Token       | Hex     | Usage           |
| ----------- | ------- | --------------- |
| White       | #ffffff | Cards           |
| Ghost White | #f9fafb | Page background |
| Charcoal    | #1a1a1a | Body text       |
| Muted       | #5c7a6b | Labels          |
| Border      | #e8f5e9 | Dividers        |

---

# 5. Status Colors (System States)

These will be used everywhere (draw, verification, subscription).

| State             | Color   | Use                 |
| ----------------- | ------- | ------------------- |
| Pending           | #f59e0b | Waiting proof       |
| Active / Assigned | #2d6a4f | Active subscription |
| Completed         | #6366f1 | Paid / Completed    |
| Error             | #dc2626 | Rejected / Failed   |

---

# 6. Page Background Rules (Very Important)

Use only these combinations:

| Page        | Background                     |
| ----------- | ------------------------------ |
| Landing     | Gradient Emerald → Deep Forest |
| Dashboard   | Ghost White                    |
| Forms       | Ghost White                    |
| Admin       | Clay Light                     |
| Draw Page   | Mint Light                     |
| Impact Page | Mint Light                     |

This keeps visual separation between sections.

---

# 7. Component System (Refined)

## Buttons

### Primary Button

Used for:

* Add Score
* Subscribe
* Verify Win
* Save
* Confirm

```
background: linear-gradient(135deg, #2d6a4f, #1b4332)
color: #ffffff
border-radius: 50px
padding: 12px 20px
font-weight: 600
box-shadow: 0 4px 18px rgba(45,106,79,0.35)
```

### Secondary Button

```
background: #ffffff
border: 2px solid #2d6a4f
color: #2d6a4f
```

### Danger Button

```
background: #dc2626
color: white
```

---

# 8. Cards (Very Important Component)

Use the same card everywhere.

```
background: #ffffff;
border: 1px solid #e8f5e9;
border-radius: 16px;
box-shadow: 0 2px 10px rgba(27,67,50,0.05);
padding: 20px;
transition: all 0.2s ease;
```

Hover:

```
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(27,67,50,0.08);
```

---

# 9. Special Cards (Platform Specific)

You actually need **special card types** for your platform.

## Impact Card

```
background: #f4fdf6
border: 1px solid #b7e4c7
```

## Prize Card

```
background: linear-gradient(135deg, #52b788, #2d6a4f)
color: white
```

## Draw Result Card

```
border-left: 6px solid Emerald
```

## Winner Card

```
border-left: 6px solid Indigo
```

---

# 10. Score Tokens (Very Important Component)

Your platform revolves around these.

```
width: 70px
height: 70px
border-radius: 50%
background: linear-gradient(135deg, #52b788, #2d6a4f)
color: white
display: flex
align-items: center
justify-content: center
font-weight: 700
font-size: 20px
box-shadow: 0 4px 12px rgba(45,106,79,0.3)
```

These should animate when updated.

---

# 11. Typography System

| Use           | Size | Weight | Color       |
| ------------- | ---- | ------ | ----------- |
| Page Title    | 32px | 800    | Deep Forest |
| Section Title | 22px | 600    | Deep Forest |
| Card Title    | 18px | 600    | Charcoal    |
| Subtitle      | 14px | 500    | Muted       |
| Body          | 15px | 400    | Charcoal    |
| Small         | 12px | 400    | Muted       |

Font:

```
Poppins, Segoe UI, sans-serif
```

---

# 12. Motion System (Framer Motion)

Use motion consistently:

| Element      | Animation       |
| ------------ | --------------- |
| Page         | Fade + slide up |
| Cards        | Fade in         |
| Buttons      | Press scale     |
| Sidebar      | Slide in        |
| Score tokens | Slide shift     |
| Draw numbers | Pulse           |
| Modals       | Scale in        |

### Standard Page Animation

```
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.3 }}
```

---

# 13. Layout Grid System

Use this layout for dashboard:

```
------------------------------------------------
| Impact Card | Prize Pool |
------------------------------------------------
| Rolling Scores (wide card) |
------------------------------------------------
| Countdown | Draw Info |
------------------------------------------------
```

Use:

```
grid-template-columns: repeat(12, 1fr)
gap: 20px
```

---

# 14. Pages You Will Have

Very important for system structure.

```
Public
/landing
/login
/signup

Onboarding
/onboarding/charity
/onboarding/contribution
/onboarding/subscription

App
/dashboard
/scores
/draw
/results
/impact
/winners
/account

Admin
/admin
/admin/draw
/admin/users
/admin/charities
/admin/verifications
```

---

# 15. Design System Rules (Most Important Section)

If you follow these, the UI will look consistent:

### Rules

1. Page background always Ghost White.
2. Cards always White with Mint border.
3. Primary actions always Emerald gradient.
4. Impact/Charity sections use Mint backgrounds.
5. Admin uses Earth palette.
6. Headings always Deep Forest.
7. Body text always Charcoal.
8. Use rounded corners everywhere (12–16px).
9. Use soft shadows only.
10. Use Framer Motion for all transitions.
11. Never use bright colors except status.
12. Never use black backgrounds.
13. Never mix too many colors in one screen.
14. One primary action per card.
15. Score tokens always circular gradient.

---

