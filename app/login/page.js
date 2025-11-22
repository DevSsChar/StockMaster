"use client"
import LoginComponent from "@/components/ui/login-1";
import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
     const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard"); 
    }
  }, [status, router]);

  if (status === "authenticated") return null; // prevent flicker

  return (
    <div className="flex w-full h-screen justify-center items-center">
      <LoginComponent />
    </div>
  );
}