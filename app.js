"use strict";

const $ = (s) => document.querySelector(s);

const TICK = 100;
const CANDLE = 2000;
const SCALE = 520000;
const STEP_CAP = 0.045;
const START = 0.31;
const START_CASH = 10000;
const FEE = 0.0004;
const IMPACT = 2.6;
const MOON_PRICE = 10;

const S = {
  price: START,
  cash: START_CASH,
  doge: 0,
  avgCost: 0,
  vol: 0,
  flow: 0,
  sent: 0,
  fair: START,
  tickN: 0,
  high: START,
  low: START,
  vals: [START],
  H: [],
  candles: [],
  candleOpen: START,
  candleHigh: START,
  candleLow: START,
  trades: [],
  news: [],
  wave: null,
  event: null,
  mode: "side",
  moonShown: false,
};

let unit = "usd";
let side = "buy";

const NAMES = [
  "WhaleKing", "DogFace", "MoonTicket", "ShibaQueen", "LunarRick", "JrNebula",
  "BulHands", "DiamondDee", "ElonFan62", "MarsPup", "SpoonFisher", "Boreal",
  "HODL5403", "ToTheMoonOr", "WenMoonYet", "GalaxyDoge", "ClauZero", "SirTalks",
  "CryptoNana", "PixelWhale", "RocketPup", "DogeDuck420", "TwilightFund", "Owlade",
];

let ac = null;
let muted = localStorage.getItem("d2m_mute") === "1";

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const rnd = () => Math.random();

