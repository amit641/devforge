# DevForge

A desktop developer toolkit. Write JavaScript and see executed output in a parallel sidebar — plus a suite of essential everyday devtools.

Built with **Electron + Vite + React + TypeScript + Tailwind CSS** and the **Monaco** editor.

## Tools included

| Tool | What it does |
| ---- | ------------ |
| **JS Playground** | Monaco editor on the left, live console output on the right. Supports `console.*`, `fetch`, `async/await`, and object inspection (Arrays, Maps, Sets, Errors, Dates…). Keyboard shortcut: `⌘+Enter`. Optional auto-run on change. |
| **JSON** | Validate, format, minify and explore JSON as a collapsible tree. |
| **JWT Decoder** | Visually inspect header / payload / signature, verify `exp`, `iat`, `nbf`. |
| **Regex Tester** | Build patterns with flag toggles, see live highlighted matches, capture groups, and a replace preview. |
| **Encoders** | Bidirectional Base64 / URL / HTML entity encoding. |
| **Hash & UUID** | MD5, SHA-1, SHA-256, SHA-384, SHA-512 + bulk UUID v4 generation. |
| **Color** | HEX ⇄ RGB ⇄ HSL converter with native picker, palette, and live preview. |
| **Text Diff** | Line / word diff with stats. |
| **Timestamp** | Unix ⇄ Date conversion with relative time and quick presets. |
| **Markdown** | Live GitHub-flavored markdown previewer. |

## Run it

```bash
npm install
npm run dev      # launches Electron in dev mode with hot reload
```

To build a production binary:

```bash
npm run build    # produces a packaged installer in ./release
```

## How JS execution works

The JS Playground runs your code inside a **sandboxed `<iframe>`** (`sandbox="allow-scripts"`). All `console.*` calls are intercepted and streamed back via `postMessage`, where each value is structurally serialized so you get rich inspection (typed badges, expandable trees) instead of plain `[object Object]`. The last expression's result is automatically shown.

This means:
- Code cannot touch the Electron main process or your filesystem.
- `fetch`, timers, promises, `await` at top level — all work.
- Each run gets a fresh iframe so global state doesn't leak between runs.

## Project layout

```
electron/
  main.ts        # Electron main process
  preload.ts     # Context-isolated preload bridge
src/
  App.tsx        # Shell + tool router
  components/    # Sidebar, TitleBar, SplitPane, CodeEditor, ToolLayout
  tools/         # One file per devtool
  styles/        # Tailwind entry + markdown CSS
```

## Adding a new tool

1. Create `src/tools/MyTool.tsx` exporting a `MyTool` component.
2. Register it in `src/tools/index.ts`:

```ts
import { MyTool } from './MyTool';
// add to ToolId union and TOOLS array
{ id: 'mytool', name: 'My Tool', icon: '★', component: MyTool },
```

That's it — it'll appear in the sidebar.

## License

MIT
