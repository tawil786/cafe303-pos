import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json(orders);
}

export async function POST(req: Request) {
  const body = await req.json();
  const order = await prisma.order.create({
    data: {
      customerName: body.customerName,
      drinkName: body.drinkName,
      drinkType: body.drinkType,
      base: body.base ?? null,
      milk: body.milk ?? null,
      sweetener: body.sweetener ?? null,
      temperature: body.temperature ?? null,
      notes: body.notes ?? null,
      status: "pending",
    },
  });
  return NextResponse.json(order, { status: 201 });
}
