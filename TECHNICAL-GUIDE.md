# AI Agent Development Guide

## 🎯 Project Overview

**Dynamic UI Generator** is a revolutionary platform that automatically creates responsive, interactive UIs by analyzing any API endpoint. The system uses AI to interpret data structure and content, then generates adaptive web interfaces without manual coding.

**Core Concept**: "The UI builds itself — just give it an API."

## 🏗️ Architecture & Design Principles

### Server-Side First Architecture
- **True SSR**: All data fetching and AI generation happens server-side
- **Zero Client Loading**: No loading states - everything pre-rendered
- **Security First**: All AI-generated code is validated and sandboxed
- **Performance Optimized**: Next.js v15 caching with intelligent revalidation

### Key Components Flow
```
API Endpoint → Data Analysis → AI Generation → Secure Rendering → Interactive UI
```

## 📁 Codebase Structure

### Core Directories
```
src/
├── app/                          # Next.js v15 App Router
│   ├── page.tsx                  # Main dynamic UI generator
│   ├── ai-landing/[slug]/        # Dynamic landing page generator
│   ├── secure-ai-demo/           # Secure iframe implementation demo
│   └── layout.tsx                # App layout and global metadata
├── components/
│   ├── AIComponentRenderer.tsx   # Safe client-side AI component execution
│   ├── SecureAICodeRenderer.tsx  # Iframe-based secure rendering
│   ├── ReactRunnerRenderer.tsx   # react-runner implementation
│   └── ui/                       # Design system components (Button, Input)
├── lib/
│   ├── ai-generator.ts           # Core AI component generation logic
│   ├── security.ts               # Input validation & code sanitization
│   ├── types.ts                  # TypeScript interfaces and types
│   ├── utils.ts                  # Utility functions
│   └── data-fetchers/            # API integration utilities
├── docs/                         # Comprehensive documentation
└── database/                     # Database models and connections
```

### Critical Files for AI Agents

#### `/src/lib/ai-generator.ts`
- **Purpose**: Core AI component generation using OpenAI
- **Key Function**: `generateAIComponent(prompt, data, apiEndpoint)`
- **Security**: Validates and sanitizes all AI-generated code
- **Integration**: Works with any JSON API endpoint

#### `/src/lib/security.ts`
- **Purpose**: Security validation for AI-generated code
- **Functions**: Input sanitization, dangerous pattern detection
- **Critical**: NEVER bypass these security checks

#### `/src/lib/types.ts`
- **Purpose**: TypeScript definitions for the entire system
- **Key Interfaces**: 
  - `ComponentGenerationOptions`
  - `DataFetchOptions`
  - `AIGenerationResult`
  - `LandingPageType`

#### `/src/components/AIComponentRenderer.tsx`
- **Purpose**: Safe execution of AI-generated React components
- **Security**: Uses controlled execution context
- **Client Component**: Handles dynamic rendering with error boundaries

## 🔒 Security Requirements

### Mandatory Security Practices
1. **Input Validation**: All user inputs MUST be validated
2. **Code Sanitization**: AI-generated code MUST be sanitized
3. **Execution Sandboxing**: Use secure execution contexts
4. **No Direct Eval**: Never use `eval()` or unsafe `Function()` calls
5. **CSP Headers**: Implement Content Security Policy

### Security Functions to Use
```typescript
// From /src/lib/security.ts
validateAndSanitizeCode(code: string): boolean
detectDangerousPatterns(code: string): string[]
sanitizeInput(input: string): string
```

## 🎨 Design System

### Core Principles
- **Minimalist Modern**: Clean, professional aesthetics
- **Geist Typography**: Primary font family
- **Automatic Theming**: Light/dark mode support
- **Mobile-First**: Responsive design patterns
- **Monochromatic**: White/black with gray variations

### Component Variants
```typescript
// Button variants: primary, secondary, ghost, link
// Sizes: sm, md, lg, xl
// Input variants: default, ghost, filled
```

### CSS Variables
```css
--background: hsl(var(--background))
--foreground: hsl(var(--foreground))
--muted: hsl(var(--muted))
--muted-foreground: hsl(var(--muted-foreground))
```

## 🤖 AI Integration Patterns

