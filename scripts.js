/* ------------------- CONFIG ------------------- */
const TV_SYMBOL = "NSE:NIFTY";
const NEWSAPI_KEY = ""; // Add your key here
const NEWS_TOPICS = ["business", "technology", "finance"];

/* ------------------- SAMPLE SCRIPTS ------------------- */
const SCRIPTS = {
  "Trend Indicators": [
    {
      id: "super-trend",
      title: "SuperTrend Strategy",
      tags: ["trend", "atr", "reversal"],
      description: "SuperTrend with configurable multiplier and ATR period",
      code: `//@version=5
strategy("SuperTrend", overlay=true)
atrPeriod = input(10, "ATR Period")
factor = input(3.0, "Multiplier")
[supertrend, direction] = ta.supertrend(factor, atrPeriod)
plot(supertrend, color=direction < 0 ? color.red : color.green)`
    },
    {
      id: "ema-crossover",
      title: "EMA Crossover System",
      tags: ["ema", "crossover", "trend"],
      description: "Dual EMA crossover strategy with alerts",
      code: `//@version=5
strategy("EMA Crossover")
fastEma = ta.ema(close, 9)
slowEma = ta.ema(close, 21)
plot(fastEma, color=color.blue)
plot(slowEma, color=color.orange)
if ta.crossover(fastEma, slowEma)
    strategy.entry("Long", strategy.long)
if ta.crossunder(fastEma, slowEma)
    strategy.close("Long")`
    }
  ],
  "Oscillators": [
    {
      id: "rsi-divergence",
      title: "RSI Divergence",
      tags: ["rsi", "divergence", "momentum"],
      description: "Detects regular and hidden RSI divergences",
      code: `//@version=5
indicator("RSI Divergence")
rsiLength = input(14)
rsiValue = ta.rsi(close, rsiLength)
plot(rsiValue)
// Divergence detection logic here...`
    }
  ],
  "Volume": [
    {
      id: "vwap-strategy",
      title: "VWAP Trading Strategy",
      tags: ["vwap", "volume", "intraday"],
      description: "VWAP with standard deviation bands for mean reversion",
      code: `//@version=5
indicator("VWAP Strategy", overlay=true)
vwapValue = ta.vwap(close)
plot(vwapValue, color=color.purple)`
    }
  ]
};

/* ------------------- UI Initialization ------------------- */
document.addEventListener('DOMContentLoaded', () => {
  init();
  setInterval(fetchCrypto, 60000);
  setInterval(fetchFX, 300000);
  setInterval(fetchIndiaMarkets, 300000);
});

/* ------------------- Data Fetching ------------------- */
async function fetchCrypto() {
  try {
    const res = await fetch("https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum");
    const [btc, eth] = await res.json();
    
    document.getElementById("btcPrice").textContent = `$${btc.current_price.toFixed(2)}`;
    document.getElementById("ethPrice").textContent = `$${eth.current_price.toFixed(2)}`;

    if (!cryptoChart) {
      const ctx = document.getElementById("cryptoChart").getContext("2d");
      cryptoChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: btc.sparkline_in_7d.price.slice(0,24).map((_,i) => `${i}h`),
          datasets: [
            {
              label: 'BTC',
              data: btc.sparkline_in_7d.price.slice(0,24),
              borderColor: '#F7931A',
              tension: 0.4,
              borderWidth: 2
            },
            {
              label: 'ETH',
              data: eth.sparkline_in_7d.price.slice(0,24),
              borderColor: '#627EEA',
              tension: 0.4,
              borderWidth: 2
            }
          ]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } },
          scales: { y: { display: false } }
        }
      });
    } else {
      cryptoChart.data.datasets[0].data = btc.sparkline_in_7d.price.slice(0,24);
      cryptoChart.data.datasets[1].data = eth.sparkline_in_7d.price.slice(0,24);
      cryptoChart.update();
    }
  } catch(err) {
    console.error("Crypto fetch failed:", err);
  }
}

async function fetchFX() {
  try {
    const res = await fetch("https://api.exchangerate.host/latest?base=USD&symbols=INR,EUR,GBP");
    const { rates } = await res.json();
    
    document.getElementById("usdInr").textContent = rates.INR.toFixed(2);
    document.getElementById("eurInr").textContent = (rates.INR/rates.EUR).toFixed(2);

    if (!fxChart) {
      const ctx = document.getElementById("fxChart").getContext("2d");
      fxChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
          labels: ['USD/INR', 'EUR/INR', 'GBP/INR'],
          datasets: [{
            data: [rates.INR, rates.INR/rates.EUR, rates.INR/(rates.GBP||84)],
            backgroundColor: ['#4CAF50','#2196F3','#FF5722']
          }]
        },
        options: {
          cutout: '70%',
          plugins: {
            legend: { position: 'bottom' },
            tooltip: {
              callbacks: {
                label: (ctx) => `${ctx.label}: ${ctx.raw.toFixed(2)}`
              }
            }
          }
        }
      });
    }
  } catch(err) {
    console.error("FX fetch failed:", err);
  }
}

