# Design System

A warm, friendly design system for Our Grocery List, featuring honey yellow backgrounds, rounded typography, and inviting colors.

## Color Palette

### Primary Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Honey Yellow** | `#F6D85E` | Primary background |
| **Warm Cream** | `#FFF6DF` | Surface/cards, form backgrounds |
| **Soft Blue** | `#3A78D8` | Primary actions (buttons, focus states) |
| **Fresh Green** | `#4CAF50` | Success states, completed checkbox |
| **Soft Mint** | `#DFF2E1` | Completed item backgrounds |

### Accent Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Basket Brown** | `#C98A3A` | Brand accent (reserved for future use) |
| **Muted Coral** | `#E57373` | Destructive actions, errors |

### Text Colors

| Color | Hex | Usage |
|-------|-----|-------|
| **Warm Charcoal** | `#3A2E1F` | Primary text |
| **Soft Brown-Gray** | `#6F6254` | Secondary text, notes |

### Borders & Dividers

| Color | Hex | Usage |
|-------|-----|-------|
| **Warm Sand** | `#EADFC8` | Borders, dividers, input outlines |

### Color Usage Rules

**DO:**
- Use Honey Yellow as the main background
- Use Soft Blue only for primary actions and focus states
- Use Fresh Green only for success indicators
- Use Warm Cream for all card surfaces
- Use no pure white or pure black

**DON'T:**
- Use yellow for buttons or actionable elements
- Mix multiple accent colors in the same component
- Use harsh, saturated colors
- Use red for errors (use Muted Coral instead)

## Typography

Typography rules and font usage live in `typography.md`.

## Tailwind Configuration

### Tailwind CSS v4 Setup

Colors are defined using the `@theme` directive in `index.css`:

```css
@theme {
  /* Colors */
  --color-honey: #F6D85E;
  --color-cream: #FFF6DF;
  --color-softblue: #3A78D8;
  --color-freshgreen: #4CAF50;
  --color-softmint: #DFF2E1;
  --color-basketbrown: #C98A3A;
  --color-mutedcoral: #E57373;
  --color-warmcharcoal: #3A2E1F;
  --color-softbrowngray: #6F6254;
  --color-warmsand: #EADFC8;
}
```

### Usage Examples

```jsx
// Background colors
<div className="bg-honey">       {/* Honey Yellow */}
<div className="bg-cream">       {/* Warm Cream */}
<div className="bg-softmint">    {/* Soft Mint */}

// Text colors
<p className="text-warmcharcoal">     {/* Primary text */}
<p className="text-softbrowngray">    {/* Secondary text */}

// Buttons and actions
<button className="bg-softblue text-cream">  {/* Primary button */}

```

## Design Principles

1. **Warm & Friendly**: Use rounded shapes, warm colors, and inviting typography
2. **Mobile-First**: Ensure touch-friendly targets and readable text sizes
3. **Accessible**: Maintain sufficient color contrast and clear visual hierarchy
4. **Consistent**: Apply colors and typography consistently across all components
5. **Simple**: Keep the design clean and uncluttered

## Accessibility

- All text meets WCAG AA contrast requirements
- Touch targets are minimum 44×44px
- Focus states are clearly visible with Soft Blue outlines
- Fonts are highly legible at all sizes
- Color is never the only indicator of meaning
