"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePortal } from "./portal-provider";

export default function DesktopGuard({ role, children }) {
  const router = useRouter();
  const { session } = usePortal();

  useEffect(() => {
    if (!session || session.role !== role) {
      router.replace("/");
    }
  }, [role, router, session]);

  if (!session || session.role !== role) {
    return (
      <main className="app-shell flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-md rounded-[32px] border border-[color:var(--line)] bg-white p-8 text-center panel-shadow">
          <h1 className="text-2xl font-semibold">Session required</h1>
          <p className="mt-3 text-sm leading-6 text-black/60">
            Return to the desktop login page and open the correct role workspace.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white"
          >
            Go to Login
          </Link>
        </div>
      </main>
    );
  }

  return children;
}
