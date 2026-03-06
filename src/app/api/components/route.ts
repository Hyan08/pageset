import { NextResponse } from "next/server";
import {
  componentInputSchema,
  listComponents,
  saveComponent,
} from "@/lib/studio-store";

export const runtime = "edge";

export async function GET() {
  const components = await listComponents();
  return NextResponse.json({ components });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = componentInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const component = await saveComponent(parsed.data);
  return NextResponse.json({ component }, { status: 201 });
}
