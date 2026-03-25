"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import ThemeToggle from "./theme-fab";

function NavLink({ href, label, collapsed, active }) {
  return (
    <Link
      href={href}
      className={`flex items-center rounded-2xl px-4 py-3 text-sm font-semibold transition ${
        active
          ? "bg-[color:var(--accent)] text-[color:var(--brand-deep)] shadow-sm"
          : "text-[color:var(--foreground-muted)] hover:bg-[color:var(--surface)] hover:text-[color:var(--foreground)]"
      } ${collapsed ? "justify-center" : ""}`}
      title={collapsed ? label : undefined}
    >
      <span className={collapsed ? "hidden" : "block"}>{label}</span>
      <span className={collapsed ? "block" : "hidden"}>{label.slice(0, 1)}</span>
    </Link>
  );
}

export default function DesktopShell({ title, subtitle, navItems, actions, children }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <main className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto grid min-h-[calc(100vh-2.5rem)] max-w-7xl gap-5 rounded-[38px] border border-[color:var(--line)] bg-[color:var(--surface)] p-5 panel-shadow backdrop-blur-xl">
        <div className={`grid gap-5 ${collapsed ? "lg:grid-cols-[96px_minmax(0,1fr)]" : "lg:grid-cols-[294px_minmax(0,1fr)]"}`}>
          <aside className="rounded-[32px] border border-[color:var(--line)] bg-[linear-gradient(180deg,rgba(12,24,20,0.98),rgba(16,37,30,0.92))] p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            <div className="flex items-start justify-between gap-3">
              <div className={collapsed ? "hidden" : "block"}>
                <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-white/45">Panchayat Portal</p>
                <h1 className="mt-3 text-[1.65rem] font-semibold tracking-[-0.02em]">{title}</h1>
                <p className="mt-2 text-sm text-white/65">{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setCollapsed((current) => !current)}
                className="rounded-2xl border border-white/12 bg-white/6 px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
                aria-label={collapsed ? "Expand panel" : "Collapse panel"}
              >
                {collapsed ? ">" : "<"}
              </button>
            </div>

            <div className="mt-6 rounded-[24px] border border-white/10 bg-white/5 p-3">
              <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/40 ${collapsed ? "hidden" : "block"}`}>
                Workspace
              </p>
              <nav className="mt-2 space-y-2">
                {navItems.map((item) => (
                  <NavLink
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    collapsed={collapsed}
                    active={pathname === item.href}
                  />
                ))}
              </nav>
            </div>

            <div className="mt-4 rounded-[24px] border border-white/10 bg-white/5 p-3">
              <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/40 ${collapsed ? "hidden" : "block"}`}>
                Theme
              </p>
              <div className="mt-2">
                <ThemeToggle compact={collapsed} />
              </div>
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">{actions}</div>
          </aside>

          <section className="space-y-5 overflow-hidden rounded-[32px] border border-[color:var(--line)] bg-[color:var(--surface-elevated)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-xl">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
