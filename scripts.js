/**
 * scripts.js
 * - Edit the SCRIPTS array to add content
 * - No server needed; works on GitHub Pages
 */

/* ------------------- CONFIG ------------------- */
// TradingView symbol (change to any TradingView symbol: e.g. "NSE:NIFTY", "NASDAQ:AAPL")
let TV_SYMBOL = "NSE:NIFTY"; // edit if needed

// OPTIONAL: NewsAPI key (sign up at https://newsapi.org) to enable live news
const NEWSAPI_KEY = ""; // paste your key here if you have one
const NEWS_TOPICS = ["technology","finance"];

/* ------------------- SAMPLE SCRIPTS ------------------- */
let SCRIPTS = [
  {
    id: "hma-crossover",
    title: "HMA Crossover Strategy",
    category: "Strategy",
    tags: ["hma","crossover","trend"],
    description: "HMA 50/100 crossover strategy with long entries and exits.",
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
    title: "Triangle Pattern Detector",
    category: "Pattern",
    tags: ["pattern","triangle","breakout"],
    description: "Detects simple triangle-like consolidation using highs/lows.",
    code: `//@version=5
indicator("Triangle Detector", overlay=true)
len = input.int(20)
plot(ta.highest(len), color=color.red)
plot(ta.lowest(len), color=color.green)`
  },
  {
    id: "simple-ma",
    title: "Simple Moving Average Indicator",
    category: "Indicator",
    tags: ["ma","trend"],
    description: "This example sets up an SMA indicator to help traders identify trends based on the smoothed average price over a set period.",
    code: `//@version=5
indicator("Simple Moving Average", shorttitle="SMA", overlay=true)
length = input.int(200, minval=1, title="Length")
smaValue = ta.sma(close, length)
plot(smaValue, title="SMA", color=color.blue)`
  },
  {
    id: "ma-cross",
    title: "Moving Average Cross Strategy",
    category: "Strategy",
    tags: ["ma","crossover","trend"],
    description: "This example adds a second simple moving average to create a trend following trading strategy.",
    code: `//@version=5
strategy("Moving Average Cross", overlay=true)
shortLength = input.int(30, minval=1, title="Short Moving Average Length")
longLength = input.int(200, minval=1, title="Long Moving Average Length")
shortMA = ta.sma(close, shortLength)
longMA = ta.sma(close, longLength)
plot(shortMA, title="Short Moving Average", color=color.red)
plot(longMA, title="Long Moving Average", color=color.blue)
longCondition = ta.crossover(shortMA, longMA)
shortCondition = ta.crossunder(shortMA, longMA)
if (longCondition)
    strategy.entry("Long", strategy.long)
if (shortCondition)
    strategy.close("Long")
if (shortCondition)
    strategy.entry("Short", strategy.short)
if (longCondition)
    strategy.close("Short")`
  },
  {
    id: "price-channels",
    title: "Price Channels Strategy",
    category: "Strategy",
    tags: ["channels","atr","mean-reversion"],
    description: "This strategy uses moving averages and average true range to calculate fair value and bid when price is at the extremities of good value.",
    code: `//@version=5
strategy("Price Channels", overlay=true)
fairvalue = input.int(21, 'Exponential Moving Average', minval=1)
hold = input.int(30, 'Holding Period', minval=1)
mult = input.float(2, 'Multiplier', minval=0.1, step = 0.1)
atr = ta.atr(14)
ma = ta.ema(close, fairvalue)
resistance = ma + (atr * mult)
support = ma - (atr * mult)
plot(ma, 'Average', color=#AAAAAA88)
plot(support, 'Support', color=#00DD0088)
plot(resistance, 'Resistance', color=#DD000088)
if ta.crossover(close, support)
    strategy.entry("Long", strategy.long)
if ta.barssince(ta.crossover(close, support)) > hold
    strategy.close("Long", comment="close 30 days")
if ta.crossover(close, resistance)
    strategy.close("Long", comment="close overvalued")`
  },
  {
    id: "breakout-sniper",
    title: "Breakout Sniper Strategy",
    category: "Strategy",
    tags: ["breakout","trend"],
    description: "This strategy identifies and backtests a breakout sniper bot, entering long positions when price breaks above the highest high over a lookback period.",
    code: `//@version=5
strategy("Breakout Sniper", overlay=true)
lookback_period = input.int(365, "Lookback Period", minval=1)
hold = input.int(30, 'Holding Period', minval=1)
highest_high = ta.highest(high, lookback_period)
lowest_low = ta.lowest(low, lookback_period)
plot(highest_high, 'HIGH', color=#CC000088)
plot(lowest_low, 'LOW', color=#00CC0088)
breakout = high >= highest_high
breakdown = low <= lowest_low
if (breakout)
    strategy.entry("Long", strategy.long)
if (ta.barssince(breakout) > hold)
    strategy.close("Long")
if (breakdown)
    strategy.entry("Short", strategy.short)
if (ta.barssince(breakdown) > hold)
    strategy.close("Short")`
  },
  {
    id: "rsi-divergence",
    title: "RSI Divergence Indicator",
    category: "Indicator",
    tags: ["rsi","divergence","oscillator"],
    description: "Detects RSI divergence for potential reversals.",
    code: `//@version=5
indicator("RSI Divergence", overlay=false)
rsi = ta.rsi(close, 14)
plot(rsi, color=color.blue)
plot(50, color=color.gray)`
  },
  {
    id: "macd-strategy",
    title: "MACD Crossover Strategy",
    category: "Strategy",
    tags: ["macd","crossover","momentum"],
    description: "Simple MACD crossover strategy for entries and exits.",
    code: `//@version=5
strategy("MACD Strategy", overlay=true)
[macdLine, signalLine, _] = ta.macd(close, 12, 26, 9)
plot(macdLine - signalLine, "Histogram", color=color.green, style=plot.style_histogram)
plot(macdLine, color=color.blue)
plot(signalLine, color=color.orange)
if ta.crossover(macdLine, signalLine)
    strategy.entry("Long", strategy.long)
if ta.crossunder(macdLine, signalLine)
    strategy.close("Long")`
  },
  // add more as needed
];

