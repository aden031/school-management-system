"use client";

import type React from "react";
import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/auth-context";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip redirect for login page to avoid redirect loops
    if (!isAuthenticated && pathname !== "/login" && pathname !== "/studentportal") {
      router.push("/login");
      return;
    }

    // If authenticated and user is student, only allow /studentprofile
    if (
      isAuthenticated &&
      user?.role === "student" &&
      pathname !== "/studentprofile"
    ) {
      router.push("/studentprofile");
    }

    // If authenticated and user is parent, only allow /parent
    if (
      isAuthenticated &&
      user?.role === "parent" &&
      pathname !== "/parent"
    ) {
      router.push("/parent");
    }
  }, [isAuthenticated, router, pathname, user]);

  // If not authenticated and not on login page, don't render children
  if (!isAuthenticated && pathname !== "/login" && pathname !== "/studentportal") {
    return null;
  }

  return <>{children}</>;
}
