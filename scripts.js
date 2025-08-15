// === Edit this array to add/edit scripts ===
const SCRIPTS = [
  {
    id: "hma-crossover",
    title: "HMA Crossover Strategy",
    category: "Strategy",
    tags: ["hma","crossover","trend"],
    description: "HMA 50/100 crossover strategy with entries and exits.",
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
    description: "Simple visual detector for triangle-like consolidations.",
    code: `//@version=5
indicator("Triangle Detector", overlay=true)
len = input.int(20)
plot(ta.highest(len), color=color.red)
plot(ta.lowest(len), color=color.green)`
  }
]

// ===== UI wiring =====
const grid = document.getElementById('grid');
const catFilter = document.getElementById('categoryFilter');
const search = document.getElementById('search');
const modal = document.getElementById('modal');
const mTitle = document.getElementById('mTitle');
const mDesc  = document.getElementById('mDesc');
const mTags  = document.getElementById('mTags');
const mCode  = document.getElementById('mCode');
const copyBtn = document.getElementById('copyBtn');
const toast = document.getElementById('toast');
const closeBtn = document.getElementById('close');
const newSample = document.getElementById('newSample');
const openInTV = document.getElementById('openInTV');

function renderCategories(){
  const cats = [...new Set(SCRIPTS.map(s=>s.category))];
  cats.forEach(c=>{
    const o = document.createElement('option'); o.value=c; o.textContent=c; catFilter.appendChild(o);
  })
}

function render(){
  const q = search.value.trim().toLowerCase();
  const cat = catFilter.value;
  grid.innerHTML = '';
  const list = SCRIPTS.filter(s=>{
    if(cat && s.category !== cat) return false;
    if(!q) return true;
    return s.title.toLowerCase().includes(q) ||
           s.description.toLowerCase().includes(q) ||
           s.tags.join(' ').toLowerCase().includes(q) ||
           s.code.toLowerCase().includes(q);
  });
  if(list.length === 0){ grid.innerHTML = '<div style="color:var(--muted);padding:18px">No scripts found.</div>'; return; }
  list.forEach(s=>{
    const el = document.createElement('article'); el.className='card';
    el.innerHTML = `
      <div>
        <h3>${s.title}</h3>
        <p>${s.description}</p>
        <div class="tags">${s.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div>
      </div>
      <div class="card-footer">
        <small>${s.category}</small>
        <div>
          <button class="btn" data-id="${s.id}" onclick="openModal('${s.id}')">View</button>
          <button class="btn" onclick='copyQuick(\`${escapeBackticks(s.code)}\`)'>Copy</button>
        </div>
      </div>
    `;
    grid.appendChild(el);
  })
}

// helpers for safe inline template
function escapeBackticks(str){ return str.replace(/`/g,'\\`').replace(/\$/g,'\\$'); }

window.openModal = function(id){
  const s = SCRIPTS.find(x=>x.id===id);
  if(!s) return;
  mTitle.textContent = s.title;
  mDesc.textContent = s.description;
  mTags.innerHTML = s.tags.map(t=>`<span class="tag">${t}</span>`).join('');
  mCode.textContent = s.code;
  Prism.highlightElement(mCode);
  modal.style.display = 'flex';
  openInTV.href = 'https://www.tradingview.com/chart/?solution=copy-paste'; // placeholder
}

closeBtn.onclick = ()=> modal.style.display = 'none';
window.onclick = e=>{ if(e.target === modal) modal.style.display = 'none'; }

copyBtn.onclick = ()=>{
  navigator.clipboard.writeText(mCode.textContent).then(()=> showToast('Copied'));
}

function copyQuick(txt){ navigator.clipboard.writeText(txt).then(()=> showToast('Copied')) }

function showToast(msg='Copied'){
  toast.textContent = msg; toast.classList.add('show');
  setTimeout(()=> toast.classList.remove('show'), 1200);
}

newSample.onclick = ()=>{
  const id = 's'+Date.now();
  SCRIPTS.unshift({id, title:'New sample', category:'Custom', tags:['sample'], description:'Quick sample', code:'//@version=5\nindicator("Sample")\nplot(close)'});
  render(); renderCategories();
}

search.addEventListener('input', render);
catFilter.addEventListener('change', render);

renderCategories();
render();
