"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Users } from "lucide-react";
import { useEffect, useState } from "react";
export default function Home() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);
  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setIsLoggedIn(false);
    router.refresh();
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center space-y-8">
        {/* Logo and Title */}
        <div className="space-y-4">
          <div className="flex justify-center">
            <Shield className="h-20 w-20 text-indigo-600" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900">
            RBAC Configuration Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Powerful Role-Based Access Control management system. Create roles,
            assign permissions, and manage users with ease.
          </p>
        </div>
        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6 my-12">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Lock className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Secure Access</h3>
            <p className="text-gray-600 text-sm">
              JWT-based authentication with bcrypt password hashing
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">User Management</h3>
            <p className="text-gray-600 text-sm">
              Assign roles and permissions to users effortlessly
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Shield className="h-10 w-10 text-indigo-600 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">Role Control</h3>
            <p className="text-gray-600 text-sm">
              Create custom roles with granular permission settings
            </p>
          </div>
        </div>
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          {isLoggedIn ? (
            <>
              <Link href="/dashboard">
                <Button size="lg" className="w-40">
                  Go to Dashboard
                </Button>
              </Link>
              <Button
                size="lg"
                variant="outline"
                className="w-40"
                onClick={handleLogout}
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button size="lg" className="w-40">
                  Sign In
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="lg" variant="outline" className="w-40">
                  Sign Up
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
