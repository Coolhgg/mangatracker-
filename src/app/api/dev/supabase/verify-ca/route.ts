import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { X509Certificate } from "crypto";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function readPem(relPath: string): string {
  const p = path.resolve(process.cwd(), relPath);
  return fs.readFileSync(p, "utf8");
}

function parseX509(pem: string) {
  return new X509Certificate(pem);
}

function isTimeValid(cert: X509Certificate) {
  const now = Date.now();
  const notBefore = Date.parse(cert.validFrom);
  const notAfter = Date.parse(cert.validTo);
  return now >= notBefore && now <= notAfter;
}

export async function GET() {
  try {
    // Load provided certs
    const leafPem = readPem("src/certs/cert01.pem");
    const intermPem = readPem("src/certs/cert02.pem");
    const rootPem = readPem("src/certs/cert03.pem"); // Supabase Root 2021

    const leaf = parseX509(leafPem);
    const interm = parseX509(intermPem);
    const root = parseX509(rootPem);

    // 1) Mark cert03 as trust anchor for app-wide Supabase connections (already enforced in db/index.ts)
    const trustAnchorPath = path.resolve(process.cwd(), "src/certs/cert03.pem");
    const trustsRoot = fs.existsSync(trustAnchorPath);

    // 2) Ensure we are NOT using any Amazon/Starfield CAs as trust anchors for Supabase
    const forbidden = [/amazon/i, /starfield/i];
    const rootSubjectsCombined = `${root.subject} ${root.issuer}`;
    const hasForbidden = forbidden.some((re) => re.test(rootSubjectsCombined));

    // 3) Verify chain: leaf → intermediate → root by subject/issuer linkage and validity window
    const chainLinked =
      leaf.issuer === interm.subject &&
      interm.issuer === root.subject &&
      root.issuer === root.subject; // self-signed root

    const timeValid = isTimeValid(leaf) && isTimeValid(interm) && isTimeValid(root);

    // Optionally ensure the expected Root CN label appears
    const expectedRootLabelOk = /Supabase Root 2021 CA/i.test(root.subject);

    if (!trustsRoot) {
      return NextResponse.json({ ok: false, error: "Trust anchor not found: cert03.pem" }, { status: 500 });
    }
    if (hasForbidden) {
      return NextResponse.json({ ok: false, error: "Forbidden CA detected in trust anchor metadata" }, { status: 500 });
    }
    if (!chainLinked) {
      return NextResponse.json({ ok: false, error: "Chain linkage failed (issuer/subject mismatch)" }, { status: 500 });
    }
    if (!timeValid) {
      return NextResponse.json({ ok: false, error: "One or more certificates are not currently valid" }, { status: 500 });
    }
    if (!expectedRootLabelOk) {
      return NextResponse.json({ ok: false, error: "Root subject does not match 'Supabase Root 2021 CA'" }, { status: 500 });
    }

    // All checks passed → return plain text "OK"
    return new Response("OK", {
      status: 200,
      headers: { "Content-Type": "text/plain" },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || String(e) }, { status: 500 });
  }
}