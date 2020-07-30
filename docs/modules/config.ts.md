---
title: config.ts
nav_order: 2
parent: Modules
---

## config overview

Added in v0.3.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [Config (interface)](#config-interface)
  - [PartialConfig](#partialconfig)
  - [PartialConfig (interface)](#partialconfig-interface)
  - [defaultConfig](#defaultconfig)
  - [merge](#merge)

---

# utils

## Config (interface)

**Signature**

```ts
export interface Config {
  strict: boolean
}
```

Added in v0.3.0

## PartialConfig

**Signature**

```ts
export declare const PartialConfig: t.PartialC<{ strict: t.BooleanC }>
```

Added in v0.3.0

## PartialConfig (interface)

**Signature**

```ts
export interface PartialConfig extends t.TypeOf<typeof PartialConfig> {}
```

Added in v0.3.0

## defaultConfig

**Signature**

```ts
export declare const defaultConfig: Config
```

Added in v0.3.0

## merge

**Signature**

```ts
export declare const merge: (partial: PartialConfig, config: Config) => Config
```

Added in v0.3.0
