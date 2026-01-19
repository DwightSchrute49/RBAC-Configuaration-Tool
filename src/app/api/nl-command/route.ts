import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth";
import { z } from "zod";

const nlCommandSchema = z.object({
  command: z.string().min(1),
});

// Simple pattern matching parser (AI-free fallback)
function parseCommand(command: string): any {
  const lowerCmd = command.toLowerCase();

  // CREATE PERMISSION patterns
  if (lowerCmd.includes("create") && lowerCmd.includes("permission")) {
    const nameMatch =
      command.match(/(?:called|named)\s+["']?([a-z_]+)["']?/i) ||
      command.match(/permission\s+["']?([a-z_]+)["']?/i);
    const descMatch = command.match(
      /(?:description|with)\s+["']([^"']+)["']?/i,
    );

    if (nameMatch) {
      return {
        action: "CREATE_PERMISSION",
        name: nameMatch[1],
        description: descMatch ? descMatch[1] : undefined,
      };
    }
  }

  // CREATE ROLE patterns
  if (lowerCmd.includes("create") && lowerCmd.includes("role")) {
    const nameMatch =
      command.match(/(?:called|named)\s+["']?([a-z_]+)["']?/i) ||
      command.match(/role\s+["']?([a-z_]+)["']?/i);
    if (nameMatch) {
      return { action: "CREATE_ROLE", name: nameMatch[1] };
    }
  }

  // ASSIGN PERMISSION patterns
  if (
    lowerCmd.includes("assign") ||
    (lowerCmd.includes("give") && lowerCmd.includes("permission"))
  ) {
    const permMatch = command.match(/permission\s+["']?([a-z_]+)["']?/i);
    const roleMatch = command.match(/(?:to|role)\s+["']?([a-z_]+)["']?/i);
    if (permMatch && roleMatch) {
      return {
        action: "ASSIGN_PERMISSION",
        permissionName: permMatch[1],
        roleName: roleMatch[1],
      };
    }
  }

  // DELETE PERMISSION patterns
  if (lowerCmd.includes("delete") && lowerCmd.includes("permission")) {
    const nameMatch = command.match(/permission\s+["']?([a-z_]+)["']?/i);
    if (nameMatch) {
      return { action: "DELETE_PERMISSION", name: nameMatch[1] };
    }
  }

  // DELETE ROLE patterns
  if (lowerCmd.includes("delete") && lowerCmd.includes("role")) {
    const nameMatch = command.match(/role\s+["']?([a-z_]+)["']?/i);
    if (nameMatch) {
      return { action: "DELETE_ROLE", name: nameMatch[1] };
    }
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("token")?.value;
    if (!token || !verifyToken(token)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { command } = nlCommandSchema.parse(body);

    // Parse command using pattern matching
    const parsedAction = parseCommand(command);

    if (!parsedAction) {
      return NextResponse.json(
        {
          error: "Could not understand command",
          hint: "Try: 'create permission called can_delete_users' or 'create role called Admin'",
        },
        { status: 400 },
      );
    }

    // Execute the parsed action
    let result: any = null;

    switch (parsedAction.action) {
      case "CREATE_PERMISSION":
        const existingPerm = await prisma.permission.findUnique({
          where: { name: parsedAction.name },
        });
        if (existingPerm) {
          return NextResponse.json(
            { error: "Permission already exists" },
            { status: 400 },
          );
        }
        result = await prisma.permission.create({
          data: {
            name: parsedAction.name,
            description: parsedAction.description || "",
          },
        });
        break;

      case "CREATE_ROLE":
        const existingRole = await prisma.role.findUnique({
          where: { name: parsedAction.name },
        });
        if (existingRole) {
          return NextResponse.json(
            { error: "Role already exists" },
            { status: 400 },
          );
        }
        result = await prisma.role.create({
          data: { name: parsedAction.name },
        });
        break;

      case "ASSIGN_PERMISSION":
        const role = await prisma.role.findUnique({
          where: { name: parsedAction.roleName },
        });
        const permission = await prisma.permission.findUnique({
          where: { name: parsedAction.permissionName },
        });

        if (!role || !permission) {
          return NextResponse.json(
            { error: "Role or permission not found" },
            { status: 404 },
          );
        }

        const existing = await prisma.rolePermission.findUnique({
          where: {
            roleId_permissionId: {
              roleId: role.id,
              permissionId: permission.id,
            },
          },
        });

        if (existing) {
          return NextResponse.json(
            { error: "Permission already assigned to role" },
            { status: 400 },
          );
        }

        result = await prisma.rolePermission.create({
          data: {
            roleId: role.id,
            permissionId: permission.id,
          },
        });
        break;

      case "DELETE_PERMISSION":
        const permToDelete = await prisma.permission.findUnique({
          where: { name: parsedAction.name },
        });
        if (permToDelete) {
          await prisma.permission.delete({ where: { id: permToDelete.id } });
          result = { deleted: true };
        }
        break;

      case "DELETE_ROLE":
        const roleToDelete = await prisma.role.findUnique({
          where: { name: parsedAction.name },
        });
        if (roleToDelete) {
          await prisma.role.delete({ where: { id: roleToDelete.id } });
          result = { deleted: true };
        }
        break;

      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      action: parsedAction,
      result,
    });
  } catch (error) {
    console.error("Natural language command error:", error);
    return NextResponse.json(
      {
        error: "Failed to process command",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
