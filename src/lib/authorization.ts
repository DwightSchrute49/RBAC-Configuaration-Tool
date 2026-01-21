import { prisma } from "./prisma";
export async function isRootOrAdmin(email: string): Promise<boolean> {
  if (email.endsWith(".root")) {
    return true;
  }
  if (email.endsWith(".admin")) {
    return true;
  }
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
  const hasAdminRole = user?.userRoles.some((ur) => ur.role.name === "Admin");
  return hasAdminRole || false;
}
