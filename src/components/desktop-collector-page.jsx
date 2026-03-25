"use client";

import DesktopGuard from "./desktop-guard";
import DesktopShell from "./desktop-shell";
import { usePortal } from "./portal-provider";

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function StatCard({ title, value, note }) {
  return (
    <div className="rounded-[26px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] opacity-55">
        {title}
      </p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-5 opacity-75">{note}</p>
    </div>
  );
}

export default function DesktopCollectorPage({ section = "overview" }) {
  const {
    currentProfile,
    logout,
    collectorPendingSubscribers,
    collectorReceivedPayments,
    collectorRecord,
  } = usePortal();

  const pendingAmount = collectorPendingSubscribers.reduce((sum, item) => sum + item.amount, 0);
  const receivedAmount = collectorReceivedPayments.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DesktopGuard role="Collector">
      <DesktopShell
        title="Collector"
        subtitle={currentProfile?.route ?? ""}
        navItems={[
          { href: "/collector", label: "Overview" },
          { href: "/collector/pending", label: "Pending" },
          { href: "/collector/payments", label: "Payments" },
        ]}
        actions={
          <button type="button" onClick={logout} className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#102119]">
            Sign Out
          </button>
        }
      >
        <header>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">
            Collector workspace
          </p>
          <h2 className="mt-3 text-4xl font-semibold">
            {section === "pending" ? "Pending subscribers" : section === "payments" ? "Payments received" : "Collection route dashboard"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62">
            Monitor households still pending on the route and review payments already collected.
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-4">
          <StatCard title="Pending households" value={collectorPendingSubscribers.length} note="Subscribers with open cash dues." />
          <StatCard title="Pending amount" value={formatCurrency(pendingAmount)} note="Expected cash still outstanding." />
          <StatCard title="Received today" value={formatCurrency(receivedAmount)} note={`${collectorReceivedPayments.length} payments logged.`} />
          <StatCard title="Cash in hand" value={formatCurrency(collectorRecord?.cashInHand ?? 0)} note="Awaiting station submission." />
        </div>

        {section === "overview" ? (
          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
              <h3 className="text-xl font-semibold">Route summary</h3>
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">Collector</p>
                  <p className="mt-2 font-semibold">{currentProfile?.name}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">Station</p>
                  <p className="mt-2 font-semibold">{currentProfile?.station}</p>
                </div>
              </div>
            </article>
            <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
              <h3 className="text-xl font-semibold">Recent route activity</h3>
              <div className="mt-4 space-y-3">
                {collectorReceivedPayments.slice(0, 2).map((payment) => (
                  <div key={payment.id} className="rounded-2xl bg-white p-4">
                    <p className="font-semibold">{payment.subscriber}</p>
                    <p className="mt-1 text-sm text-black/55">{payment.paidOn}</p>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {section === "pending" ? (
          <section className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
            <h3 className="text-xl font-semibold">Pending subscribers</h3>
            <div className="mt-4 space-y-3">
              {collectorPendingSubscribers.map((subscriber) => (
                <div key={subscriber.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{subscriber.name}</p>
                      <p className="mt-1 text-sm text-black/55">{subscriber.id} | {subscriber.ward}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(subscriber.amount)}</p>
                  </div>
                  <p className="mt-3 text-sm text-black/55">{subscriber.service}</p>
                  <p className="mt-1 text-sm text-black/45">{subscriber.phone}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {section === "payments" ? (
          <section className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
            <h3 className="text-xl font-semibold">Payments received</h3>
            <div className="mt-4 space-y-3">
              {collectorReceivedPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{payment.subscriber}</p>
                      <p className="mt-1 text-sm text-black/55">{payment.subscriberId} | {payment.service}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                  </div>
                  <p className="mt-3 text-sm text-black/55">{payment.paidOn}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </DesktopShell>
    </DesktopGuard>
  );
}
