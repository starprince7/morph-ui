'use client';

import { Button, Input } from './ui';
import { useState } from 'react';

export default function ComponentShowcase() {
  const [inputValue, setInputValue] = useState('');

  return (
    <div className="max-w-4xl mx-auto p-8 space-y-12">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold tracking-tight">UI Component Showcase</h1>
        <p className="text-foreground/70 max-w-2xl mx-auto">
          Demonstrating the Button and Input components built following the design system principles.
        </p>
      </div>

      {/* Button Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Button Components</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary">Primary Button</Button>
              <Button variant="secondary">Secondary Button</Button>
              <Button variant="ghost">Ghost Button</Button>
              <Button variant="link">Link Button</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <div className="flex flex-wrap items-center gap-4">
              <Button size="sm">Small</Button>
              <Button size="default">Default</Button>
              <Button size="lg">Large</Button>
              <Button size="icon">🚀</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">States</h3>
            <div className="flex flex-wrap gap-4">
              <Button>Normal</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </div>
      </section>

      {/* Input Variants */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Input Components</h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium mb-3">Variants</h3>
            <div className="grid gap-4 max-w-md">
              <Input 
                variant="default" 
                placeholder="Default input" 
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <Input 
                variant="ghost" 
                placeholder="Ghost input"
              />
              <Input 
                variant="filled" 
                placeholder="Filled input"
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Sizes</h3>
            <div className="grid gap-4 max-w-md">
              <Input size="sm" placeholder="Small input" />
              <Input size="default" placeholder="Default input" />
              <Input size="lg" placeholder="Large input" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">Types</h3>
            <div className="grid gap-4 max-w-md">
              <Input type="text" placeholder="Text input" />
              <Input type="email" placeholder="Email input" />
              <Input type="password" placeholder="Password input" />
              <Input type="search" placeholder="Search input" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium mb-3">States</h3>
            <div className="grid gap-4 max-w-md">
              <Input placeholder="Normal input" />
              <Input placeholder="Disabled input" disabled />
            </div>
          </div>
        </div>
      </section>

      {/* Usage Example */}
      <section className="space-y-6">
        <h2 className="text-2xl font-semibold">Usage Example</h2>
        <div className="p-6 border border-black/[.08] dark:border-white/[.145] rounded-lg space-y-4">
          <h3 className="text-lg font-medium">Contact Form</h3>
          <div className="grid gap-4 max-w-md">
            <Input placeholder="Your name" />
            <Input type="email" placeholder="Your email" />
            <Input variant="filled" placeholder="Subject" />
            <div className="flex gap-2">
              <Button variant="primary">Send Message</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
