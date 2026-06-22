import { NextResponse } from "next/server";
import { getCategories } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  const data = await getCategories();
  return NextResponse.json({ data });
}
