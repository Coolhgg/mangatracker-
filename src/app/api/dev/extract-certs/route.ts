import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST() {
  try {
    // Dynamic import to run the extraction script
    const { extractCertificateChain } = require("../../../../../scripts/extract-tls-chain.js");
    
    const result = await extractCertificateChain();
    
    return NextResponse.json({
      success: true,
      message: "Certificate chain extracted successfully",
      outputFile: result.outputFile,
      certificateCount: result.chain.length,
      certificates: result.chain.map((cert: any, idx: number) => ({
        position: idx + 1,
        type: idx === 0 ? "Leaf" : idx === result.chain.length - 1 ? "Root CA" : "Intermediate CA",
        subject: cert.subject?.CN || "Unknown",
        issuer: cert.issuer?.CN || "Unknown"
      })),
      totalSize: result.fullchain.length
    });
  } catch (error: any) {
    console.error("Certificate extraction error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || "Failed to extract certificates",
        details: error?.stack
      },
      { status: 500 }
    );
  }
}