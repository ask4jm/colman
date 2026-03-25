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
    <div className={`rounded-[28px] border p-4 ${tones[tone]}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-black/45">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
          <p className="mt-2 text-sm leading-5 opacity-75">{note}</p>
        </div>
        <div className="rounded-2xl bg-white/70 p-3 text-[color:var(--brand)]">
          {icon}
        </div>
      </div>
    </div>
  );
}

export default function CollectorPortal() {
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
    <main className="app-shell px-3 py-4">
      <div className="mx-auto w-full max-w-[430px] rounded-[36px] border border-white/80 bg-[#f7fbf8] p-3 panel-shadow">
        <div className="rounded-[32px] bg-white p-4">
          <header className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-[color:var(--brand)] p-3 text-white">
                <Icon path="M12 3l7 3v5c0 5-3.5 8.5-7 10-3.5-1.5-7-5-7-10V6l7-3Zm0 5.5v6m-3-3h6" />
              </div>
              <div>
                <p className="text-base font-semibold">Panchayat Portal</p>
                <p className="text-sm text-black/50">Manual collector ledger</p>
              </div>
            </div>
            <button
              type="button"
              className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-3 text-black/65"
              aria-label="Menu"
            >
              <Icon path="M4 7h16M4 12h16M4 17h16" />
            </button>
          </header>

          <section className="mt-5 rounded-[28px] bg-[linear-gradient(135deg,#0e9f6e_0%,#0b7e58_100%)] p-5 text-white">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-white/65">
                  Collector Route
                </p>
                <h1 className="mt-2 text-3xl font-semibold leading-9">{collectorProfile.route}</h1>
                <p className="mt-2 text-sm leading-6 text-white/80">{collectorProfile.station}</p>
              </div>
              <div className="rounded-[24px] bg-white/15 px-4 py-3 text-right backdrop-blur">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-white/65">
                  ID
                </p>
                <p className="mt-1 font-semibold">{collectorProfile.code}</p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-2 rounded-2xl bg-white/10 p-1">
              {roles.map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setActiveRole(role)}
                  className={`rounded-xl px-2 py-2 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
                    activeRole === role ? "bg-white text-[color:var(--brand-deep)]" : "text-white/70"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </section>

          <section className="mt-5 space-y-3">
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
          </section>

          <section className="mt-5 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-black/40">
                  Settlement Mode
                </p>
                <p className="mt-2 text-xl font-semibold capitalize">{settlementCycle}</p>
              </div>
              <div className="grid grid-cols-2 gap-2 rounded-2xl bg-white p-1">
                {["daily", "weekly"].map((cycle) => (
                  <button
                    key={cycle}
                    type="button"
                    onClick={() => setSettlementCycle(cycle)}
                    className={`rounded-xl px-4 py-2 text-sm font-semibold capitalize ${
                      settlementCycle === cycle
                        ? "bg-[color:var(--brand)] text-white"
                        : "text-black/45"
                    }`}
                  >
                    {cycle}
                  </button>
                ))}
              </div>
            </div>
            <p className="mt-3 text-sm leading-6 text-black/60">{settlementWindows[settlementCycle]}</p>
          </section>

          <section className="mt-5 rounded-[28px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-black/40">
                  Collection Workspace
                </p>
                <h2 className="mt-2 text-2xl font-semibold leading-8">Field cash pickup</h2>
              </div>
              <div className="rounded-2xl bg-white px-3 py-2 text-right">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-black/35">
                  Route load
                </p>
                <p className="mt-1 font-semibold">{collectorProfile.households} homes</p>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search villagers, ward, or service"
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none placeholder:text-black/35"
              />
              <select
                value={serviceFilter}
                onChange={(event) => setServiceFilter(event.target.value)}
                className="w-full rounded-2xl border border-[color:var(--line)] bg-white px-4 py-3 outline-none"
              >
                {serviceOptions.map((service) => (
                  <option key={service} value={service}>
                    {service}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={collectSelected}
                className="w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(14,159,110,0.22)]"
              >
                Collect Selected{selectedTotal ? ` | ${formatCurrency(selectedTotal)}` : ""}
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {visibleDues.map((due) => {
                const isCollected = collectedDueIds.includes(due.id);
                const isSelected = selectedDueIds.includes(due.id);

                return (
                  <article
                    key={due.id}
                    className={`rounded-[24px] border p-4 ${
                      isCollected ? "border-transparent bg-white opacity-70" : "border-[color:var(--line)] bg-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleDueSelection(due.id)}
                        disabled={isCollected}
                        className="mt-1 h-4 w-4 shrink-0 accent-[color:var(--brand)]"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[0.68rem] font-semibold uppercase tracking-[0.2em] text-black/35">
                            {due.villagerCode}
                          </span>
                          <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-[0.68rem] font-semibold text-[color:var(--brand-deep)]">
                            {due.service}
                          </span>
                        </div>
                        <h3 className="mt-2 text-lg font-semibold leading-6">{due.villagerName}</h3>
                        <p className="mt-1 text-sm text-black/55">{due.phone} | {due.ward}</p>
                        <div className="mt-3 flex items-end justify-between gap-3">
                          <div>
                            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-black/35">
                              {due.period}
                            </p>
                            <p className="mt-1 text-2xl font-semibold">{formatCurrency(due.amount)}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => collectSingle(due.id)}
                            disabled={isCollected}
                            className={`rounded-2xl px-4 py-3 text-sm font-semibold ${
                              isCollected ? "bg-black/5 text-black/35" : "bg-[#11201a] text-white"
                            }`}
                          >
                            {isCollected ? "Collected" : "Record Cash"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="mt-5 rounded-[28px] bg-[#11201a] p-4 text-white">
            <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-white/45">
              Deposit to Main Station
            </p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Cash ready
                </p>
                <p className="mt-2 text-2xl font-semibold">{formatCurrency(cashInHand)}</p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4">
                <p className="text-[0.64rem] font-semibold uppercase tracking-[0.22em] text-white/50">
                  Unsubmitted
                </p>
                <p className="mt-2 text-2xl font-semibold">{unsubmittedDues.length}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={submitToStation}
              disabled={!unsubmittedDues.length}
              className={`mt-4 w-full rounded-2xl px-4 py-4 text-sm font-semibold ${
                unsubmittedDues.length ? "bg-[color:var(--brand)] text-white" : "bg-white/10 text-white/35"
              }`}
            >
              Submit {settlementCycle} collection to main station
            </button>
          </section>

          <section className="mt-5 space-y-3">
            <div className="rounded-[28px] border border-[color:var(--line)] bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold">Cash tally</h2>
                <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-[0.68rem] font-semibold text-[color:var(--brand-deep)]">
                  Before deposit
                </span>
              </div>
              <div className="mt-4 space-y-2">
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
            </div>

            <div className="rounded-[28px] border border-[color:var(--line)] bg-white p-4">
              <h2 className="text-lg font-semibold">Recent submissions</h2>
              <div className="mt-4 space-y-3">
                {submissions.map((submission) => (
                  <article
                    key={submission.id}
                    className="rounded-[24px] bg-[color:var(--surface-muted)] p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{submission.id}</p>
                        <p className="mt-1 text-sm text-black/55">{submission.submittedAt}</p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-[0.68rem] font-semibold capitalize text-[color:var(--brand-deep)]">
                        {submission.cycle}
                      </span>
                    </div>
                    <p className="mt-3 text-2xl font-semibold">{formatCurrency(submission.amount)}</p>
                    <p className="mt-2 text-sm leading-6 text-black/60">{submission.note}</p>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
