"use client";

import { useState } from "react";
import AdminEntityDialog from "./admin-entity-dialog";
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
      <p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] opacity-55">{title}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-2 text-sm leading-5 opacity-75">{note}</p>
    </div>
  );
}

function Panel({ title, action, children }) {
  return (
    <article className="rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-semibold">{title}</h3>
        {action}
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </article>
  );
}

function GhostButton({ children, ...props }) {
  return (
    <button
      {...props}
      className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-elevated)] px-3 py-2 text-sm font-semibold text-[color:var(--foreground-muted)] transition hover:text-[color:var(--foreground)]"
    >
      {children}
    </button>
  );
}

function RecordCard({ children }) {
  return <div className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-elevated)] p-4">{children}</div>;
}

export default function DesktopAdminPage({ section = "overview" }) {
  const {
    currentProfile,
    logout,
    summary,
    adminCollectors,
    adminSubscribers,
    adminAdmins,
    adminServices,
    createEntityDraft,
    saveEntity,
    toggleEntity,
    assignCollector,
  } = usePortal();
  const [entityDialog, setEntityDialog] = useState(null);

  function handleOpenCreate(type) {
    setEntityDialog({ mode: "create", type, entityId: null, values: createEntityDraft(type) });
  }

  function handleOpenEdit(type, id) {
    const current =
      type === "subscriber"
        ? adminSubscribers.find((item) => item.id === id)
        : type === "collector"
          ? adminCollectors.find((item) => item.id === id)
          : type === "service"
            ? adminServices.find((item) => item.id === id)
            : adminAdmins.find((item) => item.id === id);

    if (!current) return;

    setEntityDialog({ mode: "edit", type, entityId: id, values: createEntityDraft(type, current) });
  }

  function handleChange(field, value) {
    setEntityDialog((current) =>
      current
        ? { ...current, values: { ...current.values, [field]: value } }
        : current,
    );
  }

  function handleToggleService(serviceName) {
    setEntityDialog((current) => {
      if (!current || current.type !== "subscriber") return current;
      const exists = current.values.services.includes(serviceName);
      return {
        ...current,
        values: {
          ...current.values,
          services: exists
            ? current.values.services.filter((item) => item !== serviceName)
            : [...current.values.services, serviceName],
        },
      };
    });
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (!entityDialog) return;
    saveEntity(entityDialog);
    setEntityDialog(null);
  }

  const overviewCards = (
    <div className="grid gap-4 xl:grid-cols-5">
      <StatCard title="Subscribers" value={summary.subscribers} note="Registered village accounts." />
      <StatCard title="Collectors" value={summary.collectors} note="Active field collection staff." />
      <StatCard title="Admins" value={summary.admins} note="Back-office users with access." />
      <StatCard title="Pending dues" value={summary.pendingSubscribers} note="Subscribers still carrying open dues." />
      <StatCard title="Station total" value={formatCurrency(summary.submittedToStation)} note="Cash submitted to the main station." />
    </div>
  );

  const subscriberPanel = (
    <Panel title="Subscribers" action={<button type="button" onClick={() => handleOpenCreate("subscriber")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">New</button>}>
      {adminSubscribers.map((subscriber) => (
        <RecordCard key={subscriber.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{subscriber.name}</p>
              <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{subscriber.id} | {subscriber.ward}</p>
            </div>
            <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">{formatCurrency(subscriber.pending)}</span>
          </div>
          <p className="mt-3 text-sm text-[color:var(--foreground-muted)]">{subscriber.phone} | {subscriber.email}</p>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{subscriber.address}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(subscriber.services ?? []).map((service) => (
              <span key={service} className="rounded-full bg-[color:var(--surface-strong)] px-3 py-1 text-xs font-semibold text-[color:var(--foreground-muted)]">{service}</span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => handleOpenEdit("subscriber", subscriber.id)}>Edit</GhostButton>
            <GhostButton type="button" onClick={() => assignCollector(subscriber.id)}>Assign Collector</GhostButton>
            <GhostButton type="button" onClick={() => toggleEntity("subscriber", subscriber.id)}>{subscriber.active ? "Disable" : "Enable"}</GhostButton>
          </div>
        </RecordCard>
      ))}
    </Panel>
  );

  const collectorPanel = (
    <Panel title="Collectors" action={<button type="button" onClick={() => handleOpenCreate("collector")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">New</button>}>
      {adminCollectors.map((collector) => (
        <RecordCard key={collector.id}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-semibold">{collector.name}</p>
              <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{collector.route}</p>
            </div>
            <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">{formatCurrency(collector.cashInHand)}</span>
          </div>
          <p className="mt-3 text-sm text-[color:var(--foreground-muted)]">{collector.phone} | {collector.email}</p>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{collector.address}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => handleOpenEdit("collector", collector.id)}>Edit</GhostButton>
            <GhostButton type="button" onClick={() => toggleEntity("collector", collector.id)}>{collector.active ? "Disable" : "Enable"}</GhostButton>
          </div>
        </RecordCard>
      ))}
    </Panel>
  );

  const adminPanel = (
    <Panel title="Admins" action={<button type="button" onClick={() => handleOpenCreate("admin")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">New</button>}>
      {adminAdmins.map((admin) => (
        <RecordCard key={admin.id}>
          <p className="font-semibold">{admin.name}</p>
          <p className="mt-1 text-sm text-[color:var(--foreground-muted)]">{admin.role}</p>
          <p className="mt-3 text-sm text-[color:var(--foreground-muted)]">{admin.access}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => handleOpenEdit("admin", admin.id)}>Edit</GhostButton>
            <GhostButton type="button" onClick={() => toggleEntity("admin", admin.id)}>{admin.active ? "Disable" : "Enable"}</GhostButton>
          </div>
        </RecordCard>
      ))}
    </Panel>
  );

  const servicePanel = (
    <Panel title="Service catalog" action={<button type="button" onClick={() => handleOpenCreate("service")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">New</button>}>
      {adminServices.map((service) => (
        <RecordCard key={service.id}>
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{service.name}</p>
            <span className="rounded-full bg-[color:var(--accent)] px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">{formatCurrency(service.rate)}</span>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <GhostButton type="button" onClick={() => handleOpenEdit("service", service.id)}>Edit</GhostButton>
            <GhostButton type="button" onClick={() => toggleEntity("service", service.id)}>{service.active ? "Disable" : "Enable"}</GhostButton>
          </div>
        </RecordCard>
      ))}
    </Panel>
  );

  return (
    <DesktopGuard role="Admin">
      <DesktopShell
        title="Admin Console"
        subtitle={currentProfile?.station ?? ""}
        navItems={[
          { href: "/admin", label: "Overview" },
          { href: "/admin/subscribers", label: "Subscribers" },
          { href: "/admin/collectors", label: "Collectors" },
          { href: "/admin/admins", label: "Admins" },
          { href: "/admin/services", label: "Services" },
        ]}
        actions={<button type="button" onClick={logout} className="w-full rounded-2xl bg-[color:var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground)]">Sign Out</button>}
      >
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">Desktop management</p>
            <h2 className="mt-3 text-4xl font-semibold">
              {section === "subscribers" ? "Subscriber management" : section === "collectors" ? "Collector management" : section === "admins" ? "Admin management" : section === "services" ? "Service management" : "Panchayat admin console"}
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[color:var(--foreground-muted)]">Use the desktop workspace to manage users, subscriber services, collector assignments, and rates.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={() => handleOpenCreate("subscriber")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">Add Subscriber</button>
            <button type="button" onClick={() => handleOpenCreate("collector")} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground-muted)]">Add Collector</button>
            <button type="button" onClick={() => handleOpenCreate("service")} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-elevated)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground-muted)]">Add Service</button>
          </div>
        </header>

        {overviewCards}

        {section === "overview" ? <section className="grid gap-5 2xl:grid-cols-2">{subscriberPanel}{collectorPanel}{adminPanel}{servicePanel}</section> : null}
        {section === "subscribers" ? subscriberPanel : null}
        {section === "collectors" ? collectorPanel : null}
        {section === "admins" ? adminPanel : null}
        {section === "services" ? servicePanel : null}

        <AdminEntityDialog
          dialog={entityDialog}
          collectors={adminCollectors}
          serviceCatalog={adminServices}
          onChange={handleChange}
          onToggleService={handleToggleService}
          onClose={() => setEntityDialog(null)}
          onSubmit={handleSubmit}
        />
      </DesktopShell>
    </DesktopGuard>
  );
}
