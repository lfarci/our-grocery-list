# Color System

A warm, friendly color system for Our Grocery List, featuring honey yellow backgrounds and inviting accents.

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

## Color Usage Rules

**DO:**
- Use Honey Yellow as the main background.
- Use Soft Blue only for primary actions and focus states.
- Use Fresh Green only for success indicators.
- Use Warm Cream for all card surfaces.
- Use no pure white or pure black.

**DON'T:**
- Use yellow for buttons or actionable elements.
- Mix multiple accent colors in the same component.
- Use harsh, saturated colors.
- Use red for errors (use Muted Coral instead).

## Tailwind Configuration

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

## Usage Examples

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

## Accessibility

- Ensure text meets WCAG AA contrast requirements against Honey Yellow and Warm Cream.
- Do not rely on color alone to convey meaning.
- Use Soft Blue focus rings on interactive elements.
