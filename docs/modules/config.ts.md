---
title: config.ts
nav_order: 2
parent: Modules
---

## config overview

Added in v0.6.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Config](#config)
  - [Config (interface)](#config-interface)

---

# utils

## Config

**Signature**

```ts
export declare const Config: t.TypeC<{
  template: t.KeyofC<{ default: any; docusaurus: any }>
  strict: t.BooleanC
  outDir: t.StringC
  rootDir: t.StringC
}>
```

Added in v0.6.0

## Config (interface)

**Signature**

```ts
export interface Config extends t.TypeOf<typeof Config> {}
```

Added in v0.6.0
