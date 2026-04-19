// src/utils/compressImages.ts
//
// Uses `browser-image-compression` which internally spins up a Web Worker
// for heavy compression work — keeping the main thread unblocked.
//
// Usage:
//   const results = await compressImages(files);
//   const compressed = results.map(r => r.compressed);

import imageCompression from "browser-image-compression";

// ─── Per-file result ──────────────────────────────────────────────────────────
export interface CompressionResult {
  name:             string;       // original filename
  originalFile:     File;
  compressed:       File;
  originalSizeKB:   number;
  compressedSizeKB: number;
  savedPercent:     number;       // 0–100
}

// ─── Options ──────────────────────────────────────────────────────────────────
// Tuned for event cover images displayed on screens up to 1920px wide:
//   - maxSizeMB 1.5    → allows enough bits for good colour fidelity
//   - maxWidthOrHeight 1920 → full HD, not thumbnail
//   - initialQuality 0.85   → visually lossless for most photos
//   - useWebWorker true     → off main thread
//   - preserveExif false    → strip GPS / camera metadata (privacy + size)
//   - fileType webp         → ~30% smaller than JPEG at same quality
//
// Expected result: 1–5 MB photo → 300–800 KB WebP with no visible degradation.
const COMPRESSION_OPTIONS: Parameters<typeof imageCompression>[1] = {
  maxSizeMB:          1.5,
  maxWidthOrHeight:   1920,
  useWebWorker:       true,
  preserveExif:       false,
  initialQuality:     0.85,
  fileType:           "image/webp",
};

// ─── Compress a single file ───────────────────────────────────────────────────
async function compressSingle(file: File): Promise<CompressionResult> {
  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  const originalSizeKB   = Math.round(file.size / 1024);
  const compressedSizeKB = Math.round(compressed.size / 1024);
  const savedPercent     = Math.round(((file.size - compressed.size) / file.size) * 100);

  // Preserve original filename but change extension to .webp
  const baseName    = file.name.replace(/\.[^.]+$/, "");
  const renamedFile = new File([compressed], `${baseName}.webp`, {
    type: "image/webp",
    lastModified: Date.now(),
  });

  return {
    name:             file.name,
    originalFile:     file,
    compressed:       renamedFile,
    originalSizeKB,
    compressedSizeKB,
    savedPercent:     Math.max(0, savedPercent),
  };
}

// ─── Compress all files in parallel ──────────────────────────────────────────
// Each file gets its own worker (browser-image-compression spawns per call).
// Promise.all runs them concurrently — fastest total wall time.
export async function compressImages(
  files: File[]
): Promise<CompressionResult[]> {
  if (files.length === 0) return [];
  return Promise.all(files.map(compressSingle));
}