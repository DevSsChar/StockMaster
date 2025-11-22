"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ReceiptOperations from '@/components/receipts/ReceiptOperations';

export default function ReceiptsPage() {
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

  return <ReceiptOperations />;
}
