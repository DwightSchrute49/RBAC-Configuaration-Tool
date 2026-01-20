import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { isRootOrAdmin } from "@/lib/authorization";
import { z } from "zod";

const assignPermissionSchema = z.object({
  permissionIds: z.array(z.string()),
});

// POST assign permissions to role
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
        { error: "Forbidden: Only Root or Admin users can assign permissions" },
        { status: 403 },
      );
    }

    const body = await req.json();
    const { permissionIds } = assignPermissionSchema.parse(body);

    // Delete existing permissions for this role
    await prisma.rolePermission.deleteMany({
      where: { roleId: params.id },
    });

    // Create new permissions
    await prisma.rolePermission.createMany({
      data: permissionIds.map((permissionId) => ({
        roleId: params.id,
        permissionId,
      })),
    });

    const role = await prisma.role.findUnique({
      where: { id: params.id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return NextResponse.json({ role }, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Assign permissions error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
