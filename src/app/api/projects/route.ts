import { NextResponse } from "next/server";
import {
  listProjects,
  projectInputSchema,
  saveProject,
} from "@/lib/studio-store";

export const runtime = "edge";

export async function GET() {
  const projects = await listProjects();
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const parsed = projectInputSchema.safeParse(payload);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "invalid_payload", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const project = await saveProject(parsed.data);
  return NextResponse.json({ project }, { status: 201 });
}
