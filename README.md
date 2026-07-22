# inhand explained — how in-hand salary is calculated from CTC

**An animated walkthrough of the idea behind the [inhand](https://sreenivas-sadhu-prabhakara.github.io/inhand/) calculator.**

Your offer letter shows one big **CTC** number. Your bank account shows a much smaller
one. This single page animates every rupee that goes missing in between — the **salary
waterfall** — and explains why a calculator that keeps your salary on your device is not
just a promise but something the browser itself enforces.

It is a single static page: plain HTML, CSS, and JavaScript with **no build step, no
framework, and no network calls**. The page's own Content-Security-Policy sets
`connect-src 'none'`, so nothing you do here ever leaves the browser — the same guarantee
the calculator it explains is built on.

> This is the **explainer**. The working tool is a separate app:
> **[Open the inhand calculator →](https://sreenivas-sadhu-prabhakara.github.io/inhand/)**

## What it covers

1. **The hook** — CTC in, in-hand out, and the gap between them.
2. **The problem** — nobody shows you the arithmetic, and most calculators log your salary.
3. **The salary waterfall** — an animated inline-SVG chart stepping CTC down through
   employer EPF & EPS, gratuity accrual, your own EPF, professional tax, and monthly TDS
   to a single tangerine in-hand block.
4. **Every deduction cited** — the statutory rule behind each line (EPF Scheme 1952 para 29,
   EPS GSR 609(E), Payment of Gratuity Act 1972 s.4, Article 276(2) state PT, Finance Act 2025).
5. **Enforced privacy** — an animated demo of `connect-src 'none'` blocking an outbound send.
6. **A short feature tour** and a prominent link to the live calculator.

## How the animation works

- **Scroll-driven reveals** via `IntersectionObserver` — sections fade and rise into place
  as they enter the viewport; a thin progress bar tracks reading position.
- **The waterfall** is built as inline SVG in `app.js` and animated purely with CSS
  transforms (bars grow from the baseline; connectors and labels fade in).
- **No libraries, no canvas dependency, no network** — everything is CSP-clean.
- **`prefers-reduced-motion` is fully respected**: every animation degrades to a static,
  fully legible end-state (bars drawn, labels shown, packet parked) in both CSS and JS.

## Design & accessibility

- Same visual identity as the calculator it explains — **fog & gunmetal with a single
  tangerine flare**, the salary-waterfall motif carried through the page, OG card, and icon.
- **WCAG-AA** contrast in **both** light and dark schemes; state is never colour-only
  (icons, text and patterns accompany every cue); fully keyboard-operable with a skip-link
  and visible focus rings.
- System sans stack only, `tabular-nums` on every figure — **no serif display fonts.**

## Quickstart

```sh
# just open it — there is no build step
open index.html            # macOS
# or serve it (a static server satisfies the CSP cleanly):
python3 -m http.server 8080   # then visit http://127.0.0.1:8080/
node --check app.js           # the only JS file; parses clean
```

## Privacy

- **No network, ever.** `connect-src 'none'` in the page's CSP means the browser blocks
  every fetch/XHR/WebSocket. There is no analytics, no CDN, and no external font — open
  your network tab and watch it stay empty.

## Disclaimer

**This is an explainer for an estimate — not tax, legal, or investment advice.** The
example figures shown here (and in the inhand calculator) are illustrative and modelled for
**AY 2026-27 (FY 2025-26) only**. Employer CTC structures vary; TDS is shown as annual tax
÷ 12, not the exact Section-192 month-by-month computation; professional-tax slabs change by
state. Gratuity is an employer-cost accrual (4.81% of basic), normally payable only after
5 years of continuous service — not monthly cash in hand. Verify any real figure against
your actual payslip and a qualified professional.

The software is provided "as is", without warranty of any kind; see [LICENSE](LICENSE).

## License

MIT © 2026 Sreenivas Sadhu Prabhakara.
