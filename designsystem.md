# Premium Charity Platform — Design System

**Theme:** Golf + Impact + Rewards
**Style Goals:** Premium • Trust • Emotion
**Avoid:** Neon colours, overly saturated gradients, inconsistent styling

---

# 🎨 Primary Brand (Golf + Charity)

| Token        | Hex     | Usage                           |
| ------------ | ------- | ------------------------------- |
| Deep Green   | #0B3D2E | Navbar, headings, premium areas |
| Emerald      | #1F7A63 | Buttons, active states          |
| Soft Emerald | #3FA78A | Gradient mid                    |
| Mint Accent  | #A7F3D0 | Highlights, hover glow          |
| Light Mint   | #ECFDF5 | Section backgrounds             |
| Mint Border  | #D1FAE5 | Borders, dividers               |

---

# 🏆 Premium Accent (Rewards / Prize System)

| Token     | Hex     | Usage                |
| --------- | ------- | -------------------- |
| Gold      | #D4AF37 | Primary CTA, rewards |
| Soft Gold | #F6E6A8 | Gradient highlight   |
| Warm Gold | #E6C200 | Hover states         |

---

# 🔵 Trust Layer (Analytics / System UI)

| Token        | Hex     | Usage             |
| ------------ | ------- | ----------------- |
| Navy         | #1F3A5F | Stats, dashboards |
| Indigo       | #4F46E5 | Links, charts     |
| Light Indigo | #EEF2FF | Background tint   |

---

# ⚪ Neutrals

| Token      | Hex     | Usage           |
| ---------- | ------- | --------------- |
| White      | #FFFFFF | Cards           |
| Background | #F5F7FA | Page background |
| Charcoal   | #1F2937 | Main text       |
| Muted      | #6B7280 | Secondary text  |
| Border     | #E5E7EB | Dividers        |

---

# 🚦 Status System

| State   | Colour  |
| ------- | ------- |
| Success | #22C55E |
| Pending | #F59E0B |
| Error   | #EF4444 |
| Info    | #3B82F6 |

---

# 🧩 Component Conventions

## 🔘 Buttons

### Primary (Main CTA)

```css
background: linear-gradient(135deg, #D4AF37, #F6E6A8);
color: #0B3D2E;
border-radius: 10px;
box-shadow: 0 4px 18px rgba(212,175,55,0.35);
```

### Secondary (Platform Action)

```css
background: linear-gradient(135deg, #1F7A63, #0B3D2E);
color: #ffffff;
```

### Outline

```css
border: 2px solid #1F7A63;
color: #1F7A63;
background: transparent;
```

---

## 🧾 Cards

```css
background: #ffffff;
border: 1px solid #E5E7EB;
border-radius: 16px;
box-shadow: 0 4px 12px rgba(0,0,0,0.05);
transition: all 0.2s ease;
```

### Card Hover

```css
transform: translateY(-2px);
box-shadow: 0 8px 20px rgba(0,0,0,0.08);
```

---

## ✏️ Inputs / Forms

```css
background: #F5F7FA;
border: 1.5px solid #E5E7EB;
border-radius: 10px;
padding: 12px;
```

### Focus State

```css
border-color: #1F7A63;
box-shadow: 0 0 0 3px #A7F3D0;
```

---

## 🟡 Draw / Prize Elements

```css
background: linear-gradient(135deg, #D4AF37, #F6E6A8);
color: #0B3D2E;
border-radius: 50%;
font-weight: bold;
```

---

# 🔤 Typography

| Type                | Style                          |
| ------------------- | ------------------------------ |
| Font                | 'Inter', 'Poppins', sans-serif |
| Page Title          | 800, #0B3D2E                   |
| Section Title       | 600, #1F2937                   |
| Body                | 400, #1F2937                   |
| Subtext             | 400, #6B7280                   |
| Line Height Body    | 1.5                            |
| Line Height Headers | 1.2                            |

---

# 📐 Layout System

## Spacing (8px Grid)

| Token | Value |
| ----- | ----- |
| xs    | 8px   |
| sm    | 16px  |
| md    | 24px  |
| lg    | 32px  |
| xl    | 48px  |
| xxl   | 64px  |

---

## Layout Rules

| Element         | Value       |
| --------------- | ----------- |
| Page padding    | 24px        |
| Card padding    | 24px        |
| Section spacing | 64px        |
| Grid gap        | 24px        |
| Border radius   | 10px / 16px |

---

# 🎬 Animations & Motion

**Use Framer Motion (recommended)**

## Page Transition

```js
initial={{ opacity:0, y:20 }}
animate={{ opacity:1, y:0 }}
```

## Card Hover

```js
whileHover={{ y: -2 }}
```

## Button Tap

```js
whileTap={{ scale: 0.97 }}
```

## Sidebar Animation

```js
initial={{ x:-80, opacity:0 }}
animate={{ x:0, opacity:1 }}
```

---

# 🧠 UX Rules (Very Important)

## 1. Visual Hierarchy

| Colour | Purpose           |
| ------ | ----------------- |
| Gold   | Actions (CTA)     |
| Green  | System / Platform |
| Navy   | Information       |
| Grey   | Background        |

---

## 2. Do NOT Overuse Gold

**Gold = Premium**
Use only for:

* CTA buttons
* Rewards
* Highlights

---

## 3. Consistency Rules

* Same border radius everywhere
* Same padding system
* Same shadows
* Same typography scale
* Follow 8px spacing grid
* Consistent gradients
* Consistent animation timings

