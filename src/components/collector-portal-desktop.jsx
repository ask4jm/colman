"use client";

import { useMemo, useState } from "react";
import { collectorProfile, villagers } from "../lib/collector-demo-data";

const roles = ["Subscriber", "Collector", "Admin"];
const settlementWindows = {
  daily: "Deposit all collected cash at the main station before 7:00 PM.",
  weekly: "Seal the weekly bundle and submit every Saturday before noon.",
};
const serviceOptions = [
  "All Services",
  "Water Supply",
  "Waste Collection",
  "Street Light",
];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function flattenDues(records) {
  return records.flatMap((villager) =>
    villager.dues.map((due) => ({
      ...due,
      villagerId: villager.id,
      villagerCode: villager.code,
      villagerName: villager.name,
      ward: villager.ward,
      phone: villager.phone,
    })),
  );
}

function Icon({ path, className = "h-5 w-5" }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <path d={path} />
    </svg>
  );
}

function SummaryCard({ title, value, note, tone = "default", icon }) {
  const tones = {
    default: "bg-white border-[color:var(--line)] text-[color:var(--foreground)]",
    accent: "bg-[color:var(--accent)] border-transparent text-[color:var(--foreground)]",
    dark: "bg-[#11201a] border-transparent text-white",
  };

  return (
    <div className={`rounded-[28px] border p-5 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-black/45">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold">{value}</p>
          <p className="mt-2 text-sm leading-6 opacity-75">{note}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3 text-[color:var(--brand)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

function NavItem({ label, active }) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold ${
        active ? "bg-[color:var(--accent)] text-[color:var(--brand-deep)]" : "text-black/55"
      }`}
    >
      <span className="h-2 w-2 rounded-full bg-current" />
      {label}
    </div>
  );
}

