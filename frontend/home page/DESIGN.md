---
name: FitJone AI Precision
colors:
  surface: '#0f1418'
  surface-dim: '#0f1418'
  surface-bright: '#343a3e'
  surface-container-lowest: '#0a0f12'
  surface-container-low: '#171c20'
  surface-container: '#1b2024'
  surface-container-high: '#252b2e'
  surface-container-highest: '#303539'
  on-surface: '#dee3e8'
  on-surface-variant: '#bdc8d1'
  inverse-surface: '#dee3e8'
  inverse-on-surface: '#2c3135'
  outline: '#87929a'
  outline-variant: '#3e484f'
  surface-tint: '#7bd0ff'
  primary: '#8ed5ff'
  on-primary: '#00354a'
  primary-container: '#38bdf8'
  on-primary-container: '#004965'
  inverse-primary: '#00668a'
  secondary: '#a4c9ff'
  on-secondary: '#00315d'
  secondary-container: '#0267b8'
  on-secondary-container: '#d6e5ff'
  tertiary: '#becee4'
  on-tertiary: '#233143'
  tertiary-container: '#a3b2c7'
  on-tertiary-container: '#364557'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#c4e7ff'
  primary-fixed-dim: '#7bd0ff'
  on-primary-fixed: '#001e2c'
  on-primary-fixed-variant: '#004c69'
  secondary-fixed: '#d4e3ff'
  secondary-fixed-dim: '#a4c9ff'
  on-secondary-fixed: '#001c39'
  on-secondary-fixed-variant: '#004883'
  tertiary-fixed: '#d4e4fa'
  tertiary-fixed-dim: '#b9c8de'
  on-tertiary-fixed: '#0d1c2d'
  on-tertiary-fixed-variant: '#39485a'
  background: '#0f1418'
  on-background: '#dee3e8'
  surface-variant: '#303539'
  background-deep: '#07111F'
  surface-glass: rgba(15, 23, 42, 0.6)
  text-primary: '#dee3e8'
  text-muted: '#bdc8d1'
  accent-glow: '#8ed5ff'
typography:
  display-lg:
    fontFamily: Space Grotesk
    fontSize: 72px
    fontWeight: '700'
    lineHeight: '1.0'
    letterSpacing: -0.04em
  display-lg-mobile:
    fontFamily: Space Grotesk
    fontSize: 48px
    fontWeight: '700'
    lineHeight: '1.1'
    letterSpacing: -0.04em
  headline-md:
    fontFamily: Space Grotesk
    fontSize: 36px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  headline-sm:
    fontFamily: Space Grotesk
    fontSize: 28px
    fontWeight: '600'
    lineHeight: '1.2'
    letterSpacing: -0.02em
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  label-md:
    fontFamily: JetBrains Mono
    fontSize: 13px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '500'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  xs: 4px
  base: 4px
  sm: 8px
  md: 16px
  lg: 24px
  xl: 32px
  2xl: 48px
  3xl: 64px
  gutter: 24px
  container-max: 1280px
---

## Brand & Style

FitJone is a high-performance AI fitness companion designed for users who value technical precision and futuristic aesthetics. The brand personality is **innovative, authoritative, and sleek**, evoking the feeling of a premium laboratory or a high-end sports car dashboard.

The visual style is a sophisticated blend of **Glassmorphism** and **Modern Tech**. It utilizes deep obsidian backgrounds, vibrant electric blue accents, and translucent "glass" panels with heavy backdrop blurs. The interface feels "alive" through the use of subtle floating animations, parallax background effects, and soft glowing gradients that suggest the processing power of artificial intelligence.

## Colors

The palette is built on a "Midnight Technical" foundation. The primary background uses a very deep navy-black (`#07111F`) to maximize contrast for the neon-inspired primary accents.

