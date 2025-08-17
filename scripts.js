// Save Bulk PineScripts
function saveScripts() {
  const scripts = document.getElementById("bulkScripts").value;
  localStorage.setItem("pineScripts", scripts);
  displaySavedScripts();
}

function displaySavedScripts() {
  const saved = localStorage.getItem("pineScripts") || "No scripts saved.";
  document.getElementById("savedScripts").textContent = saved;
}

// Market News Loader
async function loadNews() {
  const newsFeed = document.getElementById("newsFeed");
  try {
    // Example: Using free Finviz news API clone (replace if needed)
    const res = await fetch("https://api.allorigins.win/get?url=https://finviz.com/news.ashx");
    const data = await res.json();
    newsFeed.innerHTML = data.contents.slice(0, 1000); // trim long feed
  } catch (err) {
    newsFeed.textContent = "Failed to load news.";
  }
}

// Init
window.onload = () => {
  displaySavedScripts();
  loadNews();
};