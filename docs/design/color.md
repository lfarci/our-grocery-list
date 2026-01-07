# Our Grocery List — Design Color System (Revised)

A warm, friendly, **commercial-ready** color system for *Our Grocery List*, balancing approachability with clarity and visual hierarchy.

This system keeps the original warmth while improving **readability**, **hierarchy**, and **long-session comfort**.

---

## Design Principles

- Warm but **not overwhelming**
- Clear visual hierarchy
- Backgrounds should stay **neutral**
- Accents should feel **intentional**
- Optimized for **daily, repeated use**

---

## Color Palette

### Core Surfaces

| Color | Hex | Usage |
|------|-----|------|
| **Warm Cream** | `#FFF6DF` | Primary app background |
| **Soft White Cream** | `#FFFCF3` | Cards, list items, inputs |
| **Honey Yellow** | `#F6D85E` | Brand accent, headers, highlights |

> Honey Yellow is no longer used as a full-screen background.  
> It is reserved for **branding and emotional accents**.

---

### Action & State Colors

| Color | Hex | Usage |
|------|-----|------|
| **Soft Blue** | `#3A78D8` | Primary actions, focus states |
| **Fresh Green** | `#4CAF50` | Success states, completed icons |
| **Soft Mint** | `#DFF2E1` | Completed item backgrounds |
| **Muted Coral** | `#E57373` | Errors, destructive actions |

---

### Text Colors

| Color | Hex | Usage |
|------|-----|------|
| **Warm Charcoal** | `#3A2E1F` | Primary text |
| **Soft Brown-Gray** | `#6F6254` | Secondary text, metadata |

---

### Borders & Dividers

| Color | Hex | Usage |
|------|-----|------|
| **Warm Sand** | `#EADFC8` | Borders, dividers, input outlines |

---

## Color Usage Rules

### ✅ DO

- Use **Warm Cream** as the main application background.
- Use **Soft White Cream** for cards and list items.
- Use **Honey Yellow** only for:
  - Page headers
  - Section highlights
  - Badges or counters
  - Empty states
- Use **Soft Blue** exclusively for:
  - Primary buttons
  - Focus rings
  - Active states
- Use **Soft Mint + Fresh Green** for completed items.
- Maintain generous spacing and soft shadows.

---

### ❌ DON’T

- Do **not** use Honey Yellow as a full-screen background.
- Do **not** use yellow for buttons or interactive controls.
- Do **not** mix multiple accent colors in the same component.
- Do **not** use pure white or pure black.
- Do **not** rely on color alone to convey state.

---

## Component Guidelines

### App Background

```jsx
<div className="bg-cream min-h-screen">
````

---

### Header / Brand Area

```jsx
<header className="bg-honey rounded-b-3xl p-6">
```

Use Honey Yellow sparingly to create a friendly, recognizable brand moment.

---

### Cards & List Items

```jsx
<div className="bg-softwhite rounded-xl shadow-sm px-4 py-3">
```

* Cards should float gently above the background.
* Avoid flat, border-only layouts.

---

### Completed Items

```jsx
<div className="bg-softmint text-softbrowngray">
```

* Use **Fresh Green** for checkmarks only.
* Text should become softer, not invisible.

---

### Inputs

```jsx
<input
  className="
    bg-softwhite
    border border-warmsand
    rounded-xl
    px-4 py-3
    text-warmcharcoal
    focus:outline-none
    focus:ring-2
    focus:ring-softblue
    shadow-sm
  "
/>
```

---

### Buttons (Primary)

```jsx
<button className="bg-softblue text-softwhite rounded-xl px-4 py-2">
```

---

## Tailwind Theme Configuration

```css
@theme {
  /* Core surfaces */
  --color-cream: #FFF6DF;
  --color-softwhite: #FFFCF3;
  --color-honey: #F6D85E;

  /* Actions & states */
  --color-softblue: #3A78D8;
  --color-freshgreen: #4CAF50;
  --color-softmint: #DFF2E1;
  --color-mutedcoral: #E57373;

  /* Text */
  --color-warmcharcoal: #3A2E1F;
  --color-softbrowngray: #6F6254;

  /* Borders */
  --color-warmsand: #EADFC8;
}
```

---

## Accessibility

* All text must meet **WCAG AA** contrast requirements.
* Completed states must be conveyed by:

  * color
  * iconography
  * text decoration (e.g. strikethrough)
* Focus states must always use **Soft Blue**.
* Avoid long reading on saturated backgrounds.
