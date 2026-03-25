"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { usePortal } from "./portal-provider";

const roleRoutes = {
  Subscriber: "/subscriber",
  Collector: "/collector",
  Admin: "/admin",
};

export default function DesktopLogin() {
  const router = useRouter();
  const { demoUsers, login } = usePortal();
  const [selectedRole, setSelectedRole] = useState("Admin");
  const [userId, setUserId] = useState(demoUsers.Admin.userId);
  const [password, setPassword] = useState(demoUsers.Admin.password);
  const [error, setError] = useState("");

  function changeRole(role) {
    setSelectedRole(role);
    setUserId(demoUsers[role].userId);
    setPassword(demoUsers[role].password);
    setError("");
  }

  function handleSubmit(event) {
    event.preventDefault();
    const result = login(selectedRole, userId, password);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    router.push(roleRoutes[selectedRole]);
  }

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-6xl items-center gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[38px] border border-[color:var(--line)] bg-[linear-gradient(155deg,rgba(15,143,103,0.98),rgba(11,92,68,0.96)_55%,rgba(15,28,24,0.95)_100%)] p-10 text-white panel-shadow">
          <p className="text-[0.78rem] font-semibold uppercase tracking-[0.28em] text-white/60">Desktop Console</p>
          <h1 className="mt-6 max-w-xl text-5xl font-semibold leading-tight tracking-[-0.03em]">
            Village collections with role-based operational control.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-white/74">
            Use dedicated desktop workspaces for subscribers, collectors, and admins with clear navigation, service management, and collector assignment controls.
          </p>
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold">Subscriber</p>
              <p className="mt-2 text-sm text-white/70">View settled bills, pending dues, and assigned services.</p>
            </div>
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold">Collector</p>
              <p className="mt-2 text-sm text-white/70">Track route collections, pending households, and cash in hand.</p>
            </div>
            <div className="rounded-[28px] border border-white/12 bg-white/10 p-4 backdrop-blur-sm">
              <p className="text-sm font-semibold">Admin</p>
              <p className="mt-2 text-sm text-white/70">Manage users, services, assignments, and station summaries.</p>
            </div>
          </div>
        </section>

        <section className="rounded-[38px] border border-[color:var(--line)] bg-[color:var(--surface-elevated)] p-8 panel-shadow backdrop-blur-xl">
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">Secure Login</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.02em]">Access workspace</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--foreground-muted)]">Select a role and open the corresponding desktop console.</p>

          <div className="mt-6 grid grid-cols-3 gap-2 rounded-2xl bg-[color:var(--surface-muted)] p-1.5">
            {Object.keys(roleRoutes).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => changeRole(role)}
                className={`rounded-xl px-3 py-3 text-[0.72rem] font-semibold uppercase tracking-[0.14em] transition ${selectedRole === role ? "bg-[color:var(--brand)] text-white shadow-sm" : "text-[color:var(--foreground-muted)]"}`}
              >
                {role}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground-muted)]">User ID</p>
              <input value={userId} onChange={(event) => setUserId(event.target.value)} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 outline-none transition focus:border-[color:var(--line-strong)]" placeholder="User ID" />
            </div>
            <div>
              <p className="mb-2 text-sm font-medium text-[color:var(--foreground-muted)]">Password</p>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 outline-none transition focus:border-[color:var(--line-strong)]" placeholder="Password" />
            </div>

            {error ? <p className="text-sm font-medium text-red-500">{error}</p> : null}

            <button type="submit" className="w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-semibold text-white shadow-sm transition hover:brightness-105">
              Secure Login
            </button>
          </form>

          <div className="mt-6 rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[color:var(--foreground-muted)]">Demo Credentials</p>
            <p className="mt-2 text-sm leading-6 text-[color:var(--foreground-muted)]">ADMIN1 / ADMIN123</p>
            <p className="text-sm leading-6 text-[color:var(--foreground-muted)]">COLL17 / COLL123</p>
            <p className="text-sm leading-6 text-[color:var(--foreground-muted)]">SUB001 / PASS123</p>
          </div>
        </section>
      </div>
    </main>
  );
}
