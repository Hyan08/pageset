import { NextResponse } from "next/server";
import {
  componentBlockInputSchema,
  listComponentBlocks,
  saveComponentBlock,
} from "@/lib/studio-store";

export const runtime = "edge";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") ?? undefined;
  const blocks = await listComponentBlocks(locale);
  return NextResponse.json({ blocks });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = componentBlockInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const block = await saveComponentBlock(parsed.data);
  return NextResponse.json({ block }, { status: 201 });
}
