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

### Font Families

**Nunito** - Body font for all UI elements, forms, and content
- Weights: Regular (400), SemiBold (600), Bold (700)
- Class: `font-sans`

**Baloo 2** - Display font for headings and emphasis
- Weight: Bold (700)
- Class: `font-display`

### Typography Scale

| Size | Class | Usage |
|------|-------|-------|
| 30px | `text-3xl` | Main app title |
| 18px | `text-lg` | Empty state, subheadings |
| 16px | `text-base` | Body text, item names |
| 14px | `text-sm` | Labels, notes, helper text |

### Component Typography

| Component | Font | Weight | Size |
|-----------|------|--------|------|
| App title | Baloo 2 | Bold | text-3xl |
| Form labels | Nunito | SemiBold | text-sm |
| Buttons | Nunito | SemiBold | text-base |
| Item names | Nunito | SemiBold | text-base |
| Item notes | Nunito | Regular | text-sm |
| Empty state | Baloo 2 | Bold | text-lg |
| Error messages | Nunito | SemiBold | text-sm |

## Tailwind Configuration

### Tailwind CSS v4 Setup

Colors and fonts are defined using the `@theme` directive in `index.css`:

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
  
  /* Fonts */
  --font-sans: 'Nunito', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --font-display: 'Baloo 2', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
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

// Typography
<h1 className="font-display text-3xl">   {/* Display heading */}
<p className="font-sans font-semibold">  {/* Body text */}
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