function fmt(p) {
  if (p >= 1000) return p.toFixed(2);
  if (p >= 100) return p.toFixed(2);
  if (p >= 1) return p.toFixed(3);
  if (p >= 0.01) return p.toFixed(4);
  return p.toFixed(6);
}
function usd(v) {
  const s = "$" + Math.abs(v).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return v < 0 ? "-" + s : s;
}
function dogeAmt(v) {
  if (v >= 100000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (v >= 10000) return v.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (v >= 100) return v.toFixed(2);
  return v.toFixed(4);
}
function compact(v) {
  if (v >= 1e9) return (v / 1e9).toFixed(2) + "B";
  if (v >= 1e6) return (v / 1e6).toFixed(2) + "M";
  if (v >= 1e3) return (v / 1e3).toFixed(1) + "K";
  return v.toFixed(0);
}

function restore() {
  try {
    const st = JSON.parse(localStorage.getItem("d2m_wallet"));
    if (st && typeof st.cash === "number") {
      S.cash = st.cash;
      S.doge = st.doge || 0;
      S.avgCost = st.avgCost || 0;
    }
  } catch (e) {}
}
function persist() {
  try {
    localStorage.setItem("d2m_wallet", JSON.stringify({ cash: S.cash, doge: S.doge, avgCost: S.avgCost }));
  } catch (e) {}
}

function beep(freq, dur, type, vol, delay) {
  if (muted) return;
  try {
    if (!ac) ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type || "sine";
    o.frequency.value = freq;
    const t0 = ac.currentTime + (delay || 0);
    g.gain.setValueAtTime(vol || 0.06, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g);
    g.connect(ac.destination);
    o.start(t0);
    o.stop(t0 + dur);
  } catch (e) {}
}
const sfxBuy = () => { beep(880, 0.09, "square", 0.03); beep(1320, 0.12, "sine", 0.03, 0.05); };
const sfxSell = () => { beep(300, 0.1, "square", 0.035); beep(180, 0.13, "sine", 0.035, 0.05); };
const sfxNews = () => { beep(660, 0.12, "sine", 0.05); beep(880, 0.14, "sine", 0.05, 0.1); };
const sfxMoon = () => { beep(523, 0.15, "sine", 0.05); beep(659, 0.15, "sine", 0.05, 0.1); beep(784, 0.25, "sine", 0.05, 0.2); beep(1047, 0.4, "sine", 0.05, 0.3); };

function toast(msg, kind) {
  const t = document.createElement("div");
  t.className = "toast" + (kind ? " " + kind : "");
  t.textContent = msg;
  $("#toasts").appendChild(t);
  setTimeout(() => {
    t.style.transition = "opacity .4s";
    t.style.opacity = "0";
    setTimeout(() => t.remove(), 450);
  }, 2800);
}

const NEWS = [
  { txt: "Musk posts “to the moon 🐕🚀”. It worked again.", dir: 1.9, big: true },
  { txt: "Whale scoops up 4M DOGE in a single block.", dir: 1.5 },
  { txt: "Local coffee shop now accepts DOGE — city goes wild.", dir: 1.3 },
  { txt: "Rumors: mainnet upgrade announcement incoming.", dir: 1.6 },
  { txt: "Crypto Telegram accidentally pins DOGE in its feed.", dir: 1.2 },
  { txt: "Whale dumps a bag — brief flash of fear.", dir: -1.5, rev: true },
  { txt: "Short squeeze ignites… the candles like it.", dir: 1.8, big: true },
  { txt: "TWITTER LOGO CHANGES TO A DOG. WEN MOON?", dir: 2.2, big: true },
  { txt: "An exchange fee recalibration tests the floor.", dir: -1.3 },
  { txt: "Moon summit delegates pay for everything in DOGE.", dir: 1.2 },
  { txt: "Massive sell wall triggers a brief cascade.", dir: -1.7 },
  { txt: "Whale returns, buys the dip, flexes the ticker.", dir: 1.7, big: true },
  { txt: "Fixing an old bug makes the chain super fast.", dir: 1.4 },
  { txt: "Market makers reset their stops — chaos ensues.", dir: -1.4 },
  { txt: "A spaceship is reportedly paid for in DOGE.", dir: 1.5 },
];

let newsTimer = 20000;

function scheduleNext() {
  const ev = NEWS[Math.floor(rnd() * NEWS.length)];
  S.event = {
    rem: Math.floor(16 + rnd() * 20),
    dir: ev.dir > 0 ? 1 : -1,
    per: Math.abs(ev.dir) * (ev.big ? 1500 : 700) * (0.7 + rnd() * 0.8) * (ev.rev ? 1.4 : 1),
    txt: ev.txt,
  };
  addNews((ev.dir > 0 ? "🟢 " : "🔴 ") + ev.txt);
  sfxNews();
  toast(ev.txt, ev.dir > 0 ? "good" : "bad");
  newsTimer = 16000 + rnd() * 34000;
}

function addNews(txt) {
  S.news.unshift({ txt, time: new Date().toTimeString().slice(0, 5) });
  if (S.news.length > 9) S.news.pop();
  renderNews();
}

function makeName() {
  let n = NAMES[Math.floor(rnd() * NAMES.length)];
  if (rnd() < 0.4) n += "_" + Math.floor(rnd() * 1000);
  return n;
}

function addTrade(side, size, who, isYou) {
  const d = size / Math.max(S.price, 1e-9);
  S.trades.unshift({ who, side, doge: d, usd: size, isYou });
  if (S.trades.length > 80) S.trades.pop();
}

function mom() {
  const v = S.vals;
  const n = v.length;
  if (n < 30) return 0;
  return clamp(((v[n - 1] - v[n - 30]) / Math.max(v[n - 1], 1e-9)) * 800, -1, 1);
}
function mrev() {
  return clamp(((S.fair - S.price) / Math.max(S.price, 1e-9)) * 4.2, -1, 1);
}

function priceStep() {
  let net = 0;

  if (S.wave && S.tickN <= S.wave.until) {
    if (rnd() < 0.8) net += S.wave.dir * (220 + rnd() * 1100);
    if (S.tickN >= S.wave.until) S.wave = null;
  }

  if (S.event && S.event.rem > 0) {
    S.event.rem--;
    net += S.event.dir * S.event.per * (0.5 + rnd() * 0.6);
  }

  const pBuy = clamp(0.5 + S.sent * 0.16 + mom() * 0.2 + mrev() * 0.25, 0.05, 0.95);
  const pr = rnd();
  const nTrades = pr < 0.55 ? 1 : pr < 0.9 ? 2 : 3;
  for (let i = 0; i < nTrades; i++) {
    const sd = rnd() < pBuy ? 1 : -1;
    const size = (260 + rnd() * 2100) * (0.5 + rnd() * 1.6);
    net += sd * size;
    if (rnd() < 0.45) addTrade(sd, size, makeName(), false);
  }

  if (S.flow !== 0) {
    const push = S.flow * 0.34;
    S.flow -= push;
    net += push;
  }

  if (net !== 0) {
    const pct = clamp(net / SCALE, -STEP_CAP, STEP_CAP);
    S.price = Math.max(1e-9, S.price * (1 + pct));
  }

  S.tickN++;
  S.vals.push(S.price);
  if (S.vals.length > 24000) S.vals.splice(0, 1500);
  S.vol += Math.abs(net);

  S.high = Math.max(S.high, S.price);
  S.low = Math.min(S.low, S.price);
  S.fair = S.fair + (S.price - S.fair) * clamp(0.005 + Math.abs(S.price - S.fair) / 1800, 0.002, 0.045);
  S.sent = clamp(S.sent + (rnd() - 0.5) * 0.015, -1, 1);

  S.candleHigh = Math.max(S.candleHigh, S.price);
  S.candleLow = Math.min(S.candleLow, S.price);
  if (S.tickN % (CANDLE / TICK) === 0) {
    S.candles.push({ t: Date.now(), o: S.candleOpen, h: S.candleHigh, l: S.candleLow, c: S.price });
    if (S.candles.length > 2000) S.candles.shift();
    S.candleOpen = S.price;
    S.candleHigh = S.price;
    S.candleLow = S.price;
  }

  if (S.tickN % 5 === 0) {
    S.H.push({ t: Date.now(), p: S.price });
    if (S.H.length > 4000) S.H.splice(0, 250);
  }

  if (rnd() < 0.009 && !S.wave) {
    S.wave = { until: S.tickN + Math.floor(22 + rnd() * 32), dir: rnd() < 0.56 ? 1 : -1 };
  }

  if (newsTimer <= 0) scheduleNext();
  else newsTimer -= TICK;

  checkMode();
  checkMilestones();
}

const MODES = {
  moon: { label: "TO THE MOON", ico: "🚀", cls: "moon" },
  bull: { label: "BULLISH", ico: "🐂", cls: "bull" },
  bear: { label: "BEARISH", ico: "🐻", cls: "bear" },
  side: { label: "SIDEWAYS", ico: "🌘", cls: "side" },
};

function checkMode() {
  const v = S.vals;
  const n = v.length;
  if (n < 130) return;
  const ref = v[n - 130];
  const pct = ((v[n - 1] - ref) / Math.max(ref, 1e-9)) * 100;
  let key = "side";
  if (pct >= 2.4) key = "moon";
  else if (pct >= 0.65) key = "bull";
  else if (pct <= -1.0) key = "bear";
  if (key !== S.mode) {
    const prev = S.mode;
    S.mode = key;
    renderMode();
    if (key === "moon") sfxMoon();
    else if (key === "bear") beep(180, 0.22, "sawtooth", 0.04);
    else beep(430, 0.12, "triangle", 0.04);
  }
}

const MILESTONES = [0.5, 1, 2, 3, 5, 7.5, 10];
let lastTrig = 0;

function checkMilestones() {
  if (S.moonShown) return;
  for (const m of MILESTONES) {
    if (S.price >= m) {
      if (m === lastTrig) return;
      lastTrig = m;
      if (m < 10) {
        toast(`💰 DOGE broke $${m}!`, "good");
        confetti(20 + m * 8);
      } else {
        S.moonShown = true;
        sfxMoon();
        confetti(140);
        document.documentElement.style.setProperty("--mp", "100%");
        $("#moonFill").style.width = "100%";
        setTimeout(() => $("#moonOverlay").classList.remove("hidden"), 900);
      }
      return;
    }
  }
}

function renderMode() {
  const m = MODES[S.mode];
  const badge = $("#modeBadge");
  badge.className = "mode-badge " + m.cls;
  badge.querySelector(".mode-ico").textContent = m.ico;
  badge.querySelector(".mode-txt").textContent = m.label;
  const cm = $("#chartMode");
  cm.textContent = m.ico + " " + m.label;
  cm.className = "chart-mode " + m.cls;
}

function totalValue() {
  return S.cash + S.doge * S.price;
}

function renderStats() {
  const chg = ((S.price - START) / START) * 100;
  const up = chg >= 0;
  $("#priceDisplay").classList.toggle("up", up);
  $("#priceDisplay").classList.toggle("down", !up);
  $("#changeBadge").textContent = (up ? "+" : "") + chg.toFixed(2) + "%";
  $("#changeBadge").className = "change-badge " + (up ? "up" : "down");
  $("#statHigh").textContent = fmt(S.high);
  $("#statLow").textContent = fmt(S.low);
  $("#statVol").textContent = "$" + compact(S.vol);
  const pct = clamp((S.price / MOON_PRICE) * 100, 0, 150);
  $("#moonPct").textContent = (pct >= 100 ? "+" : "") + pct.toFixed(1) + "%";
  $("#moonFill").style.width = Math.min(pct, 100) + "%";
  document.documentElement.style.setProperty("--mp", (pct / 100).toFixed(3));
}

const disp = { price: S.price, cash: S.cash, doge: S.doge, tot: START_CASH };

function lerpDisplay() {
  const k = 0.16;
  const target = totalValue();
  disp.price += (S.price - disp.price) * k;
  disp.cash += (S.cash - disp.cash) * k;
  disp.doge += (S.doge - disp.doge) * k;
  disp.tot += (target - disp.tot) * k;
  $("#priceDisplay").textContent = "$" + fmt(disp.price);
  $("#walletCash").textContent = usd(disp.cash);
  $("#walletDoge").textContent = dogeAmt(disp.doge);
  $("#walletTotal").textContent = usd(disp.tot);
  $("#walletAvg").textContent = S.doge > 0 ? "$" + fmt(S.avgCost) : "—";
  const pnl = S.doge > 0 ? (S.price - S.avgCost) * S.doge : 0;
  const pnlEl = $("#walletPnl");
  pnlEl.textContent = usd(pnl);
  pnlEl.className = pnl >= 0 ? "pos" : "neg";
  const ret = ((target - START_CASH) / START_CASH) * 100;
  const rEl = $("#walletReturn");
  rEl.textContent = (ret >= 0 ? "+" : "") + ret.toFixed(2) + "%";
  rEl.className = "wallet-return " + (ret >= 0 ? "pos" : "neg");
}

function drawChart() {
  const cv = $("#chart");
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.clientWidth;
  const H = cv.clientHeight;
  if (!W || !H) return;
  if (cv.width !== W * dpr || cv.height !== H * dpr) {
    cv.width = W * dpr;
    cv.height = H * dpr;
  }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);

  const padL = 56;
  const padR = 12;
  const padT = 8;
  const padB = 24;
  const data = S.H.slice(-Math.max(60, Math.min(S.H.length, Math.floor(W * 1.6))));
  if (data.length < 2) {
    ctx.fillStyle = "#8790a6";
    ctx.font = "12px Inter, sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("collecting data…", W / 2, H / 2);
    return;
  }

  const cw = W - padL - padR;
  const ch = H - padT - padB;
  const xFor = (i) => padL + (i / (data.length - 1)) * cw;

  let min = Infinity;
  let max = -Infinity;
  for (const d of data) {
    if (d.p < min) min = d.p;
    if (d.p > max) max = d.p;
  }
  const span = Math.max(max - min, Math.max(min, 1e-9) * 0.01);
  min -= span * 0.12;
  max += span * 0.12;
  const yFor = (v) => padT + ch - ((v - min) / (max - min)) * ch;

  ctx.lineWidth = 1;
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const y = yFor(v);
    ctx.strokeStyle = "rgba(255,255,255,0.05)";
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(W - padR, y);
    ctx.stroke();
    ctx.fillStyle = "#5f6a82";
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.textAlign = "right";
    ctx.fillText(fmt(v), padL - 6, y + 3);
  }

  ctx.textAlign = "left";
  ctx.fillStyle = "#5f6a82";
  const step = Math.ceil(data.length / 7);
  for (let i = 0; i < data.length; i += step) {
    const d = new Date(data[i].t);
    const label = String(d.getMinutes()).padStart(2, "0") + ":" + String(d.getSeconds()).padStart(2, "0");
    ctx.fillText(label, xFor(i) - 4, H - 8);
  }

  ctx.beginPath();
  for (let i = 0; i < data.length; i++) {
    const x = xFor(i);
    const y = yFor(data[i].p);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  const lineGrad = ctx.createLinearGradient(padL, 0, W - padR, 0);
  lineGrad.addColorStop(0, "rgba(245,166,35,0.55)");
  lineGrad.addColorStop(1, "rgba(255,215,142,0.95)");
  ctx.strokeStyle = lineGrad;
  ctx.lineWidth = 2;
  ctx.lineJoin = "round";
  ctx.shadowColor = "rgba(245,166,35,0.55)";
  ctx.shadowBlur = 12;
  ctx.stroke();
  ctx.shadowBlur = 0;

  ctx.lineTo(xFor(data.length - 1), H - padB);
  ctx.lineTo(xFor(0), H - padB);
  ctx.closePath();
  const fillGrad = ctx.createLinearGradient(0, padT, 0, H - padB);
  fillGrad.addColorStop(0, "rgba(245,166,35,0.18)");
  fillGrad.addColorStop(1, "rgba(245,166,35,0)");
  ctx.fillStyle = fillGrad;
  ctx.fill();

  const lastY = yFor(data[data.length - 1].p);
  ctx.setLineDash([5, 4]);
  ctx.strokeStyle = "rgba(255,255,255,0.25)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(padL, lastY);
  ctx.lineTo(W - padR, lastY);
  ctx.stroke();
  ctx.setLineDash([]);

  const lx = xFor(data.length - 1);
  ctx.beginPath();
  ctx.arc(lx, lastY, 4, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd78e";
  ctx.shadowColor = "#f5a623";
  ctx.shadowBlur = 14;
  ctx.fill();
  ctx.shadowBlur = 0;
}

let confettiParts = [];
function confetti(n) {
  for (let i = 0; i < n; i++) {
    confettiParts.push({
      x: rnd() * window.innerWidth,
      y: -20 - rnd() * 40,
      vx: (rnd() - 0.5) * 6,
      vy: 2 + rnd() * 5,
      r: 4 + rnd() * 7,
      rot: rnd() * Math.PI,
      vr: (rnd() - 0.5) * 0.4,
      col: ["#f5a623", "#ffd78e", "#ff9f43", "#6ef7cf", "#ff5d6c", "#8be0ff"][Math.floor(rnd() * 6)],
    });
  }
  requestAnimationFrame(confettiFrame);
}
function confettiFrame() {
  if (!confettiParts.length) return;
  const cv = $("#canvasFx");
  if (!cv) return;
  const ctx = cv.getContext("2d");
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const W = cv.clientWidth;
  const H = cv.clientHeight;
  if (cv.width !== W * dpr) { cv.width = W * dpr; cv.height = H * dpr; }
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, W, H);
  const alive = [];
  for (const p of confettiParts) {
    p.x += p.vx;
    p.y += p.vy;
    p.rot += p.vr;
    p.vy += 0.02;
    if (p.y < H + 30) alive.push(p);
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    ctx.fillStyle = p.col;
    ctx.fillRect(-p.r / 2, -p.r / 4, p.r, p.r / 2);
    ctx.restore();
  }
  confettiParts = alive;
  requestAnimationFrame(confettiFrame);
}

