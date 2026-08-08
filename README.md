# 🐕🚀 Doge to the Moon — Simulator

> A paper-trading web game. A live (fake) DOGE market simulates second-by-second with thousands of bot buyers and sellers, viral news events, and whale dumps. You trade $10,000 of play money — buy early, ride the waves, and pump the price all the way to 🌕 **the moon**.
>
> 🪄 **Vibecoded** — built entirely with AI pair-programming, one vibe at a time. Bug reports welcome (the vibes may still be loading).

[![Made with JavaScript](https://img.shields.io/badge/JavaScript-ES2020-F7DF1E?logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![No dependencies](https://img.shields.io/badge/dependencies-0-blueviolet)](https://github.com/your-name/dogetothemoon-sim)
[![HTML](https://img.shields.io/badge/HTML5-5-black)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS](https://img.shields.io/badge/CSS3-cyan)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Play it now:** your GitHub Pages URL (e.g. `https://<username>.github.io/dogetothemoon-sim`)

---

## ✨ Features

- **Live market simulation** — a momentum + mean-reversion engine with shifting trader sentiment. A stream of bots places real buy/sell orders every tick, with coordinated **whale waves** and random **market regimes**.
- **News events that move the market** — Musk tweets, whale dumps, short squeezes, listing rumors: each headline pushes (or crashes) the price exactly like crypto Twitter.
- **You can pump it yourself** — your orders hit the order book with slippage. Buy hard and the ticker climbs; dump your bag and watch it bleed.
- **Live auto market modes**:
  - 🚀 **TO THE MOON** — price ripping upward fast
  - 🐂 **BULLISH** — mild upward trend
  - 🐻 **BEARISH** — downward trend
  - 🌘 **SIDEWAYS** — choppy/no direction
- **Real-time line chart** — canvas-rendered price line, time axis, current-price marker, glow + gradient fill; updates live.
- **Live feeds** — recent trades (with names! including `⭐ YOU`) and market news ticker.
- **Aesthetic dark "moon" UI** — animated starfield, glowing price, a moon that physically grows as you approach the $10 target, confetti and a celebration overlay on arrival.
- **Wallet & P/L tracking** — cash, DOGE, average cost, unrealized profit/loss, total return.
- **Persistent wallet** — your cash & DOGE survive refreshes via `localStorage`.
- **Sound effects** 🔊 generated with the Web Audio API (no audio files) + mute toggle.

---

## 🎮 How to play

**Your goal:** turn **$10,000** of paper cash into the legendary moment when DOGE hits **$10** 🤑. Cut in and out with the market; keep buying into the pumps to push price upward… and hold on when the flash events hit.

1. **Buy** — enter an amount (in `$ USDT` or `DOGE`), hit **BUY DOGE 🚀**. Your order pushes the price up (market impact = slippage).
2. **Sell** — cut your position and bank profits; selling dumps the price.
3. **Watch the mode badge** — the header `SIDEWAYS / BULLISH / BEARISH / TO THE MOON` tells you the market regime.
4. **Ride the news** — pump headlines in the feed are your green light; crash headlines are your exit signal.
5. **Maximize** — use the `25 / 50 / 75 / MAX` chips or press `Enter` to execute.

That's the whole loop. Pump it. 💸

---

## 🔧 Simulation algorithms

| Term | What it does |
| --- | --- |
| **Random walk** | Random buy/sell order flow every tick (10 ticks/sec). |
| **Momentum** | Recent price move feed back into the next tick's buy probability (trending behavior). |
| **Mean reversion** | The price is pulled toward its slow moving fair value (keeps price from only hanging at extremes). |
| **Sentiment** | A slowly random-walking mood changes each tick's bias (regime phases). |
| **Whale waves** | Occasionally a coordinated flow runs for a few seconds — causing ripples. |
| **News events** | Would-be "Musk twitter" style events inject sustained order flow up or down. |
| **Your footprint** | Your trades push through the same order-flow engine, scaled by order size + impact. |

Modes are decided from the price's 12-second trend: up 2.4%+ → **🚀 TO THE MOON**; up 0.65%+ → **🐂 BULL**; down 1%+ → **🐻 BEAR**; otherwise **🌘 SIDEWAYS**.

---

## 📁 Project structure

```
dogetothemoon-sim/
├─ index.html          the page / layout
├─ styles.css          the moon theme UI
├─ app.js              simulation engine + market + UI logic
├─ .github/
│  └─ workflows/
│     └─ pages.yml     auto-deploys to GitHub Pages on push to main
├─ .nojekyll           tells GitHub Pages to skip Jekyll processing
└─ README.md
```

## ▶️ Run locally

No build step. No dependencies. Files only.

```bash
# 1) clone
git clone https://github.com/<your-name>/dogetothemoon-sim.git
cd dogetothemoon-sim

# 2) just open the file
open index.html          # macos
xdg-open index.html      # linux

# or run a local server
python3 -m http.server 8000
# → http://localhost:8000
```

## 🌍 Deploy to GitHub Pages

**Option A — automatic (recommended)**
Push to `main`. The included GitHub Actions workflow (`.github/workflows/pages.yml`) builds automatically and serves the root folder. Your game lives at:

```
https://<username>.github.io/dogetothemoon-sim/
```

Make sure the repo **Settings → Pages** has *Source* set to **GitHub Actions**.

**Option B — manual**
Settings → Pages → **Deploy from a branch** → branch: `main`, folder: `/ (root)` → Save.

---

## ⚙️ Tweaks & knobs

All tunables live at the top of `app.js`:

| Constant | Default | Meaning |
| --- | --- | --- |
| `TICK` | `100` | ms per simulation tick |
| `START` | `0.31` | starting DOGE price in $ |
| `START_CASH` | `10000` | starting paper balance |
| `MOON_PRICE` | `10` | price needed to reach the moon |
| `SCALE` / `STEP_CAP` | `520000` / `0.045` | market liquidity & per-tick move clamp |
| `IMPACT` | `2.6` | your order slippage multiplier |

Want a harder game? Lower `START_CASH`. Want wilder swings? Lower `SCALE`.

---

## 🛠 Tech

- **Vanilla JavaScript (ES2020)** — no frameworks, no build step, deploy directly.
- **Canvas API** — live price chart & confetti.
- **Web Audio API** — synthesized sound effects.
- **localStorage** — wallet persistence.
- GitHub Pages Actions for hosting.

## 📝 License

[MIT](LICENSE)