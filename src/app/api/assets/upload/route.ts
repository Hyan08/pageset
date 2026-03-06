import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadAssetToR2 } from "@/lib/studio-store";

export const runtime = "edge";

const payloadSchema = z.object({
  key: z.string().min(1),
  contentType: z.string().min(1).default("application/octet-stream"),
  dataBase64: z.string().min(1),
});

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = payloadSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const bytes = Uint8Array.from(atob(parsed.data.dataBase64), (char) =>
    char.charCodeAt(0),
  ).buffer;

  const result = await uploadAssetToR2(
    parsed.data.key,
    bytes,
    parsed.data.contentType,
  );

  return NextResponse.json(result, { status: 201 });
}
