'use client';

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, use } from "react";
import NewReceiptForm from "@/components/receipts/NewReceiptForm";

export default function EditReceiptPage({ params }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { id } = use(params);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black">
        <div className="text-red-500">Loading...</div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return <NewReceiptForm operationId={id} isEditMode={true} />;
}