async function fetchIndiaMarkets() {
  try {
    // Fallback API since NSE API requires proper implementation
    const res = await fetch("https://api.twelvedata.com/time_series?symbol=NSEI&interval=1day&apikey=demo");
    const niftyData = await res.json();
    const niftyPrice = niftyData.values[0].close;
    document.getElementById("nifty").textContent = niftyPrice;
    document.getElementById("sensex").textContent = (niftyPrice * 30).toFixed(2);

    if (!indiaChart) {
      const ctx = document.getElementById("indiaChart").getContext("2d");
      indiaChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Open', 'High', 'Low', 'Close'],
          datasets: [{
            label: 'NIFTY',
            data: [
              niftyData.values[0].open,
              niftyData.values[0].high,
              niftyData.values[0].low,
              niftyData.values[0].close
            ],
            borderColor: '#FF6B6B',
            tension: 0.1
          }]
        },
        options: {
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: false } }
        }
      });
    }
  } catch(err) {
    console.error("India markets fetch failed:", err);
  }
}

/* ------------------- News Implementation ------------------- */
async function fetchNews() {
  const container = document.getElementById("newsList");
  container.innerHTML = "<div class='muted'>Loading market news...</div>";

  const fallbackNews = [
    {
      title: "RBI keeps repo rate unchanged at 6.5%",
      url: "#",
      source: "Economic Times",
      publishedAt: new Date()
    },
    {
      title: "Nifty 50 hits new all-time high",
      url: "#",
      source: "MoneyControl",
      publishedAt: new Date()
    }
  ];

  if (!NEWSAPI_KEY) {
    renderNewsItems(fallbackNews);
    return;
  }

  try {
    const res = await fetch(`https://newsapi.org/v2/top-headlines?country=in&category=business&pageSize=5&apiKey=${NEWSAPI_KEY}`);
    const { articles } = await res.json();
    renderNewsItems(articles || fallbackNews);
  } catch(err) {
    renderNewsItems(fallbackNews);
  }
}

function renderNewsItems(items) {
  const html = items.slice(0,5).map(item => `
    <div class="news-item">
      <a href="${item.url}" target="_blank">${item.title}</a>
      <div class="news-meta">${item.source?.name || item.source} · ${new Date(item.publishedAt).toLocaleString()}</div>
    </div>
    ${items.indexOf(item) < items.length - 1 ? '<hr/>' : ''}
  `).join("");
  document.getElementById("newsList").innerHTML = html;
}

/* ------------------- TradingView Widget ------------------- */
function renderTradingView() {
  new TradingView.widget({
    "width": "100%",
    "height": 220,
    "symbol": TV_SYMBOL,
    "interval": "60",
    "timezone": "Asia/Kolkata",
    "theme": "dark",
    "style": "1",
    "locale": "en",
    "toolbar_bg": "#071021",
    "enable_publishing": false,
    "container_id": "tv-widget"
  });
}

/* ------------------- Script Library Functions ------------------- */
function renderCategories() {
  const cats = Object.keys(SCRIPTS);
  catFilter.innerHTML = "<option value=''>All categories</option>";
  cats.forEach(c => {
    const o = document.createElement("option");
    o.value = c;
    o.textContent = c;
    catFilter.appendChild(o);
  });
}

function renderGrid() {
  grid.innerHTML = "";
  const q = searchInput.value.trim().toLowerCase();
  const cat = catFilter.value;
  const tagq = tagFilter.value.trim().toLowerCase();

  Object.entries(SCRIPTS).forEach(([category, scripts]) => {
    if (cat && cat !== category) return;

    const filtered = scripts.filter(s => {
      if (tagq && !tagq.split(",").every(t => s.tags.join(" ").toLowerCase().includes(t.trim()))) return false;
      if (!q) return true;
      return s.title.toLowerCase().includes(q) ||
             s.description.toLowerCase().includes(q) ||
             s.tags.join(" ").toLowerCase().includes(q);
    });

    if (filtered.length === 0) return;

    const categoryHeader = document.createElement("h3");
    categoryHeader.textContent = category;
    categoryHeader.style.marginTop = "20px";
    grid.appendChild(categoryHeader);

    filtered.forEach(s => {
      const card = document.createElement("div");
      card.className = "script-card";
      card.innerHTML = `
        <div>
          <h3>${s.title}</h3>
          <p>${s.description}</p>
          <div class="tags">${s.tags.map(t => `<span class="tag">${t}</span>`).join("")}</div>
        </div>
        <div class="card-footer">
          <button class="btn viewBtn" data-id="${s.id}" data-cat="${category}">View</button>
        </div>
      `;
      grid.appendChild(card);
    });
  });

  document.querySelectorAll(".viewBtn").forEach(btn => {
    btn.onclick = (e) => {
      const category = e.target.dataset.cat;
      const script = SCRIPTS[category].find(s => s.id === e.target.dataset.id);
      openModal(script);
    };
  });
}

function openModal(script) {
  mTitle.textContent = script.title;
  mDesc.textContent = script.description;
  mTags.innerHTML = script.tags.map(t => `<span class="tag">${t}</span>`).join("");
  mCode.textContent = script.code;
  Prism.highlightElement(mCode);
  modal.style.display = "flex";
  openTV.href = `https://www.tradingview.com/chart/?script=${encodeURIComponent(script.code)}`;
}

/* ------------------- Initialization ------------------- */
function init() {
  renderCategories();
  renderGrid();
  renderTradingView();
  fetchCrypto();
  fetchFX();
  fetchIndiaMarkets();
  fetchNews();

  // Event listeners
  searchInput.addEventListener("input", renderGrid);
  catFilter.addEventListener("change", renderGrid);
  tagFilter.addEventListener("input", renderGrid);
  closeBtn.addEventListener("click", () => modal.style.display = "none");
  copyBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(mCode.textContent).then(() => {
      toast.textContent = "Copied!";
      toast.classList.add("show");
      setTimeout(() => toast.classList.remove("show"), 1500);
    });
  });
}
