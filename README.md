# TradeNest

TradeNest is a Zerodha-inspired **educational trading dashboard prototype**. It is not affiliated with Zerodha and is not a production brokerage.

## Features in this branch

- Responsive trading-dashboard UI, watchlist and instrument search
- Backend API routes for health, instruments, quotes, option instruments and simulated orders
- Demo-mode market data with clear sample-data labels
- Optional server-side Kite Connect instrument master and quote adapter
- Buy/sell order ticket simulation, portfolio, positions and order history in the UI
- Live order execution deliberately disabled

## Deploy on Vercel

1. Import this GitHub repository into Vercel (or use the existing Vercel project).
2. Keep the framework preset as **Other** if asked. The static `index.html` and `api/*.js` serverless routes are auto-detected.
3. Deploy. The app works in demo mode without secrets.
4. Optional: configure `KITE_API_KEY` and `KITE_ACCESS_TOKEN` in **Vercel → Project → Settings → Environment Variables**, then redeploy. These are server-only variables. Never put broker secrets in HTML or browser JavaScript.

Kite Connect access tokens expire and must be managed securely. This adapter is for server-side market-data retrieval only. It does not place broker orders or bypass provider authentication.

## API routes

- `GET /api/health` — status and active data mode
- `GET /api/instruments?q=bank&segment=equity&exchange=NSE&limit=100&offset=0` — instrument search
- `GET /api/quotes?symbols=NSE:INFY,NSE:RELIANCE` — quote lookup
- `GET /api/options?root=NIFTY&expiry=YYYY-MM-DD` — option instrument discovery
- `POST /api/orders` — validated simulated order ticket

## Data and safety notes

Without Kite Connect credentials, the app uses a small, clearly labelled sample universe; those values are **not live quotes**. With valid credentials, the instruments route can retrieve the provider's instrument master and the quote route can request LTP data. The instrument master is not itself a live price feed.

Real order placement requires broker-authorized user authentication, session handling, persistence, audit trails, risk checks, monitoring and review of applicable exchange/SEBI requirements. This prototype intentionally does not submit live orders. Do not use it for investment decisions.