/* ------------------- UI wiring ------------------- */
const grid = document.getElementById("grid");
const catFilter = document.getElementById("categoryFilter");
const searchInput = document.getElementById("search");
const tagFilter = document.getElementById("tagFilter");
const newScriptBtn = document.getElementById("newScriptBtn");

const modal = document.getElementById("modal");
const mTitle = document.getElementById("mTitle");
const mDesc = document.getElementById("mDesc");
const mTags = document.getElementById("mTags");
const mCode = document.getElementById("mCode");
const copyBtn = document.getElementById("copyBtn");
const openTV = document.getElementById("openTV");
const closeBtn = document.getElementById("close");
const toast = document.getElementById("toast");

let popularityChart, cryptoChart, fxChart;

const tvSymbolInput = document.getElementById("tvSymbol");

/* ------------------- Render helpers ------------------- */
function renderCategories(){
  const cats = [...new Set(SCRIPTS.map(s=>s.category))];
  catFilter.innerHTML = "<option value=''>All categories</option>";
  cats.forEach(c=>{
    const o = document.createElement("option"); o.value=c; o.textContent=c; catFilter.appendChild(o);
  });
}

function getViewCount(id){
  const map = JSON.parse(localStorage.getItem("views_map")||"{}");
  return map[id]||0;
}
function incViewCount(id){
  const map = JSON.parse(localStorage.getItem("views_map")||"{}");
  map[id] = (map[id]||0)+1;
  localStorage.setItem("views_map", JSON.stringify(map));
}

