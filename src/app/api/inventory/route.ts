import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const DEFAULT_INVENTORY = {
  specials: {},
  bases: {},
  milks: {},
  sweeteners: {},
  temperatures: {},
};

export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: "inventory" },
    });
    if (!setting) return NextResponse.json(DEFAULT_INVENTORY);
    return NextResponse.json(JSON.parse(setting.value));
  } catch {
    return NextResponse.json(DEFAULT_INVENTORY);
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const setting = await prisma.setting.upsert({
      where: { key: "inventory" },
      update: { value: JSON.stringify(body) },
      create: { key: "inventory", value: JSON.stringify(body) },
    });
    return NextResponse.json(JSON.parse(setting.value));
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "Failed to save inventory" },
      { status: 500 }
    );
  }
}
