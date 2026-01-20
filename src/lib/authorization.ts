import { prisma } from "./prisma";

export async function isRootOrAdmin(email: string): Promise<boolean> {
  // Root users: emails ending with .root
  if (email.endsWith(".root")) {
    return true;
  }

  // Check if user has Admin role
  const user = await prisma.user.findUnique({
    where: { email },
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  const hasAdminRole = user?.userRoles.some(
    (ur) => ur.role.name === "Admin"
  );

  return hasAdminRole || false;
}
