# generate_pine_scripts.py
import json

# Base scripts (10 from above)
base_scripts = [
    {
        "title": "Hull Moving Average",
        "description": "Smooth, responsive moving average for trend analysis.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"Hull Moving Average\", overlay=true)\nhmaValue = ta.hma(close, 20)\nplot(hmaValue, title=\"HMA\", color=color.aqua)"
    },
    {
        "title": "RSI Indicator",
        "description": "Measures momentum for overbought/oversold conditions.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"RSI\", overlay=false)\nrsiValue = ta.rsi(close, 14)\nplot(rsiValue, title=\"RSI\", color=color.blue)\nhline(70, \"Overbought\", color=color.red)\nhline(30, \"Oversold\", color=color.green)"
    },
    {
        "title": "MACD Strategy",
        "description": "Buy/sell signals using MACD crossovers.",
        "author": "Community",
        "type": "strategy",
        "code": "//@version=5\nstrategy(\"MACD Strategy\", overlay=true)\n[macdLine, signalLine, _] = ta.macd(close, 12, 26, 9)\nbuySignal = ta.crossover(macdLine, signalLine)\nsellSignal = ta.crossunder(macdLine, signalLine)\nif (buySignal)\n    strategy.entry(\"Buy\", strategy.long)\nif (sellSignal)\n    strategy.entry(\"Sell\", strategy.short)"
    },
    {
        "title": "Bollinger Bands",
        "description": "Volatility bands around a moving average.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"Bollinger Bands\", overlay=true)\nlength = 20\nmult = 2.0\nbasis = ta.sma(close, length)\ndev = mult * ta.stdev(close, length)\nupper = basis + dev\nlower = basis - dev\nplot(basis, color=color.blue)\nplot(upper, color=color.red)\nplot(lower, color=color.green)"
    },
    {
        "title": "Ichimoku Cloud",
        "description": "Trend, momentum, and support/resistance indicator.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"Ichimoku Cloud\", overlay=true)\ntenkan = ta.sma(high[9] + low[9], 2)\nkijun = ta.sma(high[26] + low[26], 2)\nsenkouA = ta.sma(tenkan + kijun, 2)\nsenkouB = ta.sma(high[52] + low[52], 2)\nplot(tenkan, color=color.blue)\nplot(kijun, color=color.red)\nplotcandle(senkouA, senkouB, senkouA, senkouB, \"Cloud\", color.green)"
    },
    {
        "title": "VWAP",
        "description": "Volume Weighted Average Price for intraday analysis.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"VWAP\", overlay=true)\nvwap = ta.vwap(high, low, close, volume)\nplot(vwap, color=color.purple)"
    },
    {
        "title": "Stochastic Oscillator",
        "description": "Compares closing price to price range for momentum.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"Stochastic\", overlay=false)\n[k, d] = ta.stoch(close, high, low, 14)\nplot(k, color=color.blue)\nplot(d, color=color.red)\nhline(80, color=color.red)\nhline(20, color=color.green)"
    },
    {
        "title": "ATR Indicator",
        "description": "Measures market volatility with Average True Range.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"ATR\", overlay=false)\natr = ta.atr(14)\nplot(atr, color=color.orange)"
    },
    {
        "title": "Fibonacci Retracement",
        "description": "Plots Fibonacci levels for support/resistance.",
        "author": "Community",
        "type": "indicator",
        "code": "//@version=5\nindicator(\"Fibonacci Retracement\", overlay=true)\nhigh_price = ta.highest(high, 20)\nlow_price = ta.lowest(low, 20)\ndiff = high_price - low_price\nplot(high_price - diff * 0.236, color=color.blue)\nplot(high_price - diff * 0.382, color=color.green)\nplot(high_price - diff * 0.618, color=color.red)"
    },
    {
        "title": "Moving Average Crossover",
        "description": "Signals based on fast/slow MA crossovers.",
        "author": "Community",
        "type": "strategy",
        "code": "//@version=5\nstrategy(\"MA Crossover\", overlay=true)\nfastMA = ta.sma(close, 10)\nslowMA = ta.sma(close, 50)\nbuySignal = ta.crossover(fastMA, slowMA)\nsellSignal = ta.crossunder(fastMA, slowMA)\nif (buySignal)\n    strategy.entry(\"Buy\", strategy.long)\nif (sellSignal)\n    strategy.entry(\"Sell\", strategy.short)"
    }
]

