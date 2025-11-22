"use client"
import LoginComponent from "@/components/ui/login-1";
import UniversalNavbar from "@/components/ui/universal-navbar";
import VantaWaves from "@/components/ui/vanta-waves";
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
    <VantaWaves>
      <UniversalNavbar />
      <div className="flex w-full h-screen justify-center items-center pt-16">
        <LoginComponent />
      </div>
    </VantaWaves>
  );
}