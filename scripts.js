/* ======== CONFIG ======== */
// default TradingView symbols shown in dropdown
const TV_DEFAULTS = ["NSE:NIFTY","NSE:BANKNIFTY","NSE:RELIANCE","NSE:HDFCBANK","NASDAQ:AAPL","NASDAQ:TSLA"];

// pagination size for scripts
const PAGE_SIZE = 10;

/* ======== BUILT-IN SAMPLE SCRIPTS (you can remove later) ======== */
let SCRIPTS = [
  {
    id: "hma-crossover",
    title: "HMA 50/100 Crossover (Strategy)",
    category: "Strategy",
    tags: ["hma","crossover","trend"],
    description: "Simple HMA crossover with entry/exit.",
    code: `//@version=5
strategy("HMA 50/100 Crossover", overlay=true)
hma50 = ta.hma(close, 50)
hma100 = ta.hma(close, 100)
plot(hma50, color=color.yellow)
plot(hma100, color=color.orange)
if ta.crossover(hma50, hma100)
    strategy.entry("Long", strategy.long)
if ta.crossunder(hma50, hma100)
    strategy.close("Long")`
  },
  {
    id: "triangle-detector",
    title: "Triangle Pattern Detector (Indicator)",
    category: "Pattern",
    tags: ["pattern","triangle","breakout"],
    description: "Visual upper/lower bounds from lookback highs/lows.",
    code: `//@version=5
indicator("Triangle Detector", overlay=true)
len = input.int(20)
plot(ta.highest(len), color=color.red)
plot(ta.lowest(len), color=color.green)`
  }
];

/* ======== DOM ======== */
const grid = document.getElementById("grid");
const pager = document.getElementById("pager");
const catFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("search");
const tagFilter = document.getElementById("tagFilter");
const newScriptBtn = document.getElementById("newScriptBtn");
const scriptCount = document.getElementById("scriptCount");

const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mDesc = document.getElementById("mDesc");
const mTags = document.getElementById("mTags");
const mCode = document.getElementById("mCode");
const copyBtn = document.getElementById("copyBtn");
const openTV = document.getElementById("openTV");
const closeBtn = document.getElementById("close");
const toast = document.getElementById("toast");

const tvSelect = document.getElementById("tvSymbol");

let popularityChart, cryptoChart, fxChart;
let currentPage = 1;

/* ======== UTILS ======== */
function esc(s){return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")}
function getViews(){return JSON.parse(localStorage.getItem("views_map")||"{}")}
function incView(id){const m=getViews(); m[id]=(m[id]||0)+1; localStorage.setItem("views_map",JSON.stringify(m))}
function getFiltered(){
  const q = (searchInput?.value||"").toLowerCase();
  const c = catFilter?.value || "";
  const t = (tagFilter?.value||"").toLowerCase().split(",").map(x=>x.trim()).filter(Boolean);
  return SCRIPTS.filter(s=>{
    if(c && s.category!==c) return false;
    if(t.length && !t.every(tt => s.tags.join(" ").toLowerCase().includes(tt))) return false;
    if(!q) return true;
    return s.title.toLowerCase().includes(q) || s.description.toLowerCase().includes(q) ||
           s.tags.join(" ").toLowerCase().includes(q) || s.code.toLowerCase().includes(q);
  });
}

/* ======== RENDER: categories, grid, pager ======== */
function renderCategories(){
  const cats = [...new Set(SCRIPTS.map(s=>s.category))];
  catFilter.innerHTML = "<option value=''>All categories</option>";
  cats.forEach(c=>{ const o=document.createElement("option"); o.value=c; o.textContent=c; catFilter.appendChild(o); });
}
function renderGrid(){
  const list = getFiltered();
  scriptCount.textContent = list.length.toLocaleString();
  const totalPages = Math.max(1, Math.ceil(list.length/PAGE_SIZE));
  currentPage = Math.min(currentPage, totalPages);

  grid.innerHTML = "";
  const start = (currentPage-1)*PAGE_SIZE;
  const slice = list.slice(start, start+PAGE_SIZE);

  if(!slice.length){ grid.innerHTML = `<div class="muted">No scripts found.</div>`; pager.innerHTML=""; return; }

  const views = getViews();
  slice.forEach(s=>{
    const el = document.createElement("div"); el.className="script-card";
    el.innerHTML = `
      <div>
        <h3>${esc(s.title)}</h3>
        <p>${esc(s.description)}</p>
        <div class="tags">${s.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("")}</div>
      </div>
      <div class="card-footer">
        <small class="muted">${esc(s.category)} · Views: ${views[s.id]||0}</small>
        <div>
          <button class="btn" data-id="${s.id}" onclick="openModal('${s.id}')">View</button>
          <button class="btn" onclick='navigator.clipboard.writeText(\`${s.code.replace(/`/g,"\\`")}\`).then(()=>showToast("Copied"))'>Copy</button>
        </div>
      </div>`;
    grid.appendChild(el);
  });

  // pager
  pager.innerHTML = "";
  for(let p=1;p<=totalPages;p++){
    const b = document.createElement("button");
    b.textContent = p;
    if(p===currentPage) b.style.borderColor="rgba(110,231,183,0.6)";
    b.onclick = ()=>{ currentPage=p; renderGrid(); };
    pager.appendChild(b);
  }
}