- **Primary (`#38bdf8`):** An electric sky blue used for core interactions, icons, and primary buttons.
- **Secondary (`#60a5fa`):** A slightly deeper blue used for supporting UI elements and form analysis feedback.
- **Gradients:** The interface frequently uses a "Hyper-Link" gradient (`#8ed5ff` to `#38bdf8`) for headlines and high-priority text to create a sense of depth and motion.
- **Surface Tones:** Instead of flat grays, the UI uses tinted neutrals (`#1b2024`) and semi-transparent glass layers to maintain a high-tech atmosphere.

## Typography

The typography strategy uses a tripartite font system to reinforce the brand's technical nature:

1.  **Display (Space Grotesk):** Used for headlines. Its geometric and slightly eccentric letterforms provide a "futuristic" and "cutting-edge" feel.
2.  **Body (Inter):** A clean, utilitarian sans-serif chosen for maximum legibility in workout instructions and descriptive text.
3.  **Labels/Mono (JetBrains Mono):** Used for micro-copy, data points, and technical metadata. The monospaced nature emphasizes precision and "code-like" accuracy.

**Key Rule:** Large headlines should use negative letter spacing to feel tighter and more impactful, while small labels should use increased tracking for readability.

## Layout & Spacing

The layout follows a **Fixed Grid** approach for desktop, centering content within a 1280px container, while transitioning to a fluid model for mobile.

- **Rhythm:** A 4px/8px base unit system is used to maintain strict vertical rhythm.
- **Margins:** Desktop views utilize a 24px gutter, while mobile views push content closer to the edge with a 16px safe area.
- **Sectioning:** Large vertical gaps (64px+) are used between sections to allow the background gradients and blurs to "breathe" and prevent visual clutter.
- **Responsive Behavior:** On mobile, side-by-side elements (like the hero text and mockup) reflow into a single column, with display typography scaling down by roughly 30% for accessibility.

## Elevation & Depth

Depth is conveyed through **Light and Transparency** rather than traditional physical shadows.

- **Layer 0 (Background):** Deep `#07111F` with fixed parallax imagery and atmospheric glows.
- **Layer 1 (Glass Panels):** Semi-transparent surfaces (`rgba(15, 23, 42, 0.6)`) with a 12px blur. These layers use a very thin 1px border (`rgba(255, 255, 255, 0.05)`) to define edges without adding weight.
- **Layer 2 (Floating UI):** Elements that sit above the glass panels use subtle "ambient glows" (e.g., `0 0 20px rgba(56, 189, 248, 0.2)`) instead of black shadows, suggesting they are illuminated from within.
- **Interactions:** Hover states should trigger a "glow expansion" and a slight scale-up (1.05x) to provide tactile feedback.

## Shapes

The shape language is primarily **Soft and Geometric**, utilizing a mix of radii to differentiate component types:

- **Buttons & Small Inputs:** 0.25rem (Soft) - Provides a crisp, professional look.
- **Cards & Glass Panels:** 0.75rem (xl) - Creates a softer, more modern container feel.
- **Device Mockups & Featured Elements:** High-radius (e.g., 3rem/full) to represent hardware or distinct organic sections.
- **Decorative Accents:** Ultra-thin 1px horizontal lines are used as "prefix" markers for section labels to lead the eye.

## Components

### Buttons
- **Primary:** Filled with `#38bdf8` (or gradient), text is high-contrast dark. Features a hover glow and 1.05x scale transition.
- **Outline:** 1px border using `outline-variant/50`, transparent background. Borders should animate to primary color on hover.
- **Typography:** Always uses `label-md` (JetBrains Mono) in uppercase with wide tracking for a technical look.

### Glass Panels (Cards)
- Must include `backdrop-filter: blur(12px)` and a subtle white border at 5-10% opacity.
- Padding should be generous (24px) to emphasize the content inside.

### Lists & Navigation
- Horizontal links use `body-md` with a transition to full white on hover.
- Active states are indicated by a background shift to `surface-container-high/50` with rounded-md corners.

### Status Indicators (Chips)
- Utilize the `label-sm` font.
- Often paired with a `material-symbols-outlined` icon to the left for quick scanning.

### Input Fields (Conceptual)
- Should follow the "Outline" button style: dark, semi-transparent background, subtle border, and monospaced input text.