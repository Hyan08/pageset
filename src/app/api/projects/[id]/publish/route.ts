import { NextResponse } from "next/server";
import { publishProject } from "@/lib/studio-store";

export const runtime = "edge";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(_: Request, { params }: Params) {
  const { id } = await params;
  const project = await publishProject(id);

  if (!project) {
    return NextResponse.json({ error: "project_not_found" }, { status: 404 });
  }

  return NextResponse.json({ project });
}
