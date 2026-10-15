# Design System — Toko Sayur Alkadi

> Fresh, natural, clear, and easy to use.

## Design Identity

**Product:** Toko Sayur Alkadi  
**Interface:** Fresh vegetable store website and store-management dashboard  
**Visual direction:** Light, fresh botanical, friendly, and practical  
**Core principles:** Clear hierarchy, consistent visual patterns, readable content, accessible interactions, and restrained use of color.

The interface should feel like a modern neighborhood vegetable store: fresh and welcoming, while remaining organized and efficient for shopping and daily operations. Use generous but purposeful whitespace, clear contrast, consistent component styling, and natural imagery of fresh vegetables. Avoid clinical supplement-brand visuals or unrelated decorative elements.

## Brand Color Palette

Use the four Alkadi brand colors as the primary visual identity. Neutral colors may be used for readable text, surfaces, and borders.

| Name | Value | Intended use |
|---|---|---|
| Fresh Background | `#E8F5E9` | Main page background and subtle section surfaces |
| Leaf Green | `#A5D6A7` | Active navigation, soft highlights, secondary emphasis |
| Fresh Green | `#66BB6A` | Accent details, selected indicators, and small visual emphasis |
| Forest Green | `#1B5E20` | Primary actions, important links, strong headings, and dark navigation surfaces |
| White | `#FFFFFF` | Cards, tables, forms, dialogs, and clean content surfaces |
| Soft Border | `#C8E6C9` | Subtle borders and separators |
| Body Text | `#263328` | Main text on light surfaces |
| Muted Text | `#607064` | Supporting text, captions, metadata, and descriptions |

### Color Usage Rules

- Use `#1B5E20` for primary buttons, important actions, prominent links, and dark green navigation surfaces.
- Use `#66BB6A` as an accent, not as the default color for small text. Prefer dark text over this color for legibility.
- Use `#A5D6A7` for active states, subtle highlights, and selected elements. Do not use it as small text on a light background.
- Use `#E8F5E9` as a soft page or section background rather than applying it to every surface.
- Keep cards, tables, dialogs, and forms predominantly white with subtle borders.
- Do not introduce unrelated brand colors such as neon lime, decorative purple, or decorative blue.
- Semantic colors may be used sparingly for operational states: green for success/available, amber for pending/attention, and red for errors/destructive actions. Always pair status colors with a text label or meaningful icon.

## Design Tokens

Use these values as visual references. Adapt them to the project's existing theme tokens instead of replacing the current styling configuration blindly.

```css
:root {
  /* Alkadi brand palette */
  --color-alkadi-background: #E8F5E9;
  --color-alkadi-soft: #A5D6A7;
  --color-alkadi-accent: #66BB6A;
  --color-alkadi-primary: #1B5E20;

  /* Neutral surfaces and text */
  --color-surface: #FFFFFF;
  --color-border-soft: #C8E6C9;
  --color-text: #263328;
  --color-muted: #607064;

  /* Spacing and shape references */
  --spacing-unit: 8px;
  --radius-control: 8px;
  --radius-card: 12px;
  --radius-large-card: 16px;
}
```

## shadcn/ui Theme Guidance

The shadcn/ui components are already provided in the project. Reuse the existing components and their current styling conventions. Map the Alkadi palette to the project's existing theme variables where appropriate; do not recreate, reinstall, or replace components that are already available.

| Theme token | Recommended visual role |
|---|---|
| `--background` | `#E8F5E9` |
| `--foreground` | `#263328` |
| `--card` | `#FFFFFF` |
| `--card-foreground` | `#263328` |
| `--popover` | `#FFFFFF` |
| `--popover-foreground` | `#263328` |
| `--primary` | `#1B5E20` |
| `--primary-foreground` | `#FFFFFF` |
| `--secondary` | `#A5D6A7` |
| `--secondary-foreground` | `#1B5E20` |
| `--accent` | `#A5D6A7` |
| `--accent-foreground` | `#1B5E20` |
| `--muted` | `#E8F5E9` |
| `--muted-foreground` | `#607064` |
| `--border` | `#C8E6C9` |
| `--input` | `#C8E6C9` |
| `--ring` | `#66BB6A` |

