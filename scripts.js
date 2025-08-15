/**
 * scripts.js
 * - Edit the SCRIPTS array to add content
 * - No server needed; works on GitHub Pages
 */

/* ------------------- CONFIG ------------------- */
// TradingView symbol (change to any TradingView symbol: e.g. "NSE:NIFTY", "NASDAQ:AAPL")
const TV_SYMBOL = "NSE:NIFTY"; // edit if needed

// OPTIONAL: NewsAPI key (sign up at https://newsapi.org) to enable live news
const NEWSAPI_KEY = ""; // paste your key here if you have one
const NEWS_TOPICS = ["technology","finance"];

/* ------------------- SAMPLE SCRIPTS ------------------- */
const SCRIPTS = [
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
  // add more objects here
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

let popularityChart, cryptoChart, fxChart, popChart;

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
  const tagq = (tagFilter?tagFilter.value.trim().toLowerCase() : "");

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
  incViewCount(id);
  renderGrid();
  renderPopularityChart();
  openTV.href = `https://www.tradingview.com/chart/?solution=copy-paste`;
}
copyBtn.onclick = ()=>{ navigator.clipboard.writeText(mCode.textContent).then(()=>showToast("Copied")); }
closeBtn.onclick = ()=> modal.style.display = "none";
window.onclick = e=>{ if(e.target === modal) modal.style.display = "none"; }

/* ------------------- Toast ------------------- */
function showToast(msg="Done"){
  toast.textContent = msg;
  toast.classList.add("show");
  setTimeout(()=> toast.classList.remove("show"),1200);
}

/* ------------------- Charts & Live data ------------------- */
async function fetchCrypto(){
  try{
    const url = "https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum&vs_currencies=usd";
    const res = await fetch(url);
    const json = await res.json();
    const btc = json.bitcoin.usd;
    const eth = json.ethereum.usd;
    document.getElementById("btcPrice").textContent = `$${btc.toLocaleString()}`;
    document.getElementById("ethPrice").textContent = `$${eth.toLocaleString()}`;

    // update crypto chart
    const labels = ["BTC","ETH"];
    const data = [btc, eth];
    if(!cryptoChart){
      const ctx = document.getElementById("cryptoChart").getContext("2d");
      cryptoChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets:[{label:'USD',data,backgroundColor:['rgba(255,193,7,0.9)','rgba(99,102,241,0.9)']}]},
        options:{plugins:{legend:{display:false}}}
      });
    } else {
      cryptoChart.data.datasets[0].data = data;
      cryptoChart.update();
    }
  }catch(err){
    console.warn("crypto fetch failed", err);
  }
}

async function fetchFX(){
  try{
    // exchangerate.host is free and CORS-friendly
    const url = "https://api.exchangerate.host/latest?base=USD&symbols=INR,EUR";
    const res = await fetch(url);
    const json = await res.json();
    const usdInr = json.rates.INR;
    // EUR -> INR
    const res2 = await fetch("https://api.exchangerate.host/latest?base=EUR&symbols=INR");
    const j2 = await res2.json();
    const eurInr = j2.rates.INR;

    document.getElementById("usdInr").textContent = `${usdInr.toFixed(2)}`;
    document.getElementById("eurInr").textContent = `${eurInr.toFixed(2)}`;

    // small fx chart
    if(!fxChart){
      const ctx = document.getElementById("fxChart").getContext("2d");
      fxChart = new Chart(ctx, {
        type:'line',
        data:{labels:['USD→INR','EUR→INR'], datasets:[{label:'Rate',data:[usdInr,eurInr],fill:false}]},
        options:{plugins:{legend:{display:false}}}
      });
    } else {
      fxChart.data.datasets[0].data = [usdInr, eurInr];
      fxChart.update();
    }
  }catch(err){ console.warn("fx fetch failed", err); }
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
    data:{labels,dataSets:[],datasets:[{label:'Views',data,backgroundColor:'rgba(99,102,241,0.9)'}]},
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

  // fallback static list (replace with your own curated headlines)
  const fallback = [
    {title:"AI model compression techniques — quick primer",url:"#",src:"PineHub"},
    {title:"How to structure backtests for robustness",url:"#",src:"Research"},
    {title:"Crypto market microstructure explained",url:"#",src:"CryptoLab"}
  ];
  container.innerHTML = fallback.map(a=>`<div><a href="${a.url}" target="_blank" rel="noopener">${a.title}</a><div class="muted">${a.src}</div></div>`).join("<hr/>");
}

/* ------------------- TradingView widget */
function renderTradingView(){
  try{
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
  }catch(err){ console.warn("TradingView init failed", err); }
}

/* ------------------- Data hub (list files) ------------------- */
function renderDataList(){
  const ul = document.getElementById("dataList");
  // You can add downloadable dataset links by committing files into /data and listing them here:
  const demo = [
    {name:"sample_backtest.csv", href:"/data/sample_backtest.csv"},
    {name:"region_cases.json", href:"/data/region_cases.json"}
  ];
  ul.innerHTML = demo.map(d=>`<li><a href="${d.href}" target="_blank">${d.name}</a></li>`).join("");
}

/* ------------------- Initialization ------------------- */
function init(){
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
if(tagFilter) tagFilter.addEventListener("input", renderGrid);
document.getElementById("sortTrending").onclick = ()=> {
  // quick sort SCRIPTS by views
  const map = JSON.parse(localStorage.getItem("views_map")||"{}");
  SCRIPTS.sort((a,b)=> (map[b.id]||0) - (map[a.id]||0));
  renderGrid();
};

newScriptBtn.onclick = ()=>{
  const id = "s"+Date.now();
  SCRIPTS.unshift({id,title:"Quick Sample "+(SCRIPTS.length+1),category:"Custom",tags:["sample"],description:"Added from UI",code:"//@version=5\nindicator('Quick')\nplot(close)"});
  renderCategories(); renderGrid();
  showToast("Sample added (local)");
};

/* run */
init();
