"use client"
import Dashboard from "@/components/dashboard";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
     const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-(--color-bg) flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-(--color-text-primary)"></div>
      </div>
    );
  }

  if (status === "unauthenticated") return null; // prevent flicker

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <Dashboard />
    </div>
  );
}