const { getInstrumentMaster, hasKiteCredentials, json } = require("./_lib/market");

module.exports = async function handler(req, res) {
  if (req.method !== "GET") return json(res, 405, { error:"Method not allowed" });
  try {
    const q = String(req.query.q || "").trim().toLowerCase().slice(0,80);
    const segment = String(req.query.segment || "all").toLowerCase();
    const exchange = String(req.query.exchange || "").toUpperCase();
    const limit = Math.min(Math.max(Number(req.query.limit) || 100, 1), 500);
    const offset = Math.max(Number(req.query.offset) || 0, 0);
    const all = await getInstrumentMaster();
    const filtered = all.filter((item) => {
      const matchesQ = !q || [item.tradingsymbol,item.name,item.exchange,item.segment].some(v => String(v || "").toLowerCase().includes(q));
      const matchesExchange = !exchange || item.exchange === exchange;
      const matchesSegment = segment === "all" ||
        (segment === "equity" && item.instrument_type === "EQ") ||
        (segment === "options" && /OPT/.test(item.segment || "") && ["CE","PE"].includes(item.instrument_type)) ||
        (segment === "futures" && /FUT/.test(item.segment || "")) ||
        (segment === "indices" && (item.instrument_type === "INDEX" || /INDICES/.test(item.segment || "")));
      return matchesQ && matchesExchange && matchesSegment;
    });
    res.setHeader("Cache-Control", hasKiteCredentials() ? "s-maxage=1800, stale-while-revalidate=3600" : "no-store");
    return json(res, 200, {
      mode:hasKiteCredentials() ? "provider" : "demo",
      total:filtered.length,
      offset,
      limit,
      instruments:filtered.slice(offset, offset + limit)
    });
  } catch (error) {
    return json(res, 502, { error:"Unable to load instrument master", detail:error.message });
  }
};