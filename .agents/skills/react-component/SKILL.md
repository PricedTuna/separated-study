---
name: react-component
description: Generate React components following the project convention. Every component gets its own file with an exported props interface and a function component. Use when writing or reviewing a new React component, or when asked to create a component.
license: MIT
---

# React Component Generation

## When to Use This Skill

Apply when creating a new React component in this project. Every component gets **its own file** under `src/components/`, organized into subdirectories by domain (`ui/`, `cards/`, `documents/`, `layouts/`, `study/`).

## Component Structure

Every component uses this pattern:

```tsx
interface MyComponentProps {
  // props here
}

export const MyComponent = (props: MyComponentProps) => {
  return (
    // JSX here
  );
};
```

- File name must match the component name exactly (e.g. `MyComponent.tsx` contains `export const MyComponent`).
- Props interface uses the name `{ComponentName}Props` — always exported (`export interface`).
- Component is a `const` with a **named export** — no `default` exports.
- Props are destructured in the function signature: `({ prop1, prop2 }: MyComponentProps)`.

## Imports

- Use the `@/` path alias (maps to `src/`): `import { cn } from "@/lib/utils"`, `import type { Deck } from "@/domain/models/deck"`.
- Import React explicitly: `import * as React from "react"` or destructured imports like `{ type FC, type ReactNode }`.
- Icons from `lucide-react`: `import { Plus, X } from "lucide-react"`.

## Props

- Non-UI components: define clean, minimal props interfaces with only the props the component needs.
- UI primitives wrapping native elements: extend HTML attributes (e.g. `React.ButtonHTMLAttributes<HTMLButtonElement>`) and use `cn()` for className merging.

## Example

```tsx
import * as React from "react";
import { cn } from "@/lib/utils";

interface GreetingProps {
  name: string;
  className?: string;
}

export const Greeting = ({ name, className }: GreetingProps) => {
  return (
    <div className={cn("text-lg font-semibold", className)}>
      Hello, {name}!
    </div>
  );
};
```

## Do Not

- ❌ Use `export default` — always named exports.
- ❌ Put multiple components in one file — each component gets its own file.
- ❌ Use `any` in props — always type props explicitly.
