// app/api/upload/route.ts
export const runtime = "nodejs";

import { NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import crypto from "crypto";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // ✅ 5MB
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
]);

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file");

    if (!file || !(file instanceof File)) {
      return jsonError("Missing file.", 400);
    }

    // ✅ Type validation
    if (!ALLOWED_TYPES.has(file.type)) {
      return jsonError(
        "Only JPG, PNG, or WebP images are allowed.",
        400
      );
    }

    // ✅ Size validation
    if (file.size > MAX_FILE_SIZE) {
      return jsonError(
        "File size must be less than or equal to 5MB.",
        400
      );
    }

    // ✅ Read file
    const bytes = Buffer.from(await file.arrayBuffer());

    const ext =
      file.type === "image/png"
        ? "png"
        : file.type === "image/webp"
        ? "webp"
        : "jpg";

    const fileName = `${crypto.randomUUID()}.${ext}`;

    // ✅ Ensure upload directory exists
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const fullPath = path.join(uploadDir, fileName);
    await writeFile(fullPath, bytes);

    // ✅ Success
    return NextResponse.json(
      { url: `/uploads/${fileName}` },
      { status: 200 }
    );
  } catch (error) {
    console.error("UPLOAD error:", error);
    return NextResponse.json(
      { error: "Upload failed." },
      { status: 500 }
    );
  }
}
