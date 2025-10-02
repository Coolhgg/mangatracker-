// Extract full TLS certificate chain from Supabase Postgres pooler
// Usage: node scripts/extract-tls-chain.js

const tls = require("tls");
const net = require("net");
const fs = require("fs");
const path = require("path");

const POOLER_HOST = "aws-1-ap-southeast-1.pooler.supabase.com";
const POOLER_PORT = 5432;
const OUTPUT_FILE = path.resolve(process.cwd(), "src/certs/supabase-fullchain.pem");

async function extractCertificateChain() {
  return new Promise((resolve, reject) => {
    console.log(`Connecting to ${POOLER_HOST}:${POOLER_PORT}...`);

    // Create TCP socket first
    const socket = net.connect(POOLER_PORT, POOLER_HOST, () => {
      console.log("TCP connection established");
      
      // Send PostgreSQL SSLRequest (8 bytes: length=8, code=80877103)
      const sslRequest = Buffer.alloc(8);
      sslRequest.writeInt32BE(8, 0);
      sslRequest.writeInt32BE(80877103, 4);
      socket.write(sslRequest);
    });

    socket.once("data", (data) => {
      // Server should respond with 'S' (0x53) to accept SSL
      if (data[0] !== 0x53) {
        socket.destroy();
        return reject(new Error("Server rejected SSL request"));
      }

      console.log("SSL accepted, starting TLS handshake...");

      // Upgrade to TLS
      const tlsSocket = tls.connect({
        socket: socket,
        servername: POOLER_HOST,
        rejectUnauthorized: false, // We want to see all certs even if invalid
      }, () => {
        console.log("TLS handshake complete");
        
        const peerCert = tlsSocket.getPeerCertificate(true);
        const chain = [];
        
        // Extract all certificates in chain
        let current = peerCert;
        while (current) {
          if (current.raw) {
            const pemCert = "-----BEGIN CERTIFICATE-----\n" +
              current.raw.toString("base64").match(/.{1,64}/g).join("\n") +
              "\n-----END CERTIFICATE-----\n";
            
            chain.push({
              subject: current.subject,
              issuer: current.issuer,
              pem: pemCert
            });
          }
          
          // Move to issuer certificate
          current = current.issuerCertificate;
          // Break if we've looped back to the same cert (root)
          if (current && current.fingerprint === peerCert.fingerprint) {
            break;
          }
        }

        console.log(`\nExtracted ${chain.length} certificate(s):`);
        chain.forEach((cert, idx) => {
          const cn = cert.subject?.CN || "Unknown";
          const issuerCn = cert.issuer?.CN || "Unknown";
          console.log(`  ${idx + 1}. Subject: ${cn}`);
          console.log(`     Issuer: ${issuerCn}`);
        });

        // Combine all certificates
        const fullchain = chain.map(c => c.pem).join("\n");

        // Ensure output directory exists
        const outDir = path.dirname(OUTPUT_FILE);
        if (!fs.existsSync(outDir)) {
          fs.mkdirSync(outDir, { recursive: true });
        }

        // Write to file
        fs.writeFileSync(OUTPUT_FILE, fullchain, "utf8");
        console.log(`\n✓ Full certificate chain saved to: ${OUTPUT_FILE}`);
        console.log(`  Total size: ${fullchain.length} bytes`);

        tlsSocket.end();
        resolve({ chain, fullchain, outputFile: OUTPUT_FILE });
      });

      tlsSocket.on("error", (err) => {
        console.error("TLS error:", err.message);
        reject(err);
      });
    });

    socket.on("error", (err) => {
      console.error("Socket error:", err.message);
      reject(err);
    });

    socket.setTimeout(10000, () => {
      socket.destroy();
      reject(new Error("Connection timeout"));
    });
  });
}

// Run if called directly
if (require.main === module) {
  extractCertificateChain()
    .then(() => {
      console.log("\n✓ Certificate extraction complete");
      process.exit(0);
    })
    .catch((err) => {
      console.error("\n✗ Certificate extraction failed:", err.message);
      process.exit(1);
    });
}

module.exports = { extractCertificateChain };