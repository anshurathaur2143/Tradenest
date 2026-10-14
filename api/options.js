const { DEMO_INSTRUMENTS, getInstrumentMaster, hasKiteCredentials, json } = require("./_lib/market");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error:"Method not allowed" });
  const root = String(req.query.root || "NIFTY").trim().toUpperCase().slice(0,30);
  const expiry = String(req.query.expiry || "").trim().slice(0,10);
  if (!/^[A-Z0-9_-]+$/.test(root)) return json(res, 400, { error:"Invalid option underlying." });
  try {
    const all = await getInstrumentMaster();
    let options = all.filter(i => i.instrument_type === "CE" || i.instrument_type === "PE");
    options = options.filter(i => i.tradingsymbol.startsWith(root) || i.name.toUpperCase() === root);
    if (expiry) options = options.filter(i => i.expiry === expiry);
    options.sort((a,b) => String(a.expiry).localeCompare(String(b.expiry)) || a.strike-b.strike || a.instrument_type.localeCompare(b.instrument_type));
    const expiries = [...new Set(options.map(i => i.expiry).filter(Boolean))].sort();
    return json(res, 200, {
      mode:hasKiteCredentials() ? "provider" : "demo",
      underlying:root,
      expiries,
      options:options.slice(0,1000)
    });
  } catch (error) {
    return json(res, 502, { error:"Unable to load options instruments", detail:error.message });
  }
};