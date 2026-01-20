"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Trash2, Edit, Plus, LogOut, Sparkles } from "lucide-react";

type Permission = {
  id: string;
  name: string;
  description: string | null;
  rolePermissions: { role: { id: string; name: string } }[];
};

type Role = {
  id: string;
  name: string;
  rolePermissions: { permission: { id: string; name: string } }[];
};

type User = {
  id: string;
  email: string;
  createdAt: string;
  userRoles: { role: { id: string; name: string } }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState("");
  const [showPermissionDialog, setShowPermissionDialog] = useState(false);
  const [showRoleDialog, setShowRoleDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [showUserRolesDialog, setShowUserRolesDialog] = useState(false);
  const [showNLDialog, setShowNLDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedUserRoles, setSelectedUserRoles] = useState<string[]>([]);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(
    null,
  );
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [nlCommand, setNlCommand] = useState("");
  const [nlLoading, setNlLoading] = useState(false);
  const [nlResult, setNlResult] = useState("");

  const [permissionForm, setPermissionForm] = useState({
    name: "",
    description: "",
  });
  const [roleForm, setRoleForm] = useState({ name: "" });

  const fetchData = useCallback(async () => {
    try {
      const [permsRes, rolesRes, usersRes, userRes] = await Promise.all([
        fetch("/api/permissions"),
        fetch("/api/roles"),
        fetch("/api/users"),
        fetch("/api/auth/me"),
      ]);

      if (!permsRes.ok || !rolesRes.ok || !usersRes.ok || !userRes.ok) {
        router.push("/auth/login");
        return;
      }

      const permsData = await permsRes.json();
      const rolesData = await rolesRes.json();
      const usersData = await usersRes.json();
      const userData = await userRes.json();

      setPermissions(permsData.permissions);
      setRoles(rolesData.roles);
      setUsers(usersData.users);
      setUserEmail(userData.user?.email || "");
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/auth/login");
    router.refresh();
  };

  const handleCreatePermission = async () => {
    try {
      const res = await fetch("/api/permissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissionForm),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowPermissionDialog(false);
        setPermissionForm({ name: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating permission:", error);
    }
  };

  const handleUpdatePermission = async () => {
    if (!editingPermission) return;

    try {
      const res = await fetch(`/api/permissions/${editingPermission.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(permissionForm),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowPermissionDialog(false);
        setEditingPermission(null);
        setPermissionForm({ name: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error updating permission:", error);
    }
  };

  const handleDeletePermission = async (id: string) => {
    if (!confirm("Are you sure you want to delete this permission?")) return;

    try {
      const res = await fetch(`/api/permissions/${id}`, { method: "DELETE" });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error deleting permission:", error);
    }
  };

  const handleCreateRole = async () => {
    try {
      const res = await fetch("/api/roles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowRoleDialog(false);
        setRoleForm({ name: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error creating role:", error);
    }
  };

  const handleUpdateRole = async () => {
    if (!editingRole) return;

    try {
      const res = await fetch(`/api/roles/${editingRole.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roleForm),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowRoleDialog(false);
        setEditingRole(null);
        setRoleForm({ name: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleDeleteRole = async (id: string) => {
    if (!confirm("Are you sure you want to delete this role?")) return;

    try {
      const res = await fetch(`/api/roles/${id}`, { method: "DELETE" });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      fetchData();
    } catch (error) {
      console.error("Error deleting role:", error);
    }
  };

  const openAssignDialog = (role: Role) => {
    setSelectedRole(role);
    setSelectedPermissions(role.rolePermissions.map((rp) => rp.permission.id));
    setShowAssignDialog(true);
  };

  const handleAssignPermissions = async () => {
    if (!selectedRole) return;

    try {
      const res = await fetch(`/api/roles/${selectedRole.id}/permissions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ permissionIds: selectedPermissions }),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowAssignDialog(false);
        setSelectedRole(null);
        setSelectedPermissions([]);
        fetchData();
      }
    } catch (error) {
      console.error("Error assigning permissions:", error);
    }
  };

  const openUserRolesDialog = (user: User) => {
    setSelectedUser(user);
    setSelectedUserRoles(user.userRoles.map((ur) => ur.role.id));
    setShowUserRolesDialog(true);
  };

  const handleAssignUserRoles = async () => {
    if (!selectedUser) return;

    try {
      const res = await fetch(`/api/users/${selectedUser.id}/roles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ roleIds: selectedUserRoles }),
      });

      if (res.status === 403) {
        alert(
          "🚫 You must be a Root or Admin user to manage roles and permissions.",
        );
        return;
      }

      if (res.ok) {
        setShowUserRolesDialog(false);
        setSelectedUser(null);
        setSelectedUserRoles([]);
        fetchData();
      }
    } catch (error) {
      console.error("Error assigning user roles:", error);
    }
  };

  const handleNLCommand = async () => {
    setNlLoading(true);
    setNlResult("");

    try {
      const res = await fetch("/api/nl-command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: nlCommand }),
      });

      const data = await res.json();

      if (res.ok) {
        setNlResult(`✓ Success: ${JSON.stringify(data.action, null, 2)}`);
        setNlCommand("");
        fetchData();
      } else {
        setNlResult(`✗ Error: ${data.error}`);
      }
    } catch (error) {
      setNlResult("✗ Failed to process command");
    } finally {
      setNlLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">RBAC Configuration Tool</h1>
            <p className="text-sm text-gray-600 mt-1">{userEmail}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setShowNLDialog(true)}
              className="gap-2"
            >
              <Sparkles className="h-4 w-4" />
              AI Command
            </Button>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="permissions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="permissions">Permissions</TabsTrigger>
            <TabsTrigger value="roles">Roles</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
          </TabsList>

          <TabsContent value="permissions" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Permissions</h2>
              <Button
                onClick={() => {
                  setEditingPermission(null);
                  setPermissionForm({ name: "", description: "" });
                  setShowPermissionDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Permission
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {permissions.map((permission) => (
                <Card key={permission.id}>
                  <CardHeader>
                    <CardTitle className="text-base">
                      {permission.name}
                    </CardTitle>
                    <CardDescription>
                      {permission.description || "No description"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      Used in {permission.rolePermissions.length} role(s)
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingPermission(permission);
                          setPermissionForm({
                            name: permission.name,
                            description: permission.description || "",
                          });
                          setShowPermissionDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeletePermission(permission.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="roles" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Roles</h2>
              <Button
                onClick={() => {
                  setEditingRole(null);
                  setRoleForm({ name: "" });
                  setShowRoleDialog(true);
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                New Role
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roles.map((role) => (
                <Card key={role.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{role.name}</CardTitle>
                    <CardDescription>
                      {role.rolePermissions.length} permission(s)
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {role.rolePermissions.slice(0, 3).map((rp) => (
                        <div
                          key={rp.permission.id}
                          className="text-xs bg-gray-100 px-2 py-1 rounded"
                        >
                          {rp.permission.name}
                        </div>
                      ))}
                      {role.rolePermissions.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{role.rolePermissions.length - 3} more
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openAssignDialog(role)}
                      >
                        Assign
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingRole(role);
                          setRoleForm({ name: role.name });
                          setShowRoleDialog(true);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteRole(role.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Manage Users</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {users.map((user) => (
                <Card key={user.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{user.email}</CardTitle>
                    <CardDescription>
                      {user.userRoles.length} role(s) assigned
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm text-muted-foreground mb-4">
                      {user.userRoles.length > 0 ? (
                        <div>
                          Roles:{" "}
                          {user.userRoles.map((ur) => ur.role.name).join(", ")}
                        </div>
                      ) : (
                        <div>No roles assigned</div>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => openUserRolesDialog(user)}
                    >
                      <Edit className="h-3 w-3 mr-2" />
                      Assign Roles
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>

      {/* Permission Dialog */}
      <Dialog
        open={showPermissionDialog}
        onOpenChange={setShowPermissionDialog}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingPermission ? "Edit Permission" : "Create Permission"}
            </DialogTitle>
            <DialogDescription>
              {editingPermission
                ? "Update the permission details"
                : "Add a new permission to the system"}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="permName">Name</Label>
              <Input
                id="permName"
                value={permissionForm.name}
                onChange={(e) =>
                  setPermissionForm({ ...permissionForm, name: e.target.value })
                }
                placeholder="e.g., can_edit_articles"
              />
            </div>
            <div>
              <Label htmlFor="permDesc">Description</Label>
              <Input
                id="permDesc"
                value={permissionForm.description}
                onChange={(e) =>
                  setPermissionForm({
                    ...permissionForm,
                    description: e.target.value,
                  })
                }
                placeholder="What this permission allows"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPermissionDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={
                editingPermission
                  ? handleUpdatePermission
                  : handleCreatePermission
              }
            >
              {editingPermission ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Role Dialog */}
      <Dialog open={showRoleDialog} onOpenChange={setShowRoleDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingRole ? "Edit Role" : "Create Role"}
            </DialogTitle>
            <DialogDescription>
              {editingRole
                ? "Update the role details"
                : "Add a new role to the system"}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label htmlFor="roleName">Name</Label>
            <Input
              id="roleName"
              value={roleForm.name}
              onChange={(e) => setRoleForm({ name: e.target.value })}
              placeholder="e.g., Content Editor"
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleDialog(false)}>
              Cancel
            </Button>
            <Button onClick={editingRole ? handleUpdateRole : handleCreateRole}>
              {editingRole ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Assign Permissions Dialog */}
      <Dialog open={showAssignDialog} onOpenChange={setShowAssignDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Assign Permissions to {selectedRole?.name}
            </DialogTitle>
            <DialogDescription>
              Select permissions for this role
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {permissions.map((permission) => (
              <label
                key={permission.id}
                className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedPermissions([
                        ...selectedPermissions,
                        permission.id,
                      ]);
                    } else {
                      setSelectedPermissions(
                        selectedPermissions.filter(
                          (id) => id !== permission.id,
                        ),
                      );
                    }
                  }}
                  className="h-4 w-4"
                />
                <div>
                  <div className="font-medium">{permission.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {permission.description}
                  </div>
                </div>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAssignDialog(false)}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignPermissions}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Natural Language Dialog */}
      <Dialog open={showNLDialog} onOpenChange={setShowNLDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>AI Natural Language Command</DialogTitle>
            <DialogDescription>
              Type a command in plain English to configure RBAC
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="nlCommand">Command</Label>
              <Input
                id="nlCommand"
                value={nlCommand}
                onChange={(e) => setNlCommand(e.target.value)}
                placeholder='e.g., "Give the role Content Editor the permission to edit articles"'
              />
            </div>
            {nlResult && (
              <div
                className={`p-3 text-sm rounded-md ${
                  nlResult.startsWith("✓")
                    ? "bg-green-50 text-green-700"
                    : "bg-red-50 text-red-700"
                }`}
              >
                <pre className="whitespace-pre-wrap">{nlResult}</pre>
              </div>
            )}
            <div className="text-xs text-muted-foreground">
              <p>Example commands:</p>
              <ul className="list-disc list-inside space-y-1 mt-1">
                <li>Create a new permission called publish content</li>
                <li>
                  Give the role Content Editor the permission to edit articles
                </li>
                <li>Create a new role called Support Agent</li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNLDialog(false)}>
              Close
            </Button>
            <Button
              onClick={handleNLCommand}
              disabled={nlLoading || !nlCommand}
            >
              {nlLoading ? "Processing..." : "Execute"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Roles Assignment Dialog */}
      <Dialog open={showUserRolesDialog} onOpenChange={setShowUserRolesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign Roles to User</DialogTitle>
            <DialogDescription>
              Select roles to assign to {selectedUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              {roles.map((role) => (
                <div key={role.id} className="flex items-center space-x-2 py-2">
                  <input
                    type="checkbox"
                    id={`user-role-${role.id}`}
                    checked={selectedUserRoles.includes(role.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserRoles([...selectedUserRoles, role.id]);
                      } else {
                        setSelectedUserRoles(
                          selectedUserRoles.filter((id) => id !== role.id),
                        );
                      }
                    }}
                    className="h-4 w-4"
                  />
                  <label
                    htmlFor={`user-role-${role.id}`}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    {role.name}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowUserRolesDialog(false);
                setSelectedUser(null);
                setSelectedUserRoles([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAssignUserRoles}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
