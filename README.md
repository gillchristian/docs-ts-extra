# docs-ts-extra

A fork of [gcanti/docs-ts](https://github.com/gcanti/docs-ts).

## Setup and usage

1. `npm i docs-ts-extra -D`

2. Run

```sh
npx docs-ts-extra
```

## Configuration

A `docsts` object on `package.json` with the following properties (all optional):

| Key       | Type      | Optional | Default | Description                                                                       |
| --------- | --------- | -------- | ------- | --------------------------------------------------------------------------------- |
| `strict`  | `boolean` | Yes      | `true`  | Strict mode requires every module and export to have a JSDoc with a `@since` tag. |
| `rootDir` | `string`  | Yes      | `src`   | Source code directory to extract documentation from.                              |
| `outDir`  | `string`  | Yes      | `docs`  | Output directory to write Markdown docs to.                                       |
