// Load Pine Script Library
fetch('pine-scripts.json')
    .then(response => response.json())
    .then(scripts => {
        const scriptList = document.getElementById('script-list');
        scripts.forEach(script => {
            const card = document.createElement('div');
            card.className = 'script-card bg-white p-6 rounded-lg shadow';
            card.innerHTML = `
                <h3 class="text-xl font-bold">${script.title}</h3>
                <p class="mb-4">${script.description}</p>
                <pre><code class="language-pinescript">${script.code}</code></pre>
                <p class="mt-2 text-sm text-gray-600">Author: ${script.author}</p>
            `;
            scriptList.appendChild(card);
        });
        Prism.highlightAll();
    });

// Initialize Lightweight Charts
let chartInstance = null;
let seriesInstance = null;

function loadChart(type) {
    const chartContainer = document.getElementById('chart-container');
    if (chartInstance) {
        chartInstance.remove();
    }

    chartInstance = LightweightCharts.createChart(chartContainer, {
        width: chartContainer.clientWidth,
        height: 500,
        layout: { background: { type: 'solid', color: '#ffffff' }, textColor: '#333' },
        grid: { vertLines: { color: '#e0e0e0' }, horLines: { color: '#e0e0e0' } },
        timeScale: { timeVisible: true, secondsVisible: false },
    });

    if (type === 'candlestick') {
        seriesInstance = chartInstance.addCandlestickSeries();
        fetch('data.json')
            .then(response => response.json())
            .then(data => seriesInstance.setData(data));
    } else {
        seriesInstance = chartInstance.addLineSeries({ color: '#1e90ff' });
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                const lineData = data.map(d => ({ time: d.time, value: d.close }));
                seriesInstance.setData(lineData);
            });
    }

    chartInstance.timeScale().fitContent();
}

// Quiz logic
function checkQuiz(answer, isCorrect) {
    const result = document.getElementById('quiz-result');
    result.innerText = isCorrect ? 'Correct! ta.rsi() calculates the Relative Strength Index.' : 'Incorrect. Try again!';
    result.className = isCorrect ? 'text-green-500' : 'text-red-500';
}

// Premium prompt
function showPremiumPrompt() {
    alert('Join Premium for advanced Pine Script tutorials and tools!');
}

// Load default chart
document.addEventListener('DOMContentLoaded', () => loadChart('candlestick'));

// Resize chart
window.addEventListener('resize', () => {
    if (chartInstance) {
        chartInstance.resize(document.getElementById('chart-container').clientWidth, 500);
    }
});