# Generate 90 more scripts
indicators = [
    "CCI", "MFI", "OBV", "ADX", "Volume Oscillator", "RSI Divergence", "Parabolic SAR", "Supertrend",
    "Pivot Points", "Keltner Channels", "Donchian Channels", "Williams %R", "Chande Momentum",
    "Stochastic RSI", "Aroon Indicator", "Force Index", "Elder Ray", "DMI", "TRIX", "Ease of Movement",
    "MACD Histogram", "Choppiness Index", "ZigZag", "Heikin Ashi MA", "KAMA", "Ichimoku Tenkan",
    "Fractal Indicator", "Gann Levels", "VWMA", "Hull MA Variation", "Double EMA", "Triple EMA",
    "Weighted MA", "Adaptive MA", "Fractal Adaptive MA", "DEMA", "TEMA", "Ichimoku Kijun",
    "Price Channel", "Standard Deviation", "Rate of Change", "Momentum Oscillator", "Balance of Power",
    "Commodity Channel Index", "Relative Vigor Index", "Ultimate Oscillator", "True Strength Index",
    "Detrended Price Oscillator", "Average Directional Index", "Volume Profile", "Market Profile",
    "Klinger Oscillator", "Chaikin Oscillator", "Chaikin Money Flow", "Accumulation/Distribution",
    "On Balance Volume", "Price Volume Trend", "Negative Volume Index", "Positive Volume Index",
    "Money Flow Index", "Advance Decline Line", "McClellan Oscillator", "McClellan Summation"
]
strategies = [
    "Trend Following", "Mean Reversion", "Breakout Strategy", "Scalping Strategy", "Swing Trading",
    "RSI Reversal", "MACD Crossover", "Bollinger Band Breakout", "Supertrend Strategy",
    "Ichimoku Breakout", "Pivot Point Reversal", "Keltner Breakout", "Donchian Breakout",
    "Volume Spike", "Price Action Strategy", "EMA Crossover", "Stochastic Crossover",
    "Fibonacci Retracement Strategy", "Parabolic SAR Strategy", "Trend Momentum",
    "Volatility Breakout", "Pullback Strategy", "Heikin Ashi Strategy", "Gann Swing",
    "Divergence Strategy", "Range Trading", "Momentum Reversal"
]

scripts = base_scripts
for i in range(60):  # 60 more indicators
    scripts.append({
        "title": f"{indicators[i % len(indicators)]} #{i+1}",
        "description": f"Custom {indicators[i % len(indicators)]} for technical analysis.",
        "author": "Community",
        "type": "indicator",
        "code": f"//@version=5\nindicator(\"{indicators[i % len(indicators)]} #{i+1}\", overlay=false)\nvalue = ta.{indicators[i % len(indicators)].lower().replace(' ', '')}(close, 14)\nplot(value, color=color.blue)"
    })
for i in range(30):  # 30 more strategies
    scripts.append({
        "title": f"{strategies[i % len(strategies)]} #{i+1}",
        "description": f"Strategy using {strategies[i % len(strategies)]} for educational signals.",
        "author": "Community",
        "type": "strategy",
        "code": f"//@version=5\nstrategy(\"{strategies[i % len(strategies)]} #{i+1}\", overlay=true)\nvalue = ta.{strategies[i % len(strategies)].lower().replace(' ', '')}(close, 14)\nbuySignal = ta.crossover(value, 0)\nsellSignal = ta.crossunder(value, 0)\nif (buySignal)\n    strategy.entry(\"Buy\", strategy.long)\nif (sellSignal)\n    strategy.entry(\"Sell\", strategy.short)"
    })

with open('pine-scripts.json', 'w') as f:
    json.dump(scripts, f, indent=4)
print(f"Generated {len(scripts)} scripts in pine-scripts.json")
