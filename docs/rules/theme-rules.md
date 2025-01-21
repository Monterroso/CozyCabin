# Theme Rules (MountainLodge)

This document outlines the styling choices for our chosen "MountainLodge" theme. It captures color palettes, typography, and core design principles used throughout CozyCabin.

## 1. Theme Overview

MountainLodge is designed to evoke warmth and natural calm, using earthy tones, subtle contrasts, and a sense of open space. It aligns with the responsive, animated UI approach, fostering a comfortable and inviting user experience.

---

## 2. Color Palette

| Name             | Hex      | Usage                 |
|------------------|----------|-----------------------|
| Lodge Brown      | #6B4E3E  | Primary UI elements (headers, critical buttons) |
| Pine Green       | #2E5D50  | Secondary elements (accents, icons)             |
| Cabin Cream      | #F2ECE4  | Background and neutral sections                 |
| Twilight Gray    | #777B7E  | Text, borders, subdued highlights               |
| Ember Orange     | #E17F43  | Highlights, status indicators, call-to-action   |

- Keep text at a high contrast against backgrounds.  
- Use color transitions sparingly for emphasis.

---

## 3. Typography

1. Font Families  
   - Primary Font: (e.g., "Inter", "Roboto", or your chosen system font)  
   - Secondary Font: (optional, for headings or calls to action)

2. Headings & Body  
   - Maintain a clear type scale (e.g., H1, H2, H3, etc.).  
   - Use bold weights sparingly for emphasis on headings.

3. Accessibility  
   - Adhere to minimum contrast ratios (WCAG AA at least).  
   - Keep line spacing comfortable (1.4+).

---

## 4. Layout & Spacing

1. Spacing System  
   - Base unit (e.g., 4px) for scale in Tailwind.  
   - Maintain consistency across margin, padding, and gap classes.

2. Breakpoints (Responsive)  
   - Mobile-first approach (small devices default).  
   - Common breakpoints (e.g., sm, md, lg, xl) from Tailwind's default config.

3. Component Alignment  
   - Keep UI sections aligned to a responsive maximum width.  
   - Use consistent spacing around modals, sidebars, and main content.

---

## 5. Interactive Components

1. Buttons  
   - Primary button: Lodge Brown background with Cabin Cream text.  
   - Secondary button: Pine Green background or subtle outlines.  
   - Hover & focus states: Slight darkening/lightening, or border emphasis.

2. Cards & Panels  
   - Use Cabin Cream for backgrounds with subtle shadows.  
   - Rounded corners for a comfortable aesthetic.  
   - Optional Pine Green accents for headings or highlight bars.

3. Animations & Transitions  
   - Short transitions (150–300ms) for hover states, modals, and panels.  
   - Easing functions that feel natural (e.g., ease-in-out).  
   - Maintain performance—avoid heavy GPU usage or large keyframe animations.

---

## 6. Component Design Principles

1. Accessibility in Mind  
   - Clear focus outlines (e.g., a Pine Green glow for form inputs).  
   - Large enough hit areas for interactive elements.  
   - Keyboard navigation thoroughly tested.

2. Reusability  
   - Create a library of base components (buttons, inputs, cards).  
   - Extend or theme them for specialized use cases (e.g., agent dashboard panels).

3. Minimal Custom Overrides  
   - Keep Tailwind utilities and shadcn components as the foundation.  
   - Document any advanced customization in design or dev notes.

---

## 7. Implementation in Code

1. Tailwind Configuration  
   - Extend the default theme in tailwind.config.js with MountainLodge palette variables.  
   - Maintain a consistent naming convention (e.g., "brown-500" for #6B4E3E).

2. Shadcn / Radix UI Integration  
   - Apply theme classes to shadcn components (e.g., <Button className="bg-lodge-brown ...">).  
   - Keep internal shadows and transitions consistent across the UI.

3. Zustand & Theme State  
   - Optionally store user preference for dark mode or text size if needed.  
   - Provide toggles or dynamic updates while respecting brand consistency.

---

## 8. Summary

MountainLodge is our core theme designed to be cozy, approachable, and highly functional. By applying the outlined color palette, typography, and interaction styles, we ensure a user experience that is both visually pleasing and aligned with the CozyCabin brand. Maintain consistent documentation and references to these rules to keep the UI clean, coherent, and easy to navigate. 