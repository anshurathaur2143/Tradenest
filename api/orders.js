const { json } = require("../lib/market");

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow","POST");
    return json(res, 405, { error:"Method not allowed" });
  }
  let body = req.body;
  if (typeof body === "string") {
    try { body = JSON.parse(body); } catch (_) { return json(res, 400, { error:"Invalid JSON body" }); }
  }
  body = body || {};
  const symbol = String(body.symbol || "").trim().toUpperCase();
  const exchange = String(body.exchange || "NSE").trim().toUpperCase();
  const side = String(body.side || "").trim().toUpperCase();
  const quantity = Number(body.quantity);
  const product = String(body.product || "CNC").toUpperCase();
  const orderType = String(body.orderType || "MARKET").toUpperCase();
  const price = Number(body.price || 0);
  if (!/^[A-Z0-9 _&.-]{1,40}$/.test(symbol)) return json(res, 400, { error:"Invalid symbol" });
  if (!["NSE","BSE","NFO","MCX"].includes(exchange)) return json(res, 400, { error:"Unsupported exchange" });
  if (!["BUY","SELL"].includes(side)) return json(res, 400, { error:"Side must be BUY or SELL" });
  if (!Number.isSafeInteger(quantity) || quantity < 1 || quantity > 1000000) return json(res, 400, { error:"Quantity must be a positive whole number" });
  if (!["CNC","MIS","NRML"].includes(product)) return json(res, 400, { error:"Unsupported product type" });
  if (!["MARKET","LIMIT","SL","SL-M"].includes(orderType)) return json(res, 400, { error:"Unsupported order type" });
  if (orderType !== "MARKET" && (!Number.isFinite(price) || price <= 0)) return json(res, 400, { error:"A positive price is required for limit/stop orders" });
  if (body.mode && body.mode !== "demo") return json(res, 403, { error:"Live order execution is intentionally disabled in this prototype." });
  return json(res, 201, {
    mode:"demo",
    order:{
      id:"TN-" + Date.now().toString(36).toUpperCase(),
      symbol, exchange, side, quantity, product, orderType,
      price:orderType === "MARKET" ? null : price,
      status:"SIMULATED",
      createdAt:new Date().toISOString()
    },
    message:"Simulated order accepted. No broker or exchange order was placed."
  });
};