function renderNews() {
  const ul = $("#newsList");
  ul.innerHTML = S.news.slice(0, 9).map(n => `<li><span class="n-time">${n.time}</span>${n.txt}</li>`).join("");
}

function renderFeed() {
  const ul = $("#tradeFeed");
  ul.innerHTML = S.trades.slice(0, 40).map(t => {
    const icon = t.isYou ? "⭐ " : "";
    const whoCls = t.isYou ? "you" : "";
    const sideCls = t.side > 0 ? "buy" : "sell";
    const sideTxt = t.side > 0 ? "BUY" : "SELL";
    return (
      `<li><span class="who ${whoCls}">${icon}${t.who}</span>` +
      `<span class="side ${sideCls}">${sideTxt}</span>` +
      `<span class="amt">${dogeAmt(t.doge)}</span>` +
      `<span class="amt">@$${fmt(t.usd / t.doge)}</span></li>`
    );
  }).join("");
}

function inputAmt() {
  const v = parseFloat($("#amtInput").value);
  return isNaN(v) || v < 0 ? 0 : v;
}

function updatePreview() {
  const a = inputAmt();
  const el = $("#tradePreview");
  if (a <= 0) {
    el.textContent = side === "buy" ? "You get ~0.0000 DOGE" : "You receive ~$0.00";
    return;
  }
  if (side === "buy") {
    const spend = unit === "usd" ? a : a * S.price;
    const qty = unit === "usd" ? a / S.price : a;
    el.textContent = `Spend ${usd(spend)} · you get ~${dogeAmt(qty)} DOGE`;
  } else {
    const qty = unit === "usd" ? a / S.price : a;
    el.textContent = `Sell ~${dogeAmt(qty)} DOGE · you get ~${usd(qty * S.price * (1 - FEE))}`;
  }
}

