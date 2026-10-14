const { DEMO_INSTRUMENTS, hasKiteCredentials, kiteHeaders, json } = require("../lib/market");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error:"Method not allowed" });
  const symbols = String(req.query.symbols || "").split(",").map(s => s.trim()).filter(Boolean).slice(0,100);
  if (!symbols.length) return json(res, 400, { error:"Provide symbols as EXCHANGE:TRADINGSYMBOL, comma-separated." });
  if (symbols.some(s => !/^[A-Z0-9_-]+:[A-Z0-9 _&.-]+$/i.test(s))) return json(res, 400, { error:"One or more symbols have invalid format." });
  try {
    if (!hasKiteCredentials()) {
      const quotes = {};
      for (const key of symbols) {
        const [exchange, symbol] = key.split(":");
        const item = DEMO_INSTRUMENTS.find(x => x.exchange === exchange && x.tradingsymbol === symbol);
        if (item) quotes[key] = { last_price:item.last_price, demo:true, source:"sample" };
      }
      return json(res, 200, { mode:"demo", quotes });
    }
    const params = new URLSearchParams();
    symbols.forEach(s => params.append("i", s));
    const upstream = await fetch("https://api.kite.trade/quote/ltp?" + params.toString(), {
      headers:kiteHeaders(),
      cache:"no-store"
    });
    const data = await upstream.json();
    if (!upstream.ok) return json(res, upstream.status, { error:"Quote provider request failed", detail:data.message || "Unknown provider error" });
    return json(res, 200, { mode:"provider", quotes:data.data || {} });
  } catch (error) {
    return json(res, 502, { error:"Unable to load quotes", detail:error.message });
  }
};