Treat these as design recommendations, not instructions to blindly replace CSS values. Preserve the project's current Tailwind and shadcn/ui version, existing CSS variable format, component APIs, and established conventions.

## Tokens — Typography

### Geist Sans — Primary typeface — used for UI, headings, body, navigation, and buttons. Use the existing `--font-geist-sans` font variable provided by the application; do not add or rename font variables.
- **Weights:** Use the weights available through the existing Geist font configuration. Prefer regular weights for body text and medium or semibold weights for hierarchy and emphasis.
- **Sizes:** 10px, 12px, 14px, 16px, 18px, 20px, 24px, 32px, 36px, 40px, 48px
- **Line height and letter spacing:** Follow the existing type scale below; keep body text comfortably readable and display text clear rather than tightly compressed.
- **Role:** The application's existing sans-serif family for all interface text. Establish hierarchy with size, spacing, and restrained weight changes.

### Geist Mono — Monospaced companion for product codes, inventory identifiers, and tabular data. Use the existing `--font-geist-mono` font variable provided by the application; do not add or rename font variables.
- **Weights:** Use the weights available through the existing Geist Mono font configuration.
- **Sizes:** 12px, 16px
- **Line height:** 1.50
- **Role:** Use selectively for codes and data that benefit from aligned characters; use the primary sans-serif family for normal product and interface copy.

### Type Scale

| Role | Family | Weight | Size | Line Height | Letter Spacing | Token |
|------|--------|--------|------|-------------|----------------|-------|
| micro | Geist Sans | — | 10px | 1 | 0px | `--text-micro` |
| label | Geist Sans | — | 12px | 1.5 | 0px | `--text-label` |
| caption | Geist Sans | — | 14px | 1.4 | 0px | `--text-caption` |
| body-sm | Geist Sans | — | 16px | 1.5 | 0px | `--text-body-sm` |
| body | Geist Sans | — | 18px | 1.3 | -0.18px | `--text-body` |
| subheading | Geist Sans | — | 24px | 1.2 | -0.48px | `--text-subheading` |
| heading-sm | Geist Sans | — | 32px | 1.5 | 0px | `--text-heading-sm` |
| heading | Geist Sans | — | 36px | 1 | 0px | `--text-heading` |
| heading-lg | Geist Sans | — | 40px | 1.1 | -0.4px | `--text-heading-lg` |
| display | Geist Sans | — | 48px | 1.1 | -0.72px | `--text-display` |

## Spacing, Shape, and Layout

- **Base spacing unit:** 8px.
- **Page padding:** 16px on small screens; 24–32px on medium and large screens.
- **Spacing between major components:** 16–24px.
- **Card padding:** 16–24px, adjusted to content density.
- **Input radius:** approximately 8px.
- **Button radius:** 8–10px. Reserve pill shapes for badges or controls where they make sense.
- **Card radius:** 12–16px.
- **Borders:** thin and subtle, using `#C8E6C9` or the existing border token.
- **Shadows:** minimal or none. Prefer surface contrast and borders over heavy elevation.
- **Responsive behavior:** content, cards, forms, and data tables must remain usable on small screens. Avoid clipped controls, overlapping actions, and unnecessary horizontal scrolling.
- **Consistency:** use the spacing, radius, and sizing conventions already established by the supplied components.