function doTrade() {
  const a = inputAmt();
  if (a <= 0) {
    sfxErr();
    toast("Enter an amount first", "bad");
    return;
  }
  if (side === "buy") {
    const qty = unit === "usd" ? a / S.price : a;
    const cost = unit === "usd" ? a : qty * S.price;
    const fee = cost * FEE;
    const totalCost = cost + fee;
    if (totalCost > S.cash) {
      sfxErr();
      toast("Not enough cash to buy", "bad");
      return;
    }
    S.cash -= totalCost;
    S.doge += qty;
    S.avgCost = (S.avgCost * (S.doge - qty) + cost) / S.doge;
    S.flow += cost * IMPACT;
    addTrade(1, cost, "YOU", true);
    sfxBuy();
    toast(`🚀 Bought ${dogeAmt(qty)} DOGE for ${usd(cost)}`, "good");
  } else {
    const qty = unit === "usd" ? a / S.price : a;
    if (qty > S.doge) {
      sfxErr();
      toast("Not enough DOGE to sell", "bad");
      return;
    }
    const proceeds = qty * S.price;
    const fee = proceeds * FEE;
    S.doge -= qty;
    S.cash += proceeds - fee;
    S.flow -= proceeds;
    if (S.doge < 1e-9) S.avgCost = 0;
    addTrade(-1, proceeds, "YOU", true);
    sfxSell();
    toast(`📉 Sold ${dogeAmt(qty)} DOGE for ${usd(proceeds - fee)}`, "bad");
  }
  persist();
}

