# Typography System

## Overview

This project uses a two-font system designed to be warm, friendly, and highly legible on mobile and desktop devices. The typography creates a cozy, food-friendly feel without being corporate or childish.

## Font Families

### Primary Font: Nunito

**Usage:** All body text, form labels, input fields, buttons, item names, and UI elements.

**Weights:**
- Regular (400) - Default text, notes, descriptions
- SemiBold (600) - Labels, item names, emphasis
- Bold (700) - Reserved for special cases

**Characteristics:**
- Rounded, friendly letterforms
- Highly legible on mobile screens
- Excellent readability at small sizes
- Supports a wide range of characters

**Implementation:**
```css
font-family: 'Nunito', system-ui, -apple-system, sans-serif
```

**Tailwind classes:**
- `font-sans` - Applies Nunito as the default sans-serif font
- `font-normal` - Regular (400)
- `font-semibold` - SemiBold (600)
- `font-bold` - Bold (700)

### Display Font: Baloo 2

**Usage:** App title, section headers, and empty state messages only. Used sparingly for visual hierarchy.

**Weight:**
- Bold (700) - The only weight loaded for this font

**Characteristics:**
- Playful, rounded letterforms
- Strong visual presence
- Food-friendly and inviting
- Creates contrast with Nunito

**Implementation:**
```css
font-family: 'Baloo 2', system-ui, -apple-system, sans-serif
```

**Tailwind classes:**
- `font-display` - Applies Baloo 2

## Typography Scale

The app uses Tailwind's default typography scale with the following common sizes:

- `text-3xl` - Main app title (h1)
- `text-lg` - Empty state message
- `text-base` - Default body text, item names
- `text-sm` - Form labels, notes, helper text

## Usage Guidelines

### DO:
- Use Nunito for all UI elements, form fields, and item text
- Use Baloo 2 for the main heading and empty state message
- Use SemiBold (600) for item names, labels, and buttons
- Use Regular (400) for body text, notes, and descriptions
- Keep the typography simple and consistent

### DON'T:
- Mix fonts within the same text element
- Use Bold (700) excessively - reserve for special emphasis
- Add additional fonts beyond Nunito and Baloo 2
- Use ultra-thin weights or script fonts
- Override font-family on individual components without good reason

## Component-Specific Typography

### Main Heading (`GroceryList.tsx`)
- Font: Baloo 2
- Class: `font-display text-3xl font-bold`
- Purpose: Creates strong brand presence

### Form Labels (`AddItemForm.tsx`)
- Font: Nunito
- Class: `font-semibold text-sm`
- Purpose: Clear, readable labels

### Form Buttons (`AddItemForm.tsx`)
- Font: Nunito
- Class: `font-semibold`
- Purpose: Clear call-to-action

### Item Names (`GroceryItem.tsx`)
- Font: Nunito
- Class: `font-semibold`
- Purpose: Emphasis and clarity

### Item Notes (`GroceryItem.tsx`)
- Font: Nunito
- Class: `text-sm`
- Purpose: Secondary information

### Empty State (`GroceryItemsList.tsx`)
- Font: Baloo 2
- Class: `font-display text-lg`
- Purpose: Friendly, inviting message

### Error Messages (`ErrorMessage.tsx`)
- Font: Nunito
- Class: `font-semibold text-sm`
- Purpose: Clear, urgent communication

## Accessibility

Both fonts provide:
- High legibility at various sizes
- Clear differentiation between characters (e.g., 1, l, I)
- Good contrast for readability
- Support for common diacritics and special characters

The font system ensures that text remains readable for users with:
- Low vision (clear letterforms, good x-height)
- Dyslexia (rounded, friendly shapes with clear spacing)
- Mobile devices (optimized for small screens)

## Font Loading

Fonts are loaded via Google Fonts with the following optimizations:

1. **Preconnect:** DNS resolution and connection setup for Google Fonts
2. **Display Swap:** Ensures text remains visible during font loading
3. **Minimal Weights:** Only loads necessary font weights (400, 600, 700 for Nunito; 700 for Baloo 2)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@700&family=Nunito:wght@400;600;700&display=swap" rel="stylesheet" />
```

## Fallback Fonts

Both font families include system font fallbacks:

```
system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
```

This ensures the app remains usable even if Google Fonts fails to load.

## Future Considerations

- Consider self-hosting fonts for improved performance and privacy
- Monitor font loading performance in production
- Evaluate if additional weights are needed as the app evolves
- Consider variable fonts for more flexibility and smaller file sizes