/* escape helper */
function escHTML(s){ return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

function renderGrid(){
  const q = searchInput.value.trim().toLowerCase();
  const cat = catFilter.value;
  const tagq = tagFilter.value.trim().toLowerCase();

  grid.innerHTML = "";
  const filtered = SCRIPTS.filter(s=>{
    if(cat && s.category !== cat) return false;
    if(tagq){
      const tags = s.tags.join(" ").toLowerCase();
      if(!tagq.split(",").every(t=>tags.includes(t.trim()))) return false;
    }
    if(!q) return true;
    return s.title.toLowerCase().includes(q) ||
           s.description.toLowerCase().includes(q) ||
           s.tags.join(" ").toLowerCase().includes(q) ||
           s.code.toLowerCase().includes(q);
  });

  if(filtered.length === 0){
    grid.innerHTML = `<div class="muted">No scripts found.</div>`;
    return;
  }

  filtered.forEach(s=>{
    const card = document.createElement("div"); card.className="script-card";
    card.innerHTML = `
      <div>
        <h3>${escHTML(s.title)}</h3>
        <p>${escHTML(s.description)}</p>
        <div class="tags">${s.tags.map(t=>`<span class="tag">${escHTML(t)}</span>`).join("")}</div>
      </div>
      <div class="card-footer">
        <small class="muted">${escHTML(s.category)} · Views: ${getViewCount(s.id)}</small>
        <div>
          <button class="btn viewBtn" data-id="${s.id}">View</button>
          <button class="btn copyQuick" data-id="${s.id}">Copy</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  // add listeners
  document.querySelectorAll(".viewBtn").forEach(b=>b.onclick = e=>openModal(e.target.dataset.id));
  document.querySelectorAll(".copyQuick").forEach(b=>b.onclick = e=>{
    const s = SCRIPTS.find(x=>x.id===e.target.dataset.id);
    navigator.clipboard.writeText(s.code).then(()=>showToast("Copied"));
  });
}

/* ------------------- Modal ------------------- */
function openModal(id){
  const s = SCRIPTS.find(x=>x.id===id);
  if(!s) return;
  mTitle.textContent = s.title;
  mDesc.textContent = s.description;
  mTags.innerHTML = s.tags.map(t=>`<span class="tag">${escHTML(t)}</span>`).join("");
  mCode.textContent = s.code;
  Prism.highlightElement(mCode);
  modal.style.display = "flex";
  modal.setAttribute("aria-hidden", "false");
  incViewCount(id);
  renderGrid();
  renderPopularityChart();
  openTV.href = `https://www.tradingview.com/chart/?symbol=${TV_SYMBOL}`;
}
copyBtn.onclick = ()=>{ navigator.clipboard.writeText(mCode.textContent).then(()=>showToast("Copied")); }
closeBtn.onclick = ()=> {modal.style.display = "none"; modal.setAttribute("aria-hidden", "true");}
window.onclick = e=>{ if(e.target === modal) {modal.style.display = "none"; modal.setAttribute("aria-hidden", "true");} }

/* ------------------- Toast ------------------- */
function showToast(msg="Done"){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"),1200);
}

/* ------------------- Charts & Live data ------------------- */
async function fetchCrypto(){
  try{
    const priceUrl = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
    const priceRes = await fetch(priceUrl);
    const priceJson = await priceRes.json();
    const btc = priceJson.bitcoin.usd;
    const eth = priceJson.ethereum.usd;
    document.getElementById("btcPrice").textContent = `$${btc.toLocaleString()}`;
    document.getElementById("ethPrice").textContent = `$${eth.toLocaleString()}`;

    // Fetch historical for chart
    const btcHist = await fetch("https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=7");
    const btcHistJson = await btcHist.json();
    const ethHist = await fetch("https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7");
    const ethHistJson = await ethHist.json();

    const labels = btcHistJson.prices.map(p => new Date(p[0]).toLocaleDateString());
    const btcData = btcHistJson.prices.map(p => p[1]);
    const ethData = ethHistJson.prices.map(p => p[1]);

    if(!cryptoChart){
      const ctx = document.getElementById("cryptoChart").getContext("2d");
      cryptoChart = new Chart(ctx, {
        type: 'line',
        data: { labels, datasets:[
          {label:'BTC',data:btcData,borderColor:'rgba(255,193,7,0.9)',fill:false},
          {label:'ETH',data:ethData,borderColor:'rgba(99,102,241,0.9)',fill:false}
        ]},
        options:{plugins:{legend:{display:true}},scales:{y:{beginAtZero:false}}}
      });
    } else {
      cryptoChart.data.labels = labels;
      cryptoChart.data.datasets[0].data = btcData;
      cryptoChart.data.datasets[1].data = ethData;
      cryptoChart.update();
    }
  }catch(err){
    document.getElementById("btcPrice").textContent = "N/A";
    document.getElementById("ethPrice").textContent = "N/A";
    console.warn("crypto fetch failed", err);
  }
}

async function fetchFX(){
  try{
    const url = "https://cdn.jsdelivr.net/npm/@fawazahmed0/currency-api@latest/v1/currencies/usd.json";
    const res = await fetch(url);
    const json = await res.json();
    const data = json.usd;
    const usdInr = data.inr;
    const usdEur = data.eur;
    const eurInr = usdInr / usdEur;

    document.getElementById("usdInr").textContent = `${usdInr.toFixed(2)}`;
    document.getElementById("eurInr").textContent = `${eurInr.toFixed(2)}`;

    // small fx chart
    if(!fxChart){
      const ctx = document.getElementById("fxChart").getContext("2d");
      fxChart = new Chart(ctx, {
        type:'bar',
        data:{labels:['USD→INR','EUR→INR'], datasets:[{label:'Rate',data:[usdInr,eurInr],backgroundColor:['rgba(59,130,246,0.9)','rgba(236,72,153,0.9)']}]},
        options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:false}}}
      });
    } else {
      fxChart.data.datasets[0].data = [usdInr, eurInr];
      fxChart.update();
    }
  }catch(err){ 
    document.getElementById("usdInr").textContent = "N/A";
    document.getElementById("eurInr").textContent = "N/A";
    console.warn("fx fetch failed", err); 
  }
}

