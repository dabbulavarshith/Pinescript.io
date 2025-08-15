console.log('script.js loaded'); // Debug log

// Theme toggle
const themeToggle = document.getElementById('theme-toggle');
themeToggle.addEventListener('click', () => {
    console.log('Theme toggle clicked'); // Debug
    document.body.classList.toggle('dark');
    const isDark = document.body.classList.contains('dark');
    document.getElementById('prism-theme').href = isDark
        ? 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism-dark.min.css'
        : 'https://cdnjs.cloudflare.com/ajax/libs/prism/1.29.0/themes/prism.min.css';
    themeToggle.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
});

// Pine Script Library
let allScripts = [];
let currentPage = 1;
const scriptsPerPage = 9;

function renderScripts(scripts, page) {
    console.log('Rendering scripts, page:', page); // Debug
    const scriptList = document.getElementById('script-list');
    scriptList.innerHTML = '';
    const start = (page - 1) * scriptsPerPage;
    const end = start + scriptsPerPage;
    const paginatedScripts = scripts.slice(start, end);

    if (paginatedScripts.length === 0) {
        scriptList.innerHTML = '<p>No scripts found.</p>';
        return;
    }

    paginatedScripts.forEach(script => {
        const card = document.createElement('div');
        card.className = 'script-card bg-white p-6 rounded-lg shadow';
        card.innerHTML = `
            <h3 class="text-xl font-bold">${script.title}</h3>
            <p class="mb-4">${script.description}</p>
            <p class="text-sm text-gray-600">Type: ${script.type} | Author: ${script.author}</p>
            <pre><code class="language-pinescript">${script.code}</code></pre>
        `;
        scriptList.appendChild(card);
    });
    Prism.highlightAll();
    renderPagination(scripts);
}

function renderPagination(scripts) {
    console.log('Rendering pagination, total scripts:', scripts.length); // Debug
    const pagination = document.getElementById('pagination');
    pagination.innerHTML = '';
    const pageCount = Math.ceil(scripts.length / scriptsPerPage);
    for (let i = 1; i <= pageCount; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'} hover:bg-blue-600 hover:text-white transition`;
        button.onclick = () => {
            currentPage = i;
            renderScripts(allScripts, currentPage);
        };
        pagination.appendChild(button);
    }
}

function filterScripts() {
    console.log('Filtering scripts'); // Debug
    const search = document.getElementById('script-search').value.toLowerCase();
    const filter = document.getElementById('script-filter').value;
    const filteredScripts = allScripts.filter(script => 
        (script.title.toLowerCase().includes(search) || script.description.toLowerCase().includes(search)) &&
        (filter === 'all' || script.type === filter)
    );
    currentPage = 1;
    renderScripts(filteredScripts, currentPage);
}

fetch('pine-scripts.json')
    .then(response => {
        if (!response.ok) throw new Error('Failed to load pine-scripts.json');
        return response.json();
    })
    .then(scripts => {
        console.log('Scripts loaded:', scripts.length); // Debug
        allScripts = scripts;
        renderScripts(allScripts, currentPage);
        document.getElementById('script-search').addEventListener('input', filterScripts);
        document.getElementById('script-filter').addEventListener('change', filterScripts);
    })
    .catch(error => {
        console.error('Error loading scripts:', error);
        document.getElementById('script-list').innerHTML = '<p>Error loading scripts. Check console.</p>';
    });

// Charts
let chartInstance = null;
let seriesInstance = null;

function loadChart(type) {
    console.log('Loading chart:', type); // Debug
    const chartContainer = document.getElementById('chart-container');
    if (chartInstance) {
        chartInstance.remove();
    }

    chartInstance = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 500,
        layout: { background: { type: 'solid', color: document.body.classList.contains('dark') ? '#1f2937' : '#ffffff' }, textColor: document.body.classList.contains('dark') ? '#f3f4f6' : '#333' },
        grid: { vertLines: { color: '#e0e0e0' }, horLines: { color: '#e0e0e0' } },
        timeScale: { timeVisible: true, secondsVisible: false },
    });

    if (type === 'candlestick') {
        seriesInstance = chartInstance.addCandlestickSeries();
    } else {
        seriesInstance = chartInstance.addLineSeries({ color: '#1e90ff' });
    }

    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Failed to load data.json');
            return response.json();
        })
        .then(data => {
            console.log('Chart data loaded:', data.length); // Debug
            if (type === 'candlestick') {
                seriesInstance.setData(data);
            } else {
                const lineData = data.map(d => ({ time: d.time, value: d.close }));
                seriesInstance.setData(lineData);
            }
            chartInstance.timeScale().fitContent();
        })
        .catch(error => {
            console.error('Error loading chart data:', error);
            chartContainer.innerHTML = '<p>Error loading chart data. Check console.</p>';
        });
}

// Quiz
function checkQuiz(answer, isCorrect) {
    console.log('Quiz answer:', answer); // Debug
    const result = document.getElementById('quiz-result');
    result.innerText = isCorrect ? 'Correct! ta.rsi() calculates RSI.' : 'Incorrect. Try again!';
    result.className = isCorrect ? 'text-green-500' : 'text-red-500';
}

// Premium
function showPremiumPrompt() {
    console.log('Premium prompt clicked'); // Debug
    alert('Join Premium for exclusive tutorials!');
}

// Load default chart
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded'); // Debug
    loadChart('candlestick');
});

// Resize chart
window.addEventListener('resize', () => {
    if (chartInstance) {
        chartInstance.resize(document.getElementById('chart-container').clientWidth, 500);
    }
});
