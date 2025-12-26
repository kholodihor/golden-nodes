import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {

    // First get all letters
    const users = await prisma.user.findMany()

    return NextResponse.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json(
      { message: "Failed to fetch users" },
      { status: 500 }
    );
  }
}