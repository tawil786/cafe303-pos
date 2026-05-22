import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import type { Inventory } from "@/lib/inventory";

const inventoryPath = path.join(process.cwd(), "src/data/inventory.json");

async function readInventory(): Promise<Inventory> {
  const raw = await fs.readFile(inventoryPath, "utf-8");
  return JSON.parse(raw) as Inventory;
}

export async function GET() {
  try {
    const inventory = await readInventory();
    return NextResponse.json(inventory);
  } catch {
    return NextResponse.json(
      { error: "Failed to read inventory" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Inventory;
    await fs.writeFile(inventoryPath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json(body);
  } catch {
    return NextResponse.json(
      { error: "Failed to write inventory" },
      { status: 500 }
    );
  }
}