/* ======== MODAL ======== */
window.openModal = function(id){
  const s = SCRIPTS.find(x=>x.id===id); if(!s) return;
  mTitle.textContent = s.title;
  mDesc.textContent = s.description;
  mTags.innerHTML = s.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join("");
  mCode.textContent = s.code; Prism.highlightElement(mCode);
  modal.style.display="flex";
  incView(id); renderGrid(); renderPopularityChart();
  openTV.href = "https://www.tradingview.com/chart/?solution=copy-paste";
};
copyBtn.onclick = ()=>{ navigator.clipboard.writeText(mCode.textContent).then(()=>showToast("Copied")) };
closeBtn.onclick = ()=> modal.style.display="none";
window.onclick = e=>{ if(e.target===modal) modal.style.display="none"; };

/* ======== TOAST ======== */
function showToast(msg="Done"){ toast.textContent=msg; toast.classList.add("show"); setTimeout(()=>toast.classList.remove("show"),1200); }

/* ======== TRADINGVIEW: small snapshot with selectable symbol ======== */
function renderTradingView(symbol){
  try{
    document.getElementById("tv-widget").innerHTML = "";
    new TradingView.widget({
      width: "100%", height: 220, symbol,
      interval: "60", timezone: "Asia/Kolkata",
      theme: "dark", style: "1", locale: "en",
      container_id: "tv-widget", allow_symbol_change: true
    });
  }catch(e){ console.warn("TV widget failed", e); }
}

/* ======== CRYPTO: prices + 7d chart (CoinGecko) ======== */
async function cryptoLoad(){
  try{
    // live prices
    const priceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
    const prices = await (await fetch(priceUrl)).json();
    document.getElementById("btcPrice").textContent = `$${prices.bitcoin.usd.toLocaleString()}`;
    document.getElementById("ethPrice").textContent = `$${prices.ethereum.usd.toLocaleString()}`;

    // 7-day series
    const [btc, eth] = await Promise.all([
      fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7").then(r=>r.json()),
      fetch("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7").then(r=>r.json())
    ]);
    const labels = btc.prices.map(p=> new Date(p[0]).toLocaleDateString("en-IN",{day:"2-digit",month:"short"}));
    const btcSeries = btc.prices.map(p=> p[1]);
    const ethSeries = eth.prices.map(p=> p[1]);

    const ctx = document.getElementById("cryptoChart").getContext("2d");
    if(cryptoChart) cryptoChart.destroy();
    cryptoChart = new Chart(ctx, {
      type: "line",
      data: { labels, datasets: [
        { label: "BTC (USD)", data: btcSeries, tension: .3, fill: false },
        { label: "ETH (USD)", data: ethSeries, tension: .3, fill: false }
      ]},
      options: { plugins:{legend:{display:true}}, scales:{x:{display:true}, y:{display:true}} }
    });
  }catch(e){ console.warn("crypto error", e); }
}