## Mobile-First and Responsive Design
  Every design created or updated for Toko Sayur Alkadi must be fully responsive and work well on mobile phones, tablets, laptops, and desktop screens. Use a mobile-first approach: begin with a clear, usable small-screen layout, then progressively enhance spacing, columns, and visual density for larger screens. Do not treat mobile support as an optional refinement or create a desktop-only design.
  On small screens, keep text readable, prevent horizontal page overflow, provide comfortable touch targets, and ensure buttons, inputs, menus, dialogs, and other interactive elements remain easy to use. Stack content vertically when needed, reduce unnecessary padding, and adapt multi-column layouts into fewer columns without losing important information. Images must resize and crop appropriately, while headings and long labels should wrap naturally rather than overlap or become clipped.
  Navigation must remain accessible on mobile. Reuse the existing responsive navigation components, such as the supplied Sheet or Sidebar patterns, where appropriate instead of creating duplicate components. Forms should fit the viewport, tables should use a suitable compact or controlled-overflow presentation, and dialogs or sheets should not extend beyond the visible screen. Preserve the same brand colors, hierarchy, component behavior, and visual consistency across every breakpoint.
  Test every page and component at narrow mobile widths as well as tablet and desktop widths. Check for overlapping content, clipped text, inaccessible controls, awkward image crops, excessive scrolling, and buttons that are too small to tap. All states—including loading, empty, validation, success, and error states—must also remain clear and usable on mobile.

## Component Styling Principles

All required UI components are already provided. Use the existing shadcn/ui components and existing application components instead of building duplicates. Keep component behavior, variants, imports, and established project conventions intact. Apply design changes through supported props, existing variants, and theme tokens wherever possible.

- **Buttons:** Use the existing `Button` component and variants for primary, secondary, outline, ghost, and destructive actions.
- **Cards:** Use the existing card components to group related information, such as summaries, product details, order information, and forms.
- **Forms:** Use the provided inputs, labels, selects, checkboxes, radio controls, and text areas. Keep labels visible and validation messages close to the relevant fields.
- **Tables:** Use the supplied table components for operational data, with clear headers, comfortable row spacing, and consistent action placement.
- **Badges:** Use the existing badge component for compact statuses and categories.
- **Dialogs and sheets:** Reuse existing dialog, alert dialog, and sheet components for confirmations and responsive panels.
- **Menus and tabs:** Keep dropdown actions and related content groups consistent with the existing menu and tab components.
- **Loading and feedback:** Reuse the supplied skeleton, toast/notification, and loading patterns where available.
- **Icons:** Use the icon library already installed in the project. Keep icon size and stroke weight consistent; do not add a new icon dependency or use icons alone for important actions.

## Buttons and Actions

### Primary actions

- Use Forest Green (`#1B5E20`) with white text for the most important action in a section.
- Examples include **Add Product**, **Save Changes**, and **Place Order**.
- Keep controls around 40–44px high where appropriate.
- Provide visible hover, focus, disabled, and loading states using the existing component variants and patterns.
- Avoid presenting several equally prominent primary buttons in the same area.

### Secondary and destructive actions

- Use a white or transparent surface, Forest Green text, and a subtle border for secondary actions such as **Cancel** or **Back**.
- Use the existing destructive variant for actions such as deleting records.
- Ask for confirmation before consequential or difficult-to-reverse actions.

## Forms and Inputs

- Prefer white input surfaces, dark text, subtle borders, and an approximately 8px radius.
- Keep labels visible; do not rely on placeholder text as the only label.
- Show validation feedback near the field that needs attention.
- Use a clear and consistent focus ring.
- Keep required-field indicators, helper text, and error messages consistent throughout the interface.
- Prevent repeated submissions while a request is processing and provide useful success or error feedback.

## Cards and Information Surfaces

- Use white surfaces, subtle borders, and 12–16px corner radii.
- Group related content instead of turning every small element into a separate card.
- Use consistent padding and align card titles, supporting text, and actions.
- Use shadows only when needed and only if they match the existing visual language.
- Make information priority clear through typography, spacing, and alignment rather than excessive decoration.

## Badges and Status Indicators

- Keep status labels short and easy to scan.
- Use green for successful or available states, amber for pending or attention-needed states, and red for failed, cancelled, or destructive states.
- Maintain sufficient contrast between badge text and its background.
- Never communicate status through color alone; include a text label or an appropriate accessible icon.
- Low-stock states should be explicit, such as **Low Stock**, rather than indicated only by a colored dot.

