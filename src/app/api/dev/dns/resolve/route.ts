import { NextResponse } from "next/server";

// DNS-over-HTTPS resolver that follows CNAME -> A, with IPv4 priority
// GET /api/dev/dns/resolve?host=<fqdn>
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const host = searchParams.get("host");
  if (!host) {
    return NextResponse.json({ ok: false, error: "Missing host query param" }, { status: 400 });
  }

  async function doh(name: string, type: "A" | "AAAA" | "CNAME") {
    const url = `https://dns.google/resolve?name=${encodeURIComponent(name)}&type=${type}`;
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) throw new Error(`DoH request failed: ${res.status}`);
    return (await res.json()) as any;
  }

  try {
    // 1) Try A directly on the host
    const aResp = await doh(host, "A");
    const aAnswers = Array.isArray(aResp?.Answer) ? aResp.Answer : [];
    const aIps = aAnswers.filter((a: any) => a?.type === 1 && typeof a?.data === "string").map((a: any) => a.data);
    if (aIps.length) {
      return NextResponse.json({ ok: true, host, method: "A", ips: aIps });
    }

    // 2) Try to follow CNAME chain once (common with Supabase)
    const cnameResp = await doh(host, "CNAME");
    const cnameAnswers = Array.isArray(cnameResp?.Answer) ? cnameResp.Answer : [];
    const cname = cnameAnswers.find((a: any) => a?.type === 5 && typeof a?.data === "string")?.data?.replace(/\.$/, "");

    if (cname) {
      const aResp2 = await doh(cname, "A");
      const aAnswers2 = Array.isArray(aResp2?.Answer) ? aResp2.Answer : [];
      const aIps2 = aAnswers2.filter((a: any) => a?.type === 1 && typeof a?.data === "string").map((a: any) => a.data);
      if (aIps2.length) {
        return NextResponse.json({ ok: true, host, cname, method: "CNAME->A", ips: aIps2 });
      }

      // Optional: fallback to AAAA if only IPv6 is available
      const aaaaResp = await doh(cname, "AAAA");
      const aaaaAnswers = Array.isArray(aaaaResp?.Answer) ? aaaaResp.Answer : [];
      const v6 = aaaaAnswers.filter((a: any) => a?.type === 28 && typeof a?.data === "string").map((a: any) => a.data);
      if (v6.length) {
        return NextResponse.json({ ok: true, host, cname, method: "CNAME->AAAA", ipv6: v6 });
      }
    }

    // 3) Last resort: AAAA directly on host
    const aaaaResp2 = await doh(host, "AAAA");
    const aaaaAnswers2 = Array.isArray(aaaaResp2?.Answer) ? aaaaResp2.Answer : [];
    const v6host = aaaaAnswers2.filter((a: any) => a?.type === 28 && typeof a?.data === "string").map((a: any) => a.data);
    if (v6host.length) {
      return NextResponse.json({ ok: true, host, method: "AAAA", ipv6: v6host });
    }

    return NextResponse.json({ ok: false, error: "No A/AAAA records found (after CNAME follow)" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err?.message || String(err) }, { status: 500 });
  }
}