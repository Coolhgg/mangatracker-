import type { NextRequest } from "next/server";
import archiver from "archiver";
import { PassThrough } from "stream";
import path from "path";

export const runtime = "nodejs"; // ensure Node APIs are available

export async function GET(_req: NextRequest) {
  const passthrough = new PassThrough();
  const archive = archiver("zip", { zlib: { level: 9 } });

  archive.on("error", (err) => {
    passthrough.destroy(err);
  });

  // Pipe archive data to the pass-through stream
  archive.pipe(passthrough);

  // Zip the project from the repository root, excluding heavy/build/system folders
  const cwd = process.cwd();
  archive.glob("**/*", {
    cwd,
    dot: false,
    ignore: [
      "node_modules/**",
      ".next/**",
      ".git/**",
      "bun.lockb",
      "coverage/**",
      "playwright-report/**",
      ".turbo/**",
      "*.log",
      "app.db",
      "**/.DS_Store",
      "**/Thumbs.db",
      // Transpiled/cache directories that aren't needed
      "dist/**",
      "out/**",
      "build/**",
    ],
  });

  // Finalize the archive (no more files will be appended)
  void archive.finalize();

  const filename = `kenmei-project-${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.zip`;

  return new Response(passthrough as any, {
    headers: {
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename=${filename}`,
      "Cache-Control": "no-store",
    },
  });
}