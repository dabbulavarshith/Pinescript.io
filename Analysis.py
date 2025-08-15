# Run: python analysis.py
# Requires yfinance (copy from github.com/ranaroussi/yfinance)
import yfinance as yf
import json

# Fetch stock data
try:
    stock = yf.Ticker("AAPL")
    data = stock.history(period="1mo")
except Exception as e:
    print(f"Error fetching data: {e}")
    data = None

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

if data is not None and not data.empty:
    prices = data['Close'].tolist()
    rsi = calculate_rsi(prices)
    print(f"RSI for AAPL: {rsi:.2f}")

    # Output chart data
    chart_data = [
        {"time": str(date.date()), "open": row['Open'], "high": row['High'], "low": row['Low'], "close": row['Close']}
        for date, row in data.iterrows()
    ]
else:
    # Fallback data
    chart_data = [
        {"time": "2025-07-15", "open": 150.0, "high": 155.0, "low": 148.0, "close": 152.0},
        {"time": "2025-07-16", "open": 152.0, "high": 158.0, "low": 150.0, "close": 156.0},
        {"time": "2025-07-17", "open": 156.0, "high": 160.0, "low": 154.0, "close": 158.0}
    ]

with open('data.json', 'w') as f:
    json.dump(chart_data, f)