/* ======== FOREX: USD→INR & EUR→INR + mini chart (exchangerate.host) ======== */
async function fxLoad(){
  try{
    // latest
    const latest = await (await fetch("https://api.exchangerate.host/latest?base=USD&symbols=INR,EUR")).json();
    const usdInr = latest.rates.INR;
    const eurInrObj = await (await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=INR")).json();
    const eurInr = eurInrObj.rates.INR;
    document.getElementById("usdInr").textContent = usdInr.toFixed(2);
    document.getElementById("eurInr").textContent = eurInr.toFixed(2);

    // 10-day timeseries USD→INR
    const end = new Date();
    const start = new Date(Date.now()-9*24*3600*1000);
    const fmt = d=> d.toISOString().slice(0,10);
    const tsUrl = `https://api.exchangerate.host/timeseries?base=USD&symbols=INR&start_date=${fmt(start)}&end_date=${fmt(end)}`;
    const ts = await (await fetch(tsUrl)).json();
    const labels = Object.keys(ts.rates).sort();
    const series = labels.map(k=> ts.rates[k].INR);

    const ctx = document.getElementById("fxChart").getContext("2d");
    if(fxChart) fxChart.destroy();
    fxChart = new Chart(ctx, {
      type:"line",
      data:{ labels, datasets:[{ label:"USD→INR", data:series, tension:.3, fill:false }]},
      options:{ plugins:{legend:{display:true}}, scales:{x:{display:true}, y:{display:true}}}
    });
  }catch(e){ console.warn("fx error", e); }
}

/* ======== NEWS: Hacker News (no CORS issues) ======== */
async function newsLoad(){
  const box = document.getElementById("newsList");
  try{
    const ids = await (await fetch("https://hacker-news.firebaseio.com/v0/topstories.json")).json();
    const top = await Promise.all(ids.slice(0,8).map(id=> fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r=>r.json())));
    box.innerHTML = top.map(a => {
      const t = a.title || "Untitled";
      const u = a.url || `https://news.ycombinator.com/item?id=${a.id}`;
      return `<div><a href="${u}" target="_blank" rel="noopener">${esc(t)}</a><div class="muted">HN · ${new Date(a.time*1000).toLocaleString()}</div></div>`;
    }).join("<hr/>");
  }catch(e){
    console.warn("news error", e);
    box.innerHTML = `<div class="muted">News temporarily unavailable.</div>`;
  }
}

/* ======== POPULARITY CHART ======== */
function renderPopularityChart(){
  const map = getViews();
  const labels = SCRIPTS.map(s=>s.title);
  const data = SCRIPTS.map(s=> map[s.id]||0);
  const ctx = document.getElementById("popularityChart").getContext("2d");
  if(popularityChart) popularityChart.destroy();
  popularityChart = new Chart(ctx, {
    type:"bar",
    data:{ labels, datasets:[{ label:"Views", data }]},
    options:{ plugins:{legend:{display:false}}, scales:{y:{beginAtZero:true}} }
  });
}

/* ======== EXTERNAL SCRIPTS LOADER (bulk thousands) ========
Create /data/scripts.json in repo with format:
[
  {"id":"ema-20","title":"EMA 20","category":"Indicator","tags":["ema","trend"],"description":"20EMA plot","code":"//@version=5\nindicator(\"EMA20\", overlay=true)\nplot(ta.ema(close,20))"},
  ...
]
============================================================= */
async function tryLoadExternalScripts(){
  try{
    const res = await fetch("./data/scripts.json", {cache:"no-store"});
    if(res.ok){
      const data = await res.json();
      if(Array.isArray(data) && data.length){
        SCRIPTS = data; // replace built-ins
      }
    }
  }catch(e){ /* ignore if file missing */ }
}

/* ======== INIT ======== */
function bindEvents(){
  searchInput.addEventListener("input", ()=>{ currentPage=1; renderGrid(); });
  tagFilter.addEventListener("input", ()=>{ currentPage=1; renderGrid(); });
  catFilter.addEventListener("change", ()=>{ currentPage=1; renderGrid(); });
  document.getElementById("sortTrending").onclick = ()=>{
    const map = getViews();
    SCRIPTS.sort((a,b)=> (map[b.id]||0)-(map[a.id]||0)); currentPage=1; renderGrid();
  };
  newScriptBtn.onclick = ()=>{
    const id = "s"+Date.now();
    SCRIPTS.unshift({id,title:`Quick Sample ${SCRIPTS.length+1}`,category:"Custom",tags:["sample"],description:"Added from UI",code:"//@version=5\nindicator('Quick')\nplot(close)"});
    renderCategories(); currentPage=1; renderGrid(); showToast("Sample added (local)");
  };
  // TV dropdown
  if(tvSelect){
    // fill options from config (keeps manual ones too)
    TV_DEFAULTS.forEach(sym=>{
      if(![...tvSelect.options].some(o=>o.value===sym)){
        const o=document.createElement("option"); o.value=sym; o.textContent=sym; tvSelect.appendChild(o);
      }
    });
    tvSelect.onchange = ()=> renderTradingView(tvSelect.value);
  }
}

async function init(){
  bindEvents();
  await tryLoadExternalScripts();
  renderCategories();
  renderGrid();
  renderPopularityChart();
  // market snapshot
  renderTradingView(tvSelect?.value || TV_DEFAULTS[0]);
  // data widgets
  cryptoLoad(); setInterval(cryptoLoad, 60_000);
  fxLoad(); setInterval(fxLoad, 5*60_000);
  newsLoad();
}

init();