function sfxErr() { beep(180, 0.15, "square", 0.04); }

function setSide(s) {
  side = s;
  $("#tabBuy").classList.toggle("active", s === "buy");
  $("#tabSell").classList.toggle("active", s === "sell");
  const btn = $("#actionBtn");
  btn.classList.toggle("buy", s === "buy");
  btn.classList.toggle("sell", s === "sell");
  btn.textContent = s === "buy" ? "BUY DOGE 🚀" : "SELL DOGE 🐻";
}

function setUnit(u) {
  unit = u;
  $("#unitUsd").classList.toggle("active", u === "usd");
  $("#unitDoge").classList.toggle("active", u === "doge");
}

function chipClick(pct) {
  if (side === "buy") {
    const max = unit === "usd" ? S.cash : S.cash / Math.max(S.price, 1e-9);
    $("#amtInput").value = (max * pct).toFixed(unit === "usd" ? 2 : 4);
  } else {
    const max = unit === "usd" ? S.doge * S.price : S.doge;
    $("#amtInput").value = (max * pct).toFixed(unit === "usd" ? 2 : 4);
  }
  updatePreview();
}

function render() {
  renderStats();
  renderMode();
  renderNews();
  renderFeed();
  lerpDisplay();
}

let rafId = null;
function animLoop(t) {
  rafId = requestAnimationFrame(animLoop);
  lerpDisplay();
  updatePreview();
  drawChart();
}
requestAnimationFrame(animLoop);

