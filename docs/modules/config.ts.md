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
  - [Config (interface)](#config-interface)
  - [PartialConfig](#partialconfig)
  - [PartialConfig (interface)](#partialconfig-interface)
  - [defaultConfig](#defaultconfig)
  - [mergeConfig](#mergeconfig)

---

# utils

## Config (interface)

**Signature**

```ts
export interface Config {
  strict: boolean
  outDir: string
  rootDir: string
}
```

Added in v0.6.0

## PartialConfig

**Signature**

```ts
export declare const PartialConfig: t.PartialC<{ strict: t.BooleanC; outDir: t.StringC; rootDir: t.StringC }>
```

Added in v0.6.0

## PartialConfig (interface)

**Signature**

```ts
export interface PartialConfig extends t.TypeOf<typeof PartialConfig> {}
```

Added in v0.6.0

## defaultConfig

**Signature**

```ts
export declare const defaultConfig: Config
```

Added in v0.6.0

## mergeConfig

**Signature**

```ts
export declare const mergeConfig: (partial: PartialConfig, config: Config) => Config
```

Added in v0.6.0