## Data Tables

- Use the existing table component and styling conventions.
- Give column headers clear contrast and concise labels.
- Maintain comfortable row spacing and align related values consistently.
- Keep row actions in a predictable location, such as a dedicated actions column or the existing dropdown menu.
- Include appropriate loading, empty, and error states; use pagination when needed.
- On narrow screens, use a responsive presentation or controlled horizontal overflow rather than allowing the table to break the page layout.

## Product Imagery

- Use relevant, natural-looking photographs of vegetables actually represented in the catalog, such as spinach, carrots, tomatoes, chilies, and potatoes.
- Prefer natural lighting, realistic vegetable colors, simple backgrounds, and consistent image crops.
- Avoid supplement packaging, laboratory imagery, unrelated stock photography, and decorative visuals unrelated to a vegetable store.
- Do not use emoji as a replacement for product photography in the main catalog.
- Provide appropriate alternative text and optimized image sizes.
- When a product image is missing or fails to load, show a consistent fallback that matches the existing interface.

## Accessibility and Interaction

- Maintain readable contrast, especially for text placed over `#A5D6A7` and `#66BB6A`.
- Ensure controls can be used with a keyboard and retain a visible focus indicator.
- Give icon-only buttons an accessible name; use a tooltip where it improves clarity.
- Do not rely on color alone to communicate status, validation, or selection.
- Make hover, focus, disabled, loading, success, and error states visually distinguishable.
- Provide feedback when an action succeeds, fails, or is still processing.
- Use the existing loading indicators and skeleton patterns instead of inventing a new loading style for each screen.
- Keep layouts usable across mobile, tablet, and desktop sizes.

## Do's and Don'ts

### Do

- Apply the four Alkadi brand colors consistently.
- Use `#1B5E20` for primary actions and important emphasis.
- Use `#E8F5E9` for soft page backgrounds and `#FFFFFF` for cards and forms.
- Reuse the supplied shadcn/ui components and existing application components.
- Keep typography, spacing, borders, radii, and interaction states consistent.
- Use relevant vegetable imagery and clear product information.
- Design for accessibility and responsive behavior.
- Show clear loading, empty, success, and error states.

### Don't

- Do not retain unrelated legacy brand names, palettes, or supplement-related visual language.
- Use the old brand colors such as `#1c3a13` or `#d3fa99` as replacements for Alkadi's palette.
- Use laboratory or supplement-product imagery.
- Add heavy shadows, decorative gradients, or too many competing colors.
- Rebuild components that are already supplied in the project.
- add new component or icon libraries when the existing components already meet the need.
- Replace the existing theme setup or component conventions without a clear requirement.
- Use color alone to explain a status or interaction state.

## Implementation Prompt

> Design the Toko Sayur Alkadi interface with a fresh, natural, clean, and practical visual style. Use the brand palette `#E8F5E9`, `#A5D6A7`, `#66BB6A`, and `#1B5E20`, supported by white surfaces, subtle borders, and readable dark text. Reuse all shadcn/ui components and application components already provided in the project; do not recreate or reinstall them. Focus on visual design, typography, spacing, responsive layouts, accessible interaction states, and consistent component styling. Use natural vegetable imagery relevant to the store. Preserve existing component APIs, theme conventions, and project styling configuration. Do not introduce unrelated colors, heavy shadows, decorative gradients, or supplement-brand visuals.

## Quick Reference

- **Primary:** `#1B5E20`
- **Accent:** `#66BB6A`
- **Soft green:** `#A5D6A7`
- **Page background:** `#E8F5E9`
- **Card and form surface:** `#FFFFFF`
- **Soft border:** `#C8E6C9`
- **Primary text:** `#263328`
- **Muted text:** `#607064`
- **Card radius:** 12–16px
- **Input radius:** 8px
- **Base spacing unit:** 8px
- **UI components:** reuse the components already provided in the project