### OpenAI Integration
- **Model**: GPT-4 for component generation
- **System Prompts**: Detailed prompts in `/src/lib/ai-generator.ts`
- **Context**: Provides data structure and design system guidelines
- **Output**: React components using `React.createElement()` syntax

### AI Generation Constraints
1. **No JSX Syntax**: Use `React.createElement()` calls
2. **No Import Statements**: Dependencies provided in execution context
3. **No Export Statements**: Components accessed by name
4. **Client Directive**: Use `'use client'` for interactive components
5. **Error Handling**: Include try-catch blocks for robustness

### Example AI Prompt Structure
```typescript
const systemPrompt = `
Generate a React component that:
1. Uses React.createElement() syntax (no JSX)
2. Follows the design system guidelines
3. Includes proper error handling
4. Uses 'use client' directive if interactive
5. Fetches data using useEffect and fetch API
`;
```

## 📊 Data Flow Patterns

### Server-Side Data Fetching
```typescript
// Pattern for new features
async function fetchDataAndGenerateAI(options: DataFetchOptions) {
  // 1. Fetch data from API
  const data = await fetchAPIData(options.apiEndpoint);
  
  // 2. Generate AI component
  const aiResult = await generateAIComponent(prompt, data, options.apiEndpoint);
  
  // 3. Return for server-side rendering
  return aiResult;
}
```

### Client-Side Rendering
```typescript
// Safe component execution
<AIComponentRenderer 
  code={aiGeneratedCode}
  data={fetchedData}
  onError={handleError}
/>
```

## 🚀 Development Guidelines

### Adding New Features
1. **Server Components First**: Start with server-side implementation
2. **Type Safety**: Define interfaces in `/src/lib/types.ts`
3. **Security Validation**: Use security utilities for all inputs
4. **Error Handling**: Implement comprehensive error boundaries
5. **Documentation**: Update relevant docs in `/docs/`

### API Integration
1. **Dynamic Endpoints**: Support any JSON API
2. **Data Analysis**: Let AI interpret data structure
3. **Adaptive UI**: Generate components that match data patterns
4. **Caching**: Use Next.js revalidation strategies

### Component Generation
1. **Design System Compliance**: Follow established patterns
2. **Responsive Design**: Mobile-first approach
3. **Accessibility**: Include ARIA attributes
4. **Performance**: Optimize for SSR and client hydration

## 🔧 Technical Stack

### Core Dependencies
- **Next.js v15**: App Router with SSR
- **React v19**: Latest React features
- **TypeScript**: Full type safety
- **Tailwind CSS**: Utility-first styling
- **OpenAI SDK**: AI component generation
- **class-variance-authority**: Component variants

### Development Tools
- **ESLint**: Code linting
- **Prettier**: Code formatting
- **TypeScript**: Type checking

## 📚 Documentation References

### Essential Reading
- `/docs/design-system.md` - Complete design system guide
- `/docs/components.md` - UI component documentation
- `/docs/ai-landing-pages.md` - Landing page generation guide
- `/docs/secure-ai-iframe-implementation.md` - Security implementation

### Code Examples
- `/src/app/page.tsx` - Main implementation example
- `/src/app/ai-landing/[slug]/page.tsx` - Dynamic routing pattern
- `/src/app/secure-ai-demo/page.tsx` - Security implementation

## ⚠️ Critical Constraints

### What NOT to Do
1. **Never bypass security validation**
2. **Don't use client-side data fetching for main features**
3. **Avoid breaking the design system patterns**
4. **Don't create loading states for server components**
5. **Never use unsafe code execution methods**

### What TO Do
1. **Always validate and sanitize inputs**
2. **Use server components for data fetching**
3. **Follow established type definitions**
4. **Implement proper error handling**
5. **Maintain design system consistency**

## 🎯 Success Criteria

### For New Features
- ✅ Server-side rendering with zero client loading
- ✅ Security validation for all inputs
- ✅ Design system compliance
- ✅ Type safety throughout
- ✅ Comprehensive error handling
- ✅ Performance optimization
- ✅ Mobile responsiveness

### For API Integration
- ✅ Support for any JSON API endpoint
- ✅ Intelligent data structure analysis
- ✅ Adaptive UI generation
- ✅ Real-time component creation
- ✅ Secure code execution

This guide ensures AI agents understand the codebase architecture, security requirements, and development patterns before making any modifications or additions to the project.
