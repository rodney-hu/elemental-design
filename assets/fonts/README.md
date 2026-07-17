# Fonts

Self-hosted, subsetted `.woff2` files — not linked from Google's CDN.
See `docs/decisions.md` for why (short version: CDN font loading
silently failed in a sandboxed preview once, and broke every custom
font on the page with no visible error).

## Files

| File | Family | Weight | Role |
|---|---|---|---|
| `marker400.woff2` | Permanent Marker | 400 | `--font-brush` — Latin wordmark |
| `mashan400.woff2` | Ma Shan Zheng | 400 | `--font-kanji` — kanji marks |
| `klee400.woff2` / `klee600.woff2` | Klee One | 400 / 600 | `--font-head` — headings |
| `zen300/400/500/700.woff2` | Zen Kaku Gothic New | 300–700 | `--font-body` — body copy |
| `jbmono400.woff2` / `jbmono500.woff2` | JetBrains Mono | 400 / 500 | `--font-mono` — labels |

## ⚠️ Important: these are subsetted, not full fonts

Each file only contains the specific characters used on the original
showcase page — not the full font. This keeps file size tiny (~150KB
total for all 10 files) but has a real consequence:

- **Latin fonts** (marker, klee, zen, jbmono) are subset to the full
  printable ASCII range (`U+0020`–`U+007E`) plus an em dash. Any normal
  English text will render fine. Accented characters (é, ñ, etc.) will
  not.
- **Kanji fonts** (mashan, and klee's kanji glyphs) are subset to only
  the exact characters used so far: 元 素 墨 紙 朱 金 水 土 風 火 (plus
  hiragana in 流れるように for Ma Shan Zheng). **A new kanji character
  used in a new project will not render** and will silently fall back
  to a system font.

## Adding a new kanji character

If a new project needs a kanji glyph not listed above:

```bash
pip install fonttools brotli
pyftsubset <source-ttf> --text="新しい文字" --flavor=woff2 --output-file=<name>.woff2
```

Re-subset from the original TTF (not from the existing woff2 — that's
already stripped down). Then base64-embed or re-link as needed, and add
the new character to the table above so this stays accurate.

## Embedding

For a fully network-independent HTML page, base64-encode and embed as
`@font-face` data URIs (see `showcase/index.html` for a working
example). For a real app build (Vite/Next.js), it's simpler to just
`@font-face { src: url('/fonts/marker400.woff2') }` and let the bundler
serve the files normally — the base64 approach was specifically a
workaround for a sandboxed single-file preview, not a general
recommendation.
