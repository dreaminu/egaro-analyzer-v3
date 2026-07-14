// 국토교통부 실거래가 API 중계 (인증키는 서버 환경변수에만 존재)
const SVC = {
  rhTrade: "RTMSDataSvcRHTrade/getRTMSDataSvcRHTrade",
  rhRent: "RTMSDataSvcRHRent/getRTMSDataSvcRHRent",
  aptTrade: "RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade",
  aptRent: "RTMSDataSvcAptRent/getRTMSDataSvcAptRent",
};

export default async (req) => {
  const u = new URL(req.url);
  const svc = SVC[u.searchParams.get("svc")];
  const lawd = (u.searchParams.get("lawd") || "").trim();
  const ym = (u.searchParams.get("ym") || "").trim();
  if (!svc || !/^\d{5}$/.test(lawd) || !/^\d{6}$/.test(ym)) {
    return new Response("bad request", { status: 400 });
  }
  const key = process.env.MOLIT_KEY;
  if (!key) return new Response("MOLIT_KEY not set", { status: 500 });
  const sk = key.includes("%") ? key : encodeURIComponent(key);
  const url = `https://apis.data.go.kr/1613000/${svc}?serviceKey=${sk}&LAWD_CD=${lawd}&DEAL_YMD=${ym}&numOfRows=9999&pageNo=1`;
  try {
    const r = await fetch(url);
    const body = await r.text();
    return new Response(body, {
      status: 200,
      headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=1800" },
    });
  } catch (e) {
    return new Response("upstream error: " + e.message, { status: 502 });
  }
};

export const config = { path: "/api/molit" };
