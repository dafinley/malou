# Molou

> A visual workbench for understanding how model training methods differ.

[![CI](https://github.com/dafinley/malou/actions/workflows/ci.yml/badge.svg)](https://github.com/dafinley/malou/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Built with Bun](https://img.shields.io/badge/built%20with-bun-black.svg)](https://bun.sh)

Molou makes training mechanics inspectable: what moves, what stays frozen, where memory goes, what the signal looks like, and why inference has a different cost profile.

It walks through five training paths side by side:

- **Full training** — every parameter is a free variable.
- **Fine-tuning / LoRA** — small low-rank adapters beside a frozen base.
- **QLoRA** — 4-bit base storage with high-precision adapters.
- **Distillation** — a larger teacher's soft distribution trains a smaller student.
- **Reinforcement learning** — sample, score, update under a KL leash.

Each method has live controls, a per-method memory sketch, a math card, a "when to use it" decision guide, a minimal code recipe, and curated paper references.

## Quick start

Requirements:

- [Bun](https://bun.sh/) ≥ 1.1
- Node.js ≥ 20.19

Recommended: use [mise](https://mise.jdx.dev/) so the project automatically uses the pinned
Node and Bun versions from `.mise.toml`.

```bash
mise install
mise exec -- bun install
mise exec -- bun run dev
```

If you already manage runtimes yourself, use Node 22 and Bun 1.3.12:

```bash
bun install
bun run dev
```

Then open [http://localhost:3000](http://localhost:3000).

### Production build

```bash
bun run build
bun run start
```

### GitHub Pages build

Molou can also ship as a static export for GitHub Pages:

```bash
NEXT_PUBLIC_SITE_URL=https://dafinley.github.io/malou bun run build:pages
```

That command writes the static site to `out/`, adds `.nojekyll`, and injects the production CSP meta
tag into each exported HTML file. The deploy workflow in
[`.github/workflows/pages.yml`](.github/workflows/pages.yml) runs the same export with the repository
path configured as the Next.js `basePath`.

To enable hosting, push `main`, then open the repository settings on GitHub:

1. Go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Wait for the `Deploy GitHub Pages` workflow to finish.

The default Pages URL is `https://dafinley.github.io/malou/`. If you fork the project or move it
under a custom domain, set `NEXT_PUBLIC_SITE_URL` and `NEXT_PUBLIC_BASE_PATH` in the workflow to
match the final URL.

### Quality gates

```bash
bun run check   # lint + typecheck + format
```

Individual commands are also exposed: `bun run lint`, `bun run typecheck`, `bun run format`, `bun run format:check`.

## What's in here

| Path                                                                               | What lives here                                                                                                       |
| ---------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| [`app/`](app)                                                                      | Next.js App Router entry, root layout, global stylesheet, static favicon (`icon.svg`) and dynamic OpenGraph image     |
| [`src/components/`](src/components)                                                | UI components — one file per responsibility                                                                           |
| [`src/components/method-lab/`](src/components/method-lab)                          | A dedicated lab per training method (full-training, LoRA, QLoRA, distillation, RL) — each its own visualization suite |
| [`src/components/numbered-subsection.tsx`](src/components/numbered-subsection.tsx) | The `01 · title · formula · viz · → takeaway` wrapper used inside every lab                                           |
| [`src/components/relationships-graph.tsx`](src/components/relationships-graph.tsx) | Shared node/edge graph that closes each lab                                                                           |
| [`src/data/training.ts`](src/data/training.ts)                                     | Methods, controls, toggles, selectors, glossary, architectures, named presets                                         |
| [`src/data/references.ts`](src/data/references.ts)                                 | Per-method math, code recipes, decision guides, references                                                            |
| [`src/lib/derive-stats.ts`](src/lib/derive-stats.ts)                               | Memory sketch math (trainable params, VRAM, block-scale overhead, signal density)                                     |
| [`src/lib/format.ts`](src/lib/format.ts)                                           | Compact number and byte formatters                                                                                    |
| [`src/lib/url-state.ts`](src/lib/url-state.ts)                                     | Shareable state via URL search params, validated with zod                                                             |
| [`src/lib/security-headers.mjs`](src/lib/security-headers.mjs)                     | CSP and security headers (used by `next.config.mjs` and the Pages export)                                             |
| [`scripts/prepare-pages.mjs`](scripts/prepare-pages.mjs)                           | Post-build step for GitHub Pages: injects CSP meta tags and gives the OG image a real `.png` extension                |

## Features

- **Live controls.** Model size, sequence length, batch size, LoRA rank, quantization bits, teacher/student size, temperature, rollouts, reward reliability — all wired to a derived memory sketch.
- **Shareable state.** Drag the sliders, copy the URL. Reopen it and the workbench is exactly as you left it.
- **Per-method deep dives.** Math, code, decision guide, and references in their own cards beside each diagram.
- **Side-by-side comparison.** Toggle methods on or off and watch memory footprint and trainable share line up.
- **Accessible by default.** Keyboard navigation, focus rings, ARIA roles, and reduced-motion support.
- **Dark canonical theme.** A muted palette with semantic accent colors per method.

## Stack

- Next.js 16 App Router · React 19 · TypeScript strict
- Tailwind CSS 4 + a small layer of CSS variables for theming
- Bun for install, scripts, and lockfile
- ESLint 9 + Prettier 3 with tailwind class sorting
- Lucide icons

## Contributing

We love PRs that add educational depth, fix mistakes, or sharpen the visuals. Start with [CONTRIBUTING.md](CONTRIBUTING.md). For correctness reports, please use the [Educational correction](.github/ISSUE_TEMPLATE/educational_correction.md) issue template — a paper or canonical implementation as a source is gold.

Community expectations live in our [Code of Conduct](CODE_OF_CONDUCT.md). Security reports follow [SECURITY.md](SECURITY.md).

## Roadmap

- **Inference Lab** — prefill, decode, KV cache, batching, speculative decoding, quantized serving.
- **Architecture Playground** — decoder-only, encoder-decoder, MoE, multimodal, diffusion, hybrid.
- **Training Recipes** — optimizer choices, dataset mix, checkpoint cadence, eval loops, failure modes.
- **Exportable diagrams** — SVG/PNG exports for teaching, workshops, and docs.

## License

MIT — see [LICENSE](LICENSE).