export default function CollectorPortalDesktop() {
  const [activeRole, setActiveRole] = useState("Collector");
  const [settlementCycle, setSettlementCycle] = useState("daily");
  const [search, setSearch] = useState("");
  const [serviceFilter, setServiceFilter] = useState("All Services");
  const [selectedDueIds, setSelectedDueIds] = useState([]);
  const [collectedDueIds, setCollectedDueIds] = useState(["due-101", "due-301"]);
  const [submissions, setSubmissions] = useState([
    {
      id: "SUB-2303",
      cycle: "daily",
      submittedAt: "25 Mar 2026, 6:15 PM",
      amount: 1440,
      note: "Handed over to Thoubal main station cashier.",
    },
  ]);

  const pendingDues = useMemo(() => flattenDues(villagers), []);

  const visibleDues = useMemo(() => {
    return pendingDues.filter((due) => {
      const matchesSearch =
        !search ||
        [due.villagerName, due.villagerCode, due.ward, due.service]
          .join(" ")
          .toLowerCase()
          .includes(search.toLowerCase());
      const matchesService =
        serviceFilter === "All Services" || due.service === serviceFilter;

      return matchesSearch && matchesService;
    });
  }, [pendingDues, search, serviceFilter]);

  const selectedDues = visibleDues.filter((due) => selectedDueIds.includes(due.id));
  const unsubmittedDues = pendingDues.filter((due) => collectedDueIds.includes(due.id));
  const selectedTotal = selectedDues.reduce((sum, due) => sum + due.amount, 0);
  const cashInHand = unsubmittedDues.reduce((sum, due) => sum + due.amount, 0);
  const outstandingAmount = pendingDues
    .filter((due) => !collectedDueIds.includes(due.id))
    .reduce((sum, due) => sum + due.amount, 0);

  const tallyByService = unsubmittedDues.reduce((accumulator, due) => {
    accumulator[due.service] = (accumulator[due.service] || 0) + due.amount;
    return accumulator;
  }, {});

  function toggleDueSelection(dueId) {
    setSelectedDueIds((current) =>
      current.includes(dueId)
        ? current.filter((id) => id !== dueId)
        : [...current, dueId],
    );
  }

  function collectSelected() {
    if (!selectedDueIds.length) {
      return;
    }

    setCollectedDueIds((current) => [...new Set([...current, ...selectedDueIds])]);
    setSelectedDueIds([]);
  }

  function collectSingle(dueId) {
    setCollectedDueIds((current) => [...new Set([...current, dueId])]);
  }

  function submitToStation() {
    if (!unsubmittedDues.length) {
      return;
    }

    const now = new Date();
    const submittedAt = new Intl.DateTimeFormat("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(now);

    setSubmissions((current) => [
      {
        id: `SUB-${String(current.length + 2304).padStart(4, "0")}`,
        cycle: settlementCycle,
        submittedAt,
        amount: cashInHand,
        note:
          settlementCycle === "daily"
            ? "Daily bundle closed and received by the main station."
            : "Weekly collector ledger sealed and handed to the main station.",
      },
      ...current,
    ]);
    setCollectedDueIds([]);
  }

  return (
    <main className="app-shell px-4 py-5 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 rounded-[36px] border border-white/70 bg-white/65 p-3 panel-shadow backdrop-blur md:p-5">
        <section className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="rounded-[32px] bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[color:var(--brand)] p-3 text-white">
                <Icon path="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Zm0 5.5v6m-3-3h6" />
              </div>
              <div>
                <p className="text-lg font-semibold">Panchayat Portal</p>
                <p className="text-sm text-black/50">Collector cash ledger</p>
              </div>
            </div>

            <div className="mt-6 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.28em] text-black/40">
                Login role
              </p>
              <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl bg-white p-1">
                {roles.map((role) => (
                  <button
                    key={role}
                    type="button"
                    onClick={() => setActiveRole(role)}
                    className={`rounded-xl px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] ${
                      activeRole === role
                        ? "bg-[color:var(--brand)] text-white"
                        : "text-black/45"
                    }`}
                  >
                    {role}
                  </button>
                ))}
              </div>
              <div className="mt-4 rounded-2xl bg-white p-4">
                <p className="font-semibold">{collectorProfile.name}</p>
                <p className="mt-1 text-sm text-black/55">
                  Route: {collectorProfile.route} | {collectorProfile.station}
                </p>
                <p className="mt-3 text-xs uppercase tracking-[0.22em] text-[color:var(--brand-deep)]">
                  Collector ID {collectorProfile.code}
                </p>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <NavItem label="Dashboard" active />
              <NavItem label="Subscribers" />
              <NavItem label="Pending Dues" />
              <NavItem label="Bulk Payment" />
              <NavItem label="My Ledger" />
              <NavItem label="Settlement Reports" />
            </div>

            <div className="mt-6 rounded-[28px] bg-[#11201a] p-5 text-white">
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">
                Submission mode
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1">
                {["daily", "weekly"].map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setSettlementCycle(cycle)}
                    className={`rounded-xl px-3 py-2 text-sm font-semibold capitalize ${
                      settlementCycle === cycle
                        ? "bg-white text-[#11201a]"
                        : "text-white/65"
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
              <p className="mt-4 text-sm leading-6 text-white/75">
                {settlementWindows[settlementCycle]}
              </p>
            </div>
          </aside>

          <section className="rounded-[32px] bg-white p-5 sm:p-6">
            <div className="flex flex-col gap-5 border-b border-[color:var(--line)] pb-6 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[color:var(--brand-deep)]">
                  Manual Collection System
                </p>
                <h1 className="mt-3 max-w-2xl text-4xl font-semibold tracking-tight text-balance">
                  Collect cash from villagers in the field and settle with the main
                  station daily or weekly.
                </h1>
                <p className="mt-4 max-w-3xl text-base leading-7 text-black/60">
                  This flow keeps every door-to-door cash pickup visible: who paid,
                  which service was collected, how much the collector still holds, and
                  when the bundle must be deposited at the panchayat main station.
                </p>
              </div>
              <div className="rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-black/45">
                  Today&apos;s route
                </p>
                <p className="mt-2 text-2xl font-semibold">{collectorProfile.route}</p>
                <p className="mt-1 text-sm text-black/55">
                  {collectorProfile.households} households assigned
                </p>
              </div>
            </div>

            <div className="card-grid mt-6 grid gap-4">
              <SummaryCard
                title="Cash in hand"
                value={formatCurrency(cashInHand)}
                note={`${unsubmittedDues.length} collections waiting for station submission.`}
                tone="accent"
                icon={<Icon path="M3 7h18v10H3z M7 12h10" />}
              />
              <SummaryCard
                title="Outstanding dues"
                value={formatCurrency(outstandingAmount)}
                note="Still pending from villagers on this route."
                icon={<Icon path="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />}
              />
              <SummaryCard
                title="This cycle"
                value={settlementCycle === "daily" ? "Daily" : "Weekly"}
                note={settlementWindows[settlementCycle]}
                icon={<Icon path="M8 2v4m8-4v4M3 10h18M5 6h14a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2Z" />}
              />
              <SummaryCard
                title="Main station"
                value={collectorProfile.station}
                note="Collector handover destination for cash bags and ledger slips."
                tone="dark"
                icon={<Icon path="M4 10 12 4l8 6v9a1 1 0 0 1-1 1h-4v-6H9v6H5a1 1 0 0 1-1-1z" />}
              />
            </div>

            <div className="ledger-grid mt-6 grid gap-5">
              <div className="space-y-5">
                <section className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <h2 className="text-2xl font-semibold">Collection workspace</h2>
                      <p className="mt-2 text-sm leading-6 text-black/60">
                        Search villagers, tick pending dues, then record cash received in
                        one sweep or one household at a time.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={collectSelected}
                      className="rounded-2xl bg-[color:var(--brand)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,159,110,0.22)] transition hover:bg-[color:var(--brand-deep)]"
                    >
                      Collect Selected {selectedTotal ? `| ${formatCurrency(selectedTotal)}` : ""}
                    </button>
                  </div>

                  <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
                    <input
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search villagers, ward, or service"
                      className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none ring-0 placeholder:text-black/35"
                    />
                    <select
                      value={serviceFilter}
                      onChange={(event) => setServiceFilter(event.target.value)}
                      className="rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none"
                    >
                      {serviceOptions.map((service) => (
                        <option key={service} value={service}>
                          {service}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mt-5 space-y-3">
                    {visibleDues.map((due) => {
                      const isCollected = collectedDueIds.includes(due.id);
                      const isSelected = selectedDueIds.includes(due.id);

                      return (
                        <article
                          key={due.id}
                          className={`rounded-[26px] border p-4 transition ${
                            isCollected
                              ? "border-transparent bg-white opacity-70"
                              : "border-[color:var(--line)] bg-white"
                          }`}
                        >
                          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex items-start gap-3">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleDueSelection(due.id)}
                                disabled={isCollected}
                                className="mt-1 h-4 w-4 accent-[color:var(--brand)]"
                              />
                              <div>
                                <div className="flex flex-wrap items-center gap-2">
                                  <span className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                                    {due.villagerCode}
                                  </span>
                                  <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">
                                    {due.service}
                                  </span>
                                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs font-semibold text-black/55">
                                    {due.period}
                                  </span>
                                </div>
                                <h3 className="mt-2 text-xl font-semibold">{due.villagerName}</h3>
                                <p className="mt-1 text-sm text-black/55">
                                  {due.phone} | {due.ward}
                                </p>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-3">
                              <div className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-3">
                                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/40">
                                  Amount
                                </p>
                                <p className="mt-1 text-2xl font-semibold">
                                  {formatCurrency(due.amount)}
                                </p>
                              </div>
                              <button
                                type="button"
                                onClick={() => collectSingle(due.id)}
                                disabled={isCollected}
                                className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                                  isCollected
                                    ? "bg-black/5 text-black/35"
                                    : "bg-[#11201a] text-white"
                                }`}
                              >
                                {isCollected ? "Collected" : "Record Cash"}
                              </button>
                            </div>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="space-y-5">
                <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-black/40">
                    Submission Ledger
                  </p>
                  <h2 className="mt-3 text-2xl font-semibold">Deposit to main station</h2>
                  <p className="mt-2 text-sm leading-6 text-black/60">
                    Submit all cash in hand with a collector slip. The system stores the
                    deposit as a daily or weekly settlement batch.
                  </p>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                        Cash ready
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{formatCurrency(cashInHand)}</p>
                    </div>
                    <div className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-black/35">
                        Unsubmitted collections
                      </p>
                      <p className="mt-2 text-3xl font-semibold">{unsubmittedDues.length}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={submitToStation}
                    disabled={!unsubmittedDues.length}
                    className={`mt-5 w-full rounded-2xl px-4 py-4 text-sm font-semibold ${
                      unsubmittedDues.length
                        ? "bg-[color:var(--brand)] text-white shadow-[0_14px_28px_rgba(14,159,110,0.22)]"
                        : "bg-black/5 text-black/35"
                    }`}
                  >
                    Submit {settlementCycle} collection to main station
                  </button>
                </section>

                <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold">Cash tally</h2>
                    <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">
                      Before deposit
                    </span>
                  </div>
                  <div className="mt-4 space-y-3">
                    {Object.entries(tallyByService).length ? (
                      Object.entries(tallyByService).map(([service, amount]) => (
                        <div
                          key={service}
                          className="flex items-center justify-between rounded-2xl bg-[color:var(--surface-muted)] px-4 py-3"
                        >
                          <span className="text-sm font-medium">{service}</span>
                          <span className="text-sm font-semibold">{formatCurrency(amount)}</span>
                        </div>
                      ))
                    ) : (
                      <p className="rounded-2xl bg-[color:var(--surface-muted)] px-4 py-5 text-sm text-black/55">
                        No cash in hand. Record a collection to generate the tally.
                      </p>
                    )}
                  </div>
                </section>

                <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
                  <h2 className="text-xl font-semibold">Recent submissions</h2>
                  <div className="mt-4 space-y-3">
                    {submissions.map((submission) => (
                      <article
                        key={submission.id}
                        className="rounded-[24px] bg-[color:var(--surface-muted)] p-4"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold">{submission.id}</p>
                            <p className="mt-1 text-sm text-black/55">
                              {submission.submittedAt}
                            </p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold capitalize text-[color:var(--brand-deep)]">
                            {submission.cycle}
                          </span>
                        </div>
                        <p className="mt-3 text-2xl font-semibold">
                          {formatCurrency(submission.amount)}
                        </p>
                        <p className="mt-2 text-sm leading-6 text-black/60">
                          {submission.note}
                        </p>
                      </article>
                    ))}
                  </div>
                </section>
              </div>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
