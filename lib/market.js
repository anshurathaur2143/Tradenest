const DEMO_INSTRUMENTS = [
  ["NSE","RELIANCE","Reliance Industries",1452.50,"EQ"],
  ["NSE","TCS","Tata Consultancy Services",3248.75,"EQ"],
  ["NSE","HDFCBANK","HDFC Bank",965.20,"EQ"],
  ["NSE","INFY","Infosys",1510.60,"EQ"],
  ["NSE","ICICIBANK","ICICI Bank",1284.10,"EQ"],
  ["NSE","SBIN","State Bank of India",812.35,"EQ"],
  ["NSE","ITC","ITC",412.80,"EQ"],
  ["NSE","BHARTIARTL","Bharti Airtel",1842.15,"EQ"],
  ["NSE","LT","Larsen & Toubro",3580.00,"EQ"],
  ["NSE","AXISBANK","Axis Bank",1198.40,"EQ"],
  ["NSE","KOTAKBANK","Kotak Mahindra Bank",1930.00,"EQ"],
  ["NSE","TATAMOTORS","Tata Motors",685.30,"EQ"],
  ["NSE","MARUTI","Maruti Suzuki",12640.00,"EQ"],
  ["NSE","SUNPHARMA","Sun Pharmaceutical",1745.00,"EQ"],
  ["NSE","TITAN","Titan Company",3520.00,"EQ"],
  ["NSE","BAJFINANCE","Bajaj Finance",928.00,"EQ"],
  ["NSE","HINDUNILVR","Hindustan Unilever",2490.00,"EQ"],
  ["NSE","WIPRO","Wipro",248.00,"EQ"],
  ["NSE","HCLTECH","HCL Technologies",1640.00,"EQ"],
  ["NSE","ADANIENT","Adani Enterprises",2475.00,"EQ"],
  ["NSE","NTPC","NTPC",365.00,"EQ"],
  ["NSE","POWERGRID","Power Grid Corporation",326.00,"EQ"],
  ["NSE","ONGC","Oil & Natural Gas Corporation",286.00,"EQ"],
  ["NSE","COALINDIA","Coal India",421.00,"EQ"],
  ["NSE","TATASTEEL","Tata Steel",162.00,"EQ"],
  ["NSE","JSWSTEEL","JSW Steel",1040.00,"EQ"],
  ["NSE","ULTRACEMCO","UltraTech Cement",11800.00,"EQ"],
  ["NSE","ASIANPAINT","Asian Paints",2920.00,"EQ"],
  ["NSE","NESTLEIND","Nestle India",2460.00,"EQ"],
  ["NSE","TECHM","Tech Mahindra",1590.00,"EQ"],
  ["NSE","INDUSINDBK","IndusInd Bank",745.00,"EQ"],
  ["NSE","DRREDDY","Dr. Reddy's Laboratories",1280.00,"EQ"],
  ["NSE","CIPLA","Cipla",1580.00,"EQ"],
  ["NSE","DIVISLAB","Divi's Laboratories",6350.00,"EQ"],
  ["NSE","EICHERMOT","Eicher Motors",6200.00,"EQ"],
  ["NSE","HEROMOTOCO","Hero MotoCorp",5750.00,"EQ"],
  ["NSE","APOLLOHOSP","Apollo Hospitals",7200.00,"EQ"],
  ["NSE","GRASIM","Grasim Industries",2780.00,"EQ"],
  ["NSE","BRITANNIA","Britannia Industries",5850.00,"EQ"],
  ["NSE","DABUR","Dabur India",545.00,"EQ"],
  ["NSE","PIDILITIND","Pidilite Industries",3020.00,"EQ"],
  ["NSE","BEL","Bharat Electronics",410.00,"EQ"],
  ["NSE","TRENT","Trent",6200.00,"EQ"],
  ["NSE","ZOMATO","Eternal (formerly Zomato)",315.00,"EQ"],
  ["NSE","PAYTM","One 97 Communications",1280.00,"EQ"],
  ["NSE","IRCTC","IRCTC",740.00,"EQ"],
  ["NSE","DMART","Avenue Supermarts",4350.00,"EQ"],
  ["NSE","INDIGO","InterGlobe Aviation",5650.00,"EQ"],
  ["NSE","VEDL","Vedanta",460.00,"EQ"],
  ["NSE","HINDALCO","Hindalco Industries",680.00,"EQ"],
  ["NSE","NIFTY 50","Nifty 50 Index",25145.35,"INDEX"],
  ["BSE","SENSEX","BSE Sensex Index",82445.21,"INDEX"]
].map((r) => ({
  exchange:r[0], tradingsymbol:r[1], name:r[2], last_price:r[3],
  instrument_type:r[4], segment:r[4] === "INDEX" ? "INDICES" : r[0],
  expiry:"", strike:0, lot_size:1, tick_size:0.05, demo:true
}));

function hasKiteCredentials() {
  return Boolean(process.env.KITE_API_KEY && process.env.KITE_ACCESS_TOKEN);
}

function kiteHeaders() {
  return {
    "X-Kite-Version":"3",
    "Authorization":"token " + process.env.KITE_API_KEY + ":" + process.env.KITE_ACCESS_TOKEN
  };
}

async function getInstrumentMaster() {
  if (!hasKiteCredentials()) return DEMO_INSTRUMENTS;
  const response = await fetch("https://api.kite.trade/instruments", {
    headers:kiteHeaders(),
    cache:"no-store"
  });
  if (!response.ok) {
    throw new Error("Market-data provider returned " + response.status + ". Check Kite credentials and session expiry.");
  }
  const csv = await response.text();
  const lines = csv.trim().split(/\r?\n/);
  if (lines.length < 2) throw new Error("Instrument master was empty.");
  const headers = parseCsvLine(lines[0]);
  return lines.slice(1).map((line) => {
    const cells = parseCsvLine(line);
    const item = {};
    headers.forEach((key, i) => item[key] = cells[i] || "");
    return {
      exchange:item.exchange,
      tradingsymbol:item.tradingsymbol,
      name:item.name || item.tradingsymbol,
      last_price:Number(item.last_price) || 0,
      instrument_type:item.instrument_type,
      segment:item.segment,
      expiry:item.expiry,
      strike:Number(item.strike) || 0,
      lot_size:Number(item.lot_size) || 1,
      tick_size:Number(item.tick_size) || 0.05,
      instrument_token:String(item.instrument_token || ""),
      demo:false
    };
  });
}

function parseCsvLine(line) {
  const out = [];
  let value = "", quoted = false;
  for (let i=0;i<line.length;i++) {
    const c = line[i];
    if (c === '"' && line[i+1] === '"' && quoted) { value += '"'; i++; }
    else if (c === '"') quoted = !quoted;
    else if (c === "," && !quoted) { out.push(value); value = ""; }
    else value += c;
  }
  out.push(value);
  return out;
}

function json(res, status, body) {
  res.statusCode = status;
  res.setHeader("Content-Type","application/json; charset=utf-8");
  res.setHeader("Cache-Control","no-store");
  res.end(JSON.stringify(body));
}

module.exports = { DEMO_INSTRUMENTS, hasKiteCredentials, kiteHeaders, getInstrumentMaster, json };