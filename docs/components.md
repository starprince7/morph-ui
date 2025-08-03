# UI Components Documentation

## Overview

This document describes the reusable UI components built following the design system principles. The components use `class-variance-authority` for type-safe variant management and follow the established design patterns.

## Button Component

### Import
```tsx
import { Button } from '@/components/ui/Button';
// or
import { Button } from '@/components/ui';
```

### Variants

#### `variant` prop
- **`primary`** (default): Solid background with foreground color, inverted text
- **`secondary`**: Outlined style with subtle border and transparent background
- **`ghost`**: Transparent background with hover effects
- **`link`**: Text-only with underline on hover

#### `size` prop
- **`sm`**: Small button (h-8, px-3, text-sm)
- **`default`**: Standard button (h-10/h-12, px-4/px-5, responsive text)
- **`lg`**: Large button (h-12/h-14, px-6/px-8, responsive sizing)
- **`icon`**: Square button for icons (h-10, w-10)

### Usage Examples

```tsx
// Basic usage
<Button>Click me</Button>

// With variants
<Button variant="primary">Primary Action</Button>
<Button variant="secondary">Secondary Action</Button>
<Button variant="ghost">Ghost Button</Button>
<Button variant="link">Link Button</Button>

// Different sizes
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="icon">🚀</Button>

// With custom props
<Button 
  variant="primary" 
  size="lg" 
  onClick={() => console.log('clicked')}
  disabled={false}
>
  Submit Form
</Button>
```

### Props Interface
```tsx
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'link';
  size?: 'sm' | 'default' | 'lg' | 'icon';
  asChild?: boolean;
  className?: string;
}
```

## Input Component

### Import
```tsx
import { Input } from '@/components/ui/Input';
// or
import { Input } from '@/components/ui';
```

### Variants

#### `variant` prop
- **`default`**: Standard input with subtle border
- **`ghost`**: Transparent input that shows border on focus
- **`filled`**: Input with filled background (matches code block styling)

#### `size` prop
- **`sm`**: Small input (h-8, px-2, text-xs)
- **`default`**: Standard input (h-10, px-3, text-sm)
- **`lg`**: Large input (h-12, px-4, text-base)

### Usage Examples

```tsx
// Basic usage
<Input placeholder="Enter text..." />

// With variants
<Input variant="default" placeholder="Default input" />
<Input variant="ghost" placeholder="Ghost input" />
<Input variant="filled" placeholder="Filled input" />

// Different sizes
<Input size="sm" placeholder="Small input" />
<Input size="default" placeholder="Default input" />
<Input size="lg" placeholder="Large input" />

// Different input types
<Input type="email" placeholder="Email address" />
<Input type="password" placeholder="Password" />
<Input type="search" placeholder="Search..." />

// With controlled state
const [value, setValue] = useState('');
<Input 
  value={value} 
  onChange={(e) => setValue(e.target.value)}
  placeholder="Controlled input"
/>
```

### Props Interface
```tsx
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'filled';
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}
```

## Design System Alignment

### Colors
- Components automatically adapt to light/dark themes using CSS variables
- Hover states use the established color palette from the design system
- Focus states include accessible ring indicators

### Typography
- Buttons use the established font weights and sizes
- Inputs inherit the base font family and maintain consistent sizing
- All text follows the design system's letter spacing and line height rules

### Spacing
- Component padding and margins follow the established spacing scale
- Gap between elements uses consistent 16px, 24px, 32px increments
- Responsive sizing adapts appropriately across breakpoints

### Interactions
- Smooth `transition-colors` for all hover and focus states
- Consistent focus-visible ring styling for accessibility
- Disabled states with appropriate opacity and pointer-events handling

## Accessibility Features

- **Keyboard Navigation**: Full keyboard support with visible focus indicators
- **Screen Readers**: Proper semantic HTML elements and ARIA attributes
- **Color Contrast**: Meets WCAG guidelines in both light and dark modes
- **Focus Management**: Clear focus indicators and logical tab order

## Technical Implementation

### Dependencies
- `class-variance-authority`: Type-safe variant management
- `clsx`: Conditional class names
- `tailwind-merge`: Intelligent Tailwind class merging

### Utility Function
The `cn()` utility function combines `clsx` and `tailwind-merge` for optimal class name handling:

```tsx
import { cn } from '@/lib/utils';

// Usage in components
className={cn(baseClasses, variantClasses, userClasses)}
```

## Testing the Components

Visit `/components` to see a live showcase of all component variants and their usage examples. The showcase includes:

- All button variants and sizes
- All input variants and types
- Interactive examples
- Real-world usage scenarios

## Extending the Components

To add new variants:

1. Update the `cva` configuration with new variant options
2. Add corresponding Tailwind classes following the design system
3. Update the TypeScript interface
4. Test in both light and dark modes
5. Update this documentation

Example of adding a new button variant:
```tsx
const buttonVariants = cva(
  "base-classes...",
  {
    variants: {
      variant: {
        // existing variants...
        destructive: "bg-red-500 text-white hover:bg-red-600"
      }
    }
  }
);
```
