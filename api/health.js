const { hasKiteCredentials, json } = require("./_lib/market");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error:"Method not allowed" });
  return json(res, 200, {
    status:"ok",
    app:"TradeNest",
    mode:hasKiteCredentials() ? "provider-configured" : "demo",
    marketData:hasKiteCredentials() ? "kite-connect-configured" : "sample-data",
    liveOrderExecution:false,
    message:hasKiteCredentials()
      ? "Market-data credentials are configured. Order execution remains disabled in this prototype."
      : "Demo mode is active. Configure server-side Kite Connect credentials to load the provider instrument master."
  });
};