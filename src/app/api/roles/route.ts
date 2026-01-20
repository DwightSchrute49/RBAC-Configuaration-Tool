import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { isRootOrAdmin } from "@/lib/authorization";
import { z } from "zod";

const roleSchema = z.object({
  name: z.string().min(1),
});

// GET all roles
export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const roles = await prisma.role.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json({ roles }, { status: 200 });
  } catch (error) {
    console.error("Get roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// POST create role
export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    const decoded = token ? verifyToken(token) : null;
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if user is Root or Admin
    const authorized = await isRootOrAdmin(decoded.email);
    if (!authorized) {
      return NextResponse.json(
        { error: "Forbidden: Only Root or Admin users can create roles" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { name } = roleSchema.parse(body);

    const role = await prisma.role.create({
      data: { name },
    });

    return NextResponse.json({ role }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Create role error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
