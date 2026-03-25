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

export default function DesktopSubscriberPage({ section = "overview" }) {
  const {
    currentProfile,
    logout,
    subscriberPayments,
    subscriberPendings,
    subscriberRecord,
  } = usePortal();

  const totalPaid = subscriberPayments.reduce((sum, item) => sum + item.amount, 0);
  const totalPending = subscriberPendings.reduce((sum, item) => sum + item.amount, 0);

  return (
    <DesktopGuard role="Subscriber">
      <DesktopShell
        title="Subscriber"
        subtitle={`${currentProfile?.name ?? ""} | ${currentProfile?.ward ?? ""}`}
        navItems={[
          { href: "/subscriber", label: "Overview" },
          { href: "/subscriber/payments", label: "Payments" },
          { href: "/subscriber/dues", label: "Pending Dues" },
        ]}
        actions={
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#102119]"
          >
            Sign Out
          </button>
        }
      >
        <header>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">
            Subscriber workspace
          </p>
          <h2 className="mt-3 text-4xl font-semibold">
            {section === "payments"
              ? "Payments made"
              : section === "dues"
                ? "Pending dues"
                : "Payment status"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-black/62">
            Review completed payments, open dues, and subscriber service coverage.
          </p>
        </header>

        <div className="grid gap-4 xl:grid-cols-3">
          <StatCard
            title="Paid bills"
            value={subscriberPayments.length}
            note="Receipts already settled."
          />
          <StatCard
            title="Total paid"
            value={formatCurrency(totalPaid)}
            note="Cash already collected and recorded."
          />
          <StatCard
            title="Pending dues"
            value={formatCurrency(totalPending)}
            note={`${subscriberPendings.length} service dues remain open.`}
          />
        </div>

        {section === "overview" ? (
          <section className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
            <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
              <h3 className="text-xl font-semibold">Subscriber profile</h3>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                    Name
                  </p>
                  <p className="mt-2 font-semibold">{subscriberRecord?.name}</p>
                </div>
                <div className="rounded-2xl bg-white p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                    Collector
                  </p>
                  <p className="mt-2 font-semibold">{subscriberRecord?.collectorName}</p>
                </div>
                <div className="rounded-2xl bg-white p-4 sm:col-span-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-black/35">
                    Services
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(subscriberRecord?.services ?? []).map((service) => (
                      <span
                        key={service}
                        className="rounded-full bg-[color:var(--accent)] px-3 py-2 text-sm font-semibold text-[color:var(--brand-deep)]"
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </article>

            <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
              <h3 className="text-xl font-semibold">Latest payments</h3>
              <div className="mt-4 space-y-3">
                {subscriberPayments.slice(0, 2).map((payment) => (
                  <div key={payment.id} className="rounded-2xl bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold">{payment.service}</p>
                        <p className="mt-1 text-sm text-black/55">{payment.period}</p>
                      </div>
                      <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          </section>
        ) : null}

        {section === "payments" ? (
          <section className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
            <h3 className="text-xl font-semibold">Payments made</h3>
            <div className="mt-4 space-y-3">
              {subscriberPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{payment.service}</p>
                      <p className="mt-1 text-sm text-black/55">{payment.period}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(payment.amount)}</p>
                  </div>
                  <p className="mt-3 text-sm text-black/55">
                    Paid on {payment.paidOn} via {payment.collectedBy}
                  </p>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {section === "dues" ? (
          <section className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
            <h3 className="text-xl font-semibold">Pending dues</h3>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {subscriberPendings.map((due) => (
                <div key={due.id} className="rounded-2xl bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="font-semibold">{due.service}</p>
                      <p className="mt-1 text-sm text-black/55">{due.period}</p>
                    </div>
                    <p className="text-lg font-semibold">{formatCurrency(due.amount)}</p>
                  </div>
                  <p className="mt-3 text-sm text-black/55">Due date: {due.dueDate}</p>
                </div>
              ))}
            </div>
          </section>
        ) : null}
      </DesktopShell>
    </DesktopGuard>
  );
}
