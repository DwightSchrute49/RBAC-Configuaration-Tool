import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { isRootOrAdmin } from "@/lib/authorization";
import { z } from "zod";

const permissionSchema = z.object({
  name: z.string().min(1).optional(),
  description: z.string().optional(),
});

// GET single permission
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const permission = await prisma.permission.findUnique({
      where: { id: params.id },
      include: {
        rolePermissions: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!permission) {
      return NextResponse.json(
        { error: "Permission not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ permission }, { status: 200 });
  } catch (error) {
    console.error("Get permission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// PUT update permission
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
        { error: "Forbidden: Only Root or Admin users can update permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const data = permissionSchema.parse(body);

    const permission = await prisma.permission.update({
      where: { id: params.id },
      data,
    });

    return NextResponse.json({ permission }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Update permission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

// DELETE permission
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
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
        { error: "Forbidden: Only Root or Admin users can delete permissions" },
        { status: 403 },
      );
    }

    await prisma.permission.delete({
      where: { id: params.id },
    });

    return NextResponse.json(
      { message: "Permission deleted successfully" },
      { status: 200 },
    );
  } catch (error) {
    console.error("Delete permission error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
