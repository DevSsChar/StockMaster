"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import NewReceiptForm from '@/components/receipts/NewReceiptForm';

export default function NewReceiptPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex w-full h-screen justify-center items-center bg-black">
        <div className="text-red-500 text-xl">Loading...</div>
      </div>
    );
  }

  if (status === "unauthenticated") return null;

  return <NewReceiptForm />;
}
