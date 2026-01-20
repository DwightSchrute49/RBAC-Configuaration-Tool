import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { isRootOrAdmin } from "@/lib/authorization";
import { z } from "zod";

const assignRolesSchema = z.object({
  roleIds: z.array(z.string()),
});

// POST assign roles to a user
export async function POST(
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
        {
          error:
            "Forbidden: Only Root or Admin users can assign roles to users",
        },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { roleIds } = assignRolesSchema.parse(body);

    const userId = params.id;

    // Delete existing role assignments
    await prisma.userRole.deleteMany({
      where: { userId },
    });

    // Create new role assignments
    await prisma.userRole.createMany({
      data: roleIds.map((roleId) => ({
        userId,
        roleId,
      })),
    });

    return NextResponse.json(
      { message: "Roles assigned successfully" },
      { status: 200 },
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Assign roles error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
