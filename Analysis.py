# Run: python analysis.py
# Requires yfinance (copy from github.com/ranaroussi/yfinance)
import yfinance as yf
import json

# Fetch stock data
stock = yf.Ticker("AAPL")
data = stock.history(period="1mo")

# Calculate RSI
def calculate_rsi(prices, period=14):
    deltas = [prices[i] - prices[i-1] for i in range(1, len(prices))]
    gains = [d if d > 0 else 0 for d in deltas]
    losses = [-d if d < 0 else 0 for d in deltas]
    avg_gain = sum(gains[:period]) / period
    avg_loss = sum(losses[:period]) / period
    rs = avg_gain / avg_loss if avg_loss != 0 else 0
    rsi = 100 - (100 / (1 + rs))
    return rsi

prices = data['Close'].tolist()
rsi = calculate_rsi(prices)
print(f"RSI for AAPL: {rsi:.2f}")

# Output chart data
chart_data = [
    {"time": str(date.date()), "open": row['Open'], "high": row['High'], "low": row['Low'], "close": row['Close']}
    for date, row in data.iterrows()
]
with open('data.json', 'w') as f:
    json.dump(chart_data, f)
