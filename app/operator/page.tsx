// app/operator/page.tsx
"use client";

import OperatorAuthGuard from "@/components/Auth/OperatorAuthGuard";
import { useRouter } from "next/navigation";

export default function OperatorPortal() {
  const router = useRouter();

  return (
    <OperatorAuthGuard>
      <div className="flex items-center justify-center min-h-screen">
        <button
          onClick={() => router.push("/operator/counter")}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Enter Counter Portal
        </button>
      </div>
    </OperatorAuthGuard>
  );
}
