# Design System Documentation

## Overview

This Next.js application follows a **minimalist, modern design philosophy** with a focus on clean typography, subtle interactions, and adaptive theming. The design system is built on Tailwind CSS with custom CSS variables for theming and uses the Geist font family for a contemporary, technical aesthetic.

## Design Philosophy

### Core Principles
- **Minimalism**: Clean, uncluttered layouts with generous whitespace
- **Accessibility**: Dark/light mode support with system preference detection
- **Responsiveness**: Mobile-first approach with progressive enhancement
- **Typography-focused**: Strong emphasis on readable, well-spaced text
- **Subtle interactions**: Gentle hover effects and transitions

## Color System

### Light Theme
- **Background**: `#ffffff` (Pure white)
- **Foreground**: `#171717` (Near black)

### Dark Theme
- **Background**: `#0a0a0a` (Near black)
- **Foreground**: `#ededed` (Light gray)

### Interactive Elements
- **Primary Action**: Uses foreground color with background inversion
- **Secondary Action**: Subtle borders with transparent backgrounds
- **Hover States**: 
  - Light mode: `#383838` (dark gray) and `#f2f2f2` (light gray)
  - Dark mode: `#ccc` (light gray) and `#1a1a1a` (darker gray)

## Typography

### Font Stack
- **Primary**: Geist Sans - A modern, geometric sans-serif
- **Monospace**: Geist Mono - Technical, code-friendly monospace
- **Fallback**: Arial, Helvetica, sans-serif

### Typography Scale
- **Body text**: `text-sm` (14px) and `text-base` (16px)
- **Line height**: `text-sm/6` for improved readability
- **Letter spacing**: `-0.01em` for tighter, more refined spacing

## Layout System

### Grid Structure
The main layout uses CSS Grid with a three-row structure:
- **Header area**: 20px spacing
- **Main content**: Flexible area (`1fr`)
- **Footer area**: 20px spacing

### Spacing Scale
- **Component gaps**: 16px, 24px, 32px
- **Page padding**: 32px (mobile), 80px (desktop)
- **Internal spacing**: 8px, 16px for smaller elements

### Responsive Breakpoints
- **Mobile-first**: Base styles for mobile devices
- **Small screens and up** (`sm:`): 640px+
- **Medium screens and up** (`md:`): 768px+

## Component Patterns

### Buttons
Two primary button styles:

#### Primary Button
- **Style**: Rounded-full with solid background
- **Colors**: Background uses foreground color, text uses background color
- **Hover**: Subtle color shifts maintaining contrast
- **Padding**: `h-10 sm:h-12 px-4 sm:px-5`

#### Secondary Button
- **Style**: Rounded-full with border
- **Colors**: Transparent background with subtle border
- **Hover**: Light background tint
- **Border**: `border-black/[.08]` (light) / `border-white/[.145]` (dark)

### Links
- **Hover effect**: Underline with 4px offset
- **Icon integration**: 16px icons with 8px gap
- **Color**: Inherits text color

### Code Elements
- **Background**: Semi-transparent overlay (`bg-black/[.05]` / `bg-white/[.06]`)
- **Typography**: Geist Mono font
- **Padding**: `px-1 py-0.5`
- **Border radius**: Subtle rounding

## Visual Elements

### Icons
- **Size**: Consistent 16px and 20px sizing
- **Style**: Simple, outlined SVG icons
- **Adaptive**: Dark mode inversion for better contrast
- **Semantic**: Icons support content meaning (file, window, globe)

### Images
- **Logo treatment**: Dark mode inversion for brand consistency
- **Optimization**: Next.js Image component with priority loading
- **Accessibility**: Meaningful alt text and aria-hidden for decorative icons

## Interaction Design

### Hover States
- **Transitions**: `transition-colors` for smooth color changes
- **Feedback**: Subtle background and border color shifts
- **Consistency**: All interactive elements have hover states

### Focus States
- **Accessibility**: Browser default focus rings maintained
- **Keyboard navigation**: Full keyboard accessibility support

## Theme Implementation

### CSS Variables
Custom properties defined in `:root` for theme consistency:
```css
:root {
  --background: #ffffff;
  --foreground: #171717;
}
```

### Dark Mode
- **Detection**: `prefers-color-scheme: dark` media query
- **Automatic**: System preference-based switching
- **Consistency**: All components adapt automatically

## Technical Implementation

### Framework Stack
- **Next.js 15**: App Router with TypeScript
- **Tailwind CSS**: Utility-first styling with custom theme
- **PostCSS**: Build-time CSS processing
- **Google Fonts**: Geist font family integration

### Performance Considerations
- **Font optimization**: Variable fonts with subset loading
- **Image optimization**: Next.js Image component
- **CSS optimization**: Tailwind's purge system
- **Minimal bundle**: Clean, focused component structure

## Usage Guidelines

### Do's
- ✅ Use consistent spacing from the defined scale
- ✅ Maintain the established color relationships
- ✅ Follow the responsive patterns
- ✅ Use semantic HTML elements
- ✅ Test in both light and dark modes

### Don'ts
- ❌ Introduce arbitrary colors outside the system
- ❌ Break the established spacing rhythm
- ❌ Override font families without consideration
- ❌ Ignore responsive design patterns
- ❌ Add complex animations that distract from content

## Future Considerations

This design system provides a solid foundation for expansion while maintaining the core minimalist aesthetic. Future enhancements could include:
- Extended color palette for semantic states (success, warning, error)
- Additional typography scales for complex content
- Component library expansion
- Animation system for enhanced interactions
- Advanced theming options beyond light/dark modes