const stepTimer = setInterval(() => {
  priceStep();
  if (S.tickN % 10 === 0) render();
}, TICK);

window.addEventListener("load", () => {
  restore();
  $("#muteBtn").textContent = muted ? "🔇" : "🔊";
  setSide("buy");
  setUnit("usd");
  render();
  $("#amtInput").addEventListener("input", updatePreview);
  $("#amtInput").addEventListener("keydown", (e) => { if (e.key === "Enter") doTrade(); });
  $("#unitUsd").addEventListener("click", () => setUnit("usd"));
  $("#unitDoge").addEventListener("click", () => setUnit("doge"));
  $("#tabBuy").addEventListener("click", () => setSide("buy"));
  $("#tabSell").addEventListener("click", () => setSide("sell"));
  $("#actionBtn").addEventListener("click", doTrade);
  document.querySelectorAll(".chip").forEach((c) => c.addEventListener("click", () => chipClick(parseFloat(c.dataset.p))));
  $("#muteBtn").addEventListener("click", () => {
    muted = !muted;
    localStorage.setItem("d2m_mute", muted ? "1" : "0");
    $("#muteBtn").textContent = muted ? "🔇" : "🔊";
  });
  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Reset your wallet back to $10,000 starting cash?")) {
      localStorage.removeItem("d2m_wallet");
      location.reload();
    }
  });
  $("#moonClose").addEventListener("click", () => {
    $("#moonOverlay").classList.add("hidden");
    lastTrig = 0;
    S.moonShown = false;
  });

  const intro = $("#dogeIntro");
  let introDone = false;
  const dismissIntro = () => {
    if (introDone) return;
    introDone = true;
    intro.classList.add("gone");
    setTimeout(() => intro.remove(), 1200);
  };
  intro.addEventListener("click", dismissIntro);
  setTimeout(dismissIntro, 2350);
});