/* popularity chart from localStorage */
function renderPopularityChart(){
  const map = JSON.parse(localStorage.getItem("views_map")||"{}");
  const labels = SCRIPTS.map(s=>s.title);
  const data = SCRIPTS.map(s=>map[s.id]||0);
  const ctx = document.getElementById("popularityChart").getContext("2d");
  if(popularityChart) popularityChart.destroy();
  popularityChart = new Chart(ctx, {
    type:'bar',
    data:{labels,datasets:[{label:'Views',data,backgroundColor:'rgba(99,102,241,0.9)'}]},
    options:{plugins:{legend:{display:false}},scales:{y:{beginAtZero:true}}}
  });
}

/* ------------------- News (static fallback or optional NewsAPI) ------------------- */
async function fetchNews(){
  const container = document.getElementById("newsList");
  container.innerHTML = "<div class='muted'>Loading news...</div>";

  if(NEWSAPI_KEY){
    try{
      const q = NEWS_TOPICS.join(" OR ");
      const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&pageSize=6&sortBy=publishedAt&apiKey=${NEWSAPI_KEY}`;
      const res = await fetch(url);
      const json = await res.json();
      if(json.articles){
        container.innerHTML = json.articles.map(a=>`<div><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a><div class="muted">${a.source.name} · ${new Date(a.publishedAt).toLocaleString()}</div></div>`).join("<hr/>");
        return;
      }
    }catch(err){
      console.warn("news api failed", err);
    }
  }

  // fallback to TechCrunch JSON
  try {
    const fallbackUrl = "https://techcrunch.com/wp-json/wp/v2/posts?per_page=6&context=embed";
    const res = await fetch(fallbackUrl);
    const json = await res.json();
    container.innerHTML = json.map(a=>`<div><a href="${a.link}" target="_blank" rel="noopener">${a.title.rendered}</a><div class="muted">TechCrunch · ${new Date(a.date).toLocaleString()}</div></div>`).join("<hr/>");
  } catch (err) {
    // static fallback if all fails
    const staticFallback = [
      {title:"AI model compression techniques — quick primer",url:"#",src:"PineHub"},
      {title:"How to structure backtests for robustness",url:"#",src:"Research"},
      {title:"Crypto market microstructure explained",url:"#",src:"CryptoLab"}
    ];
    container.innerHTML = staticFallback.map(a=>`<div><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a><div class="muted">${a.src}</div></div>`).join("<hr/>");
  }
}

/* ------------------- TradingView widget */
function renderTradingView(){
  try{
    TV_SYMBOL = tvSymbolInput.value || "NSE:NIFTY";
    const widgetDiv = document.getElementById("tv-widget");
    widgetDiv.innerHTML = "";
    new TradingView.widget({
      "width": "100%",
      "height": 220,
      "symbol": TV_SYMBOL,
      "interval": "60",
      "timezone": "UTC",
      "theme": "dark",
      "style": "1",
      "locale": "en",
      "toolbar_bg": "#f1f3f6",
      "enable_publishing": false,
      "allow_symbol_change": true,
      "container_id": "tv-widget"
    });
  }catch(err){ 
    console.warn("TradingView init failed", err); 
    document.getElementById("tv-widget").innerHTML = "<div class='muted'>TradingView widget failed to load.</div>";
  }
}

/* ------------------- Data hub (list files) ------------------- */
function renderDataList(){
  const ul = document.getElementById("dataList");
  // You can add downloadable dataset links by committing files into /data and listing them here:
  const demo = [
    {name:"sample_backtest.csv", href:"/data/sample_backtest.csv"},
    {name:"region_cases.json", href:"/data/region_cases.json"},
    {name:"crypto_historical.csv", href:"/data/crypto_historical.csv"},
    {name:"forex_rates.json", href:"/data/forex_rates.json"}
  ];
  ul.innerHTML = demo.map(d=>`<li><a href="${d.href}" target="_blank">${d.name}</a></li>`).join("");
}

/* ------------------- Persistence for SCRIPTS ------------------- */
function saveScripts(){
  localStorage.setItem("scripts", JSON.stringify(SCRIPTS));
}

/* ------------------- Initialization ------------------- */
function init(){
  const savedScripts = localStorage.getItem("scripts");
  if(savedScripts) SCRIPTS = JSON.parse(savedScripts);
  renderCategories();
  renderGrid();
  renderTradingView();
  fetchCrypto(); setInterval(fetchCrypto, 60_000); // update every minute
  fetchFX(); setInterval(fetchFX, 5*60_000);
  fetchNews();
  renderDataList();
  renderPopularityChart();
}

/* ------------------- Buttons / events ------------------- */
searchInput.addEventListener("input", renderGrid);
catFilter.addEventListener("change", renderGrid);
tagFilter.addEventListener("input", renderGrid);
document.getElementById("sortTrending").onclick = ()=> {
  const map = JSON.parse(localStorage.getItem("views_map")||"{}");
  SCRIPTS.sort((a,b)=> (map[b.id]||0) - (map[a.id]||0));
  renderGrid();
};

newScriptBtn.onclick = ()=>{
  const id = "s"+Date.now();
  SCRIPTS.unshift({id,title:"Quick Sample "+(SCRIPTS.length+1),category:"Custom",tags:["sample"],description:"Added from UI",code:"//@version=5\nindicator('Quick')\nplot(close)"});
  saveScripts();
  renderCategories(); renderGrid();
  showToast("Sample added (local)");
};

tvSymbolInput.addEventListener("change", renderTradingView);

/* run */
init();
