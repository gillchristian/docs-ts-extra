---
title: markdown.ts
nav_order: 6
parent: Modules
---

## markdown overview

markdown utilities

Added in v0.2.0

---

<h2 class="text-delta">Table of contents</h2>

- [utils](#utils)
  - [printClass](#printclass)
  - [printConstant](#printconstant)
  - [printExamples](#printexamples)
  - [printExport](#printexport)
  - [printFunction](#printfunction)
  - [printInterface](#printinterface)
  - [printModule](#printmodule)
  - [printTypeAlias](#printtypealias)
  - [ts](#ts)

---

# utils

## printClass

**Signature**

```ts
export declare function printClass(c: Class, fence: Fence): string
```

Added in v0.4.0

## printConstant

**Signature**

```ts
export declare function printConstant(c: Constant, fence: Fence): string
```

Added in v0.5.0

## printExamples

**Signature**

```ts
export declare function printExamples(examples: Array<string>, fence: Fence): string
```

Added in v0.2.0

## printExport

**Signature**

```ts
export declare function printExport(e: Export, fence: Fence): string
```

Added in v0.5.0

## printFunction

**Signature**

```ts
export declare function printFunction(f: Function, fence: Fence): string
```

Added in v0.5.0

## printInterface

**Signature**

```ts
export declare function printInterface(i: Interface, fence: Fence): string
```

Added in v0.5.0

## printModule

**Signature**

```ts
export declare function printModule(module: Module, order: number): string
```

Added in v0.2.0

## printTypeAlias

**Signature**

```ts
export declare function printTypeAlias(ta: TypeAlias, fence: Fence): string
```

Added in v0.5.0

## ts

**Signature**

```ts
export declare const ts: Fence
```

Added in v0.6.0
