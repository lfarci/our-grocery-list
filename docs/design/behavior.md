# Component Behavior & Interaction Guidelines

This document defines how UI components should **behave and react to user interactions** across devices (desktop, mobile, touch).  
The goal is to make *Our Grocery List* feel **alive, responsive, and intuitive**, while remaining simple and unobtrusive.

This is **not about adding features**, but about improving perceived quality and usability through motion and feedback.

---

## Design Principles for Interaction

- Interactions should feel **natural and immediate**
- Feedback must be **subtle but noticeable**
- Motion should **reinforce meaning**, never distract
- Every interaction must confirm:
  > “Yes, your action was registered”

---

## Interaction States (Global)

All interactive components may use the following states when relevant:

- `default`
- `hover` (desktop only)
- `active / pressed`
- `focus` (keyboard / accessibility)
- `disabled`
- `completed` (for list items)

---

## Desktop Interactions (Mouse & Trackpad)

### Hover Behavior (Very Important)

Hover effects should:
- Help identify what is interactive
- Improve scannability
- Never be aggressive or flashy

#### General Hover Rules
- Slight background change OR
- Slight elevation (shadow)
- Optional subtle scale (max `1.01`)

---

### List Items (Desktop)

**On hover:**
- Increase shadow slightly
- Optional very subtle background tint

```css
hover:
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08)
  transform: translateY(-1px)
````

**DO:**

* Use hover to confirm clickability
  **DON’T:**
* Change text color
* Animate position aggressively

---

### Buttons (Desktop)

**On hover:**

* Slightly darken the background
* Increase contrast, not size

```css
hover:
  filter: brightness(0.95)
```

**On active (click):**

* Brief “pressed” state
* Reduce shadow
* Slight downward movement (`translateY(1px)`)

---

### Inputs (Desktop)

**On hover:**

* Border becomes slightly more visible

**On focus:**

* Soft Blue focus ring
* No layout shift

---

## Mobile & Touch Interactions

Mobile has **no hover**, so feedback must happen on **tap**.

---

### List Items (Mobile)

**On tap (pressed state):**

* Brief background darkening
* No hover-style shadow

```css
active:
  background-color: rgba(0, 0, 0, 0.04)
```

**Optional:**

* Haptic feedback (if supported)

---

### Tap Feedback Rules

* Feedback must appear **immediately**
* Duration: `100–150ms`
* Must not block navigation

---

### Completed Items (Mobile)

When an item is marked as completed:

* Background transitions to Soft Mint
* Checkmark appears with a short fade or scale-in
* Text opacity slightly reduced

---

## Checkbox / Completion Interaction

### On Check

* Immediate visual feedback
* No delay or confirmation modal
* Optional micro-animation:

  * Checkmark fades in
  * Or scales from `0.9 → 1.0`

**DO:**

* Make completion feel satisfying
  **DON’T:**
* Add confetti, bounce, or playful effects

---

## Animations & Transitions

### General Motion Rules

* Use **ease-out** for entrances
* Use **ease-in-out** for state changes
* Keep animations short:

  * `150–250ms` for most transitions

---

### Allowed Transitions

* Background color
* Box-shadow
* Opacity
* Transform (small values only)

---

### Disallowed Transitions

* Large movements
* Rotations
* Long-running animations
* Continuous motion

---

## Disabled States

When a component is disabled:

* Reduce opacity (`~60%`)
* Remove hover effects
* Cursor should indicate non-interactive state

---

## Focus & Accessibility

### Focus States (Keyboard Navigation)

* Always visible
* Use Soft Blue focus ring
* Must not rely on color alone

```css
focus:
  outline: none
  box-shadow: 0 0 0 2px #3A78D8
```

---

## Error & Feedback States

### Errors

* Appear immediately
* Use Muted Coral
* Avoid shaking animations

---

### Success Feedback

* Subtle color change
* No popups or toasts for simple actions
* Visual confirmation is enough

---

## Performance & Restraint

* All interactions must feel **fast**
* Avoid reflows or layout jumps
* Prefer CSS transitions over JS animations

---

## Non-Goals

This document explicitly does **not** aim to:

* Add new features
* Introduce gamification
* Create playful or exaggerated animations
* Mimic social or entertainment apps

---

## Summary

* Desktop: hover = clarity + affordance
* Mobile: tap = immediate confirmation
* Motion: subtle, fast, purposeful
* Feedback: visible, calm, reassuring

The app should feel:

> **Simple, friendly, responsive — and quietly well-crafted**
