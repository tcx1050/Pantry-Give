/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#17352C',
    tint: '#6B9B63',

    // Core surfaces
    background: '#F7F5EF',
    foreground: '#17352C',

    // Cards / elevated surfaces
    card: '#FFFFFF',
    cardForeground: '#17352C',

    // Primary action color (buttons, links, active states)
    primary: '#6B9B63',
    primaryForeground: '#ffffff',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#E7EFE8',
    secondaryForeground: '#17352C',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#EEF0E9',
    mutedForeground: '#6C7A70',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#F7C9BE',
    accentForeground: '#17352C',

    // Destructive actions (delete, error states)
    destructive: '#C95146',
    destructiveForeground: '#ffffff',

    // Borders and input outlines
    border: '#DCE3DA',
    input: '#DCE3DA',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
