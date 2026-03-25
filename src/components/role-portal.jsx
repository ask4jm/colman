"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import AdminEntityDialog from "./admin-entity-dialog";
import {
  adminAdmins,
  adminCollectors as adminCollectorsSeed,
  adminSubscribers,
  adminSummary as adminSummarySeed,
  collectorPendingSubscribers as collectorPendingSubscribersSeed,
  collectorReceivedPayments as collectorReceivedPaymentsSeed,
  demoUsers,
  serviceCatalog as serviceCatalogSeed,
  subscriberPayments as subscriberPaymentsSeed,
  subscriberPendings as subscriberPendingsSeed,
} from "../lib/collector-demo-data";

const roles = ["Subscriber", "Collector", "Admin"];

function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount || 0);
}

function Shell({ mobile, children }) {
  if (mobile) {
    return <main className="app-shell px-3 py-4"><div className="mx-auto w-full max-w-[430px] rounded-[36px] border border-white/80 bg-[#f7fbf8] p-3 panel-shadow"><div className="rounded-[32px] bg-white p-4">{children}</div></div></main>;
  }

  return <main className="app-shell min-h-screen px-4 py-5 sm:px-6 lg:px-8"><div className="mx-auto w-full max-w-7xl rounded-[36px] border border-white/70 bg-white/65 p-4 panel-shadow backdrop-blur md:p-5">{children}</div></main>;
}

function StatCard({ title, value, note }) {
  return <div className="rounded-[26px] border border-[color:var(--line)] bg-white p-4"><p className="text-[0.68rem] font-semibold uppercase tracking-[0.22em] opacity-55">{title}</p><p className="mt-2 text-2xl font-semibold">{value}</p><p className="mt-2 text-sm leading-5 opacity-75">{note}</p></div>;
}

function LoginScreen({ mobile, selectedRole, setSelectedRole, onLogin, error, allowedRoles }) {
  const [userId, setUserId] = useState(demoUsers[selectedRole].userId);
  const [password, setPassword] = useState(demoUsers[selectedRole].password);

  function changeRole(role) {
    setSelectedRole(role);
    setUserId(demoUsers[role].userId);
    setPassword(demoUsers[role].password);
  }

  function submit(event) {
    event.preventDefault();
    onLogin({ role: selectedRole, userId, password });
  }

  return (
    <Shell mobile={mobile}>
      <div className={mobile ? "space-y-5" : "grid gap-5 lg:grid-cols-[1.1fr_0.9fr]"}>
        <section className="rounded-[30px] bg-[linear-gradient(135deg,#0e9f6e_0%,#0b7e58_100%)] p-5 text-white">
          <p className="text-lg font-semibold">Panchayat Service Portal</p>
          <p className="mt-2 text-sm text-white/75">Role based village payment system</p>
          <h1 className="mt-8 text-4xl font-semibold leading-tight">Login for subscribers, collectors, and admins.</h1>
        </section>
        <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
          <div className="grid grid-cols-3 gap-2 rounded-2xl bg-[color:var(--surface-muted)] p-1">
            {allowedRoles.map((role) => <button key={role} type="button" onClick={() => changeRole(role)} className={`rounded-xl px-2 py-3 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${selectedRole === role ? "bg-[color:var(--brand)] text-white" : "text-black/45"}`}>{role}</button>)}
          </div>
          <form onSubmit={submit} className="mt-5 space-y-4">
            <input value={userId} onChange={(event) => setUserId(event.target.value)} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 outline-none" placeholder="User ID" />
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 outline-none" placeholder="Password" />
            {error ? <p className="text-sm font-medium text-red-600">{error}</p> : null}
            <button type="submit" className="w-full rounded-2xl bg-[color:var(--brand)] px-5 py-4 text-sm font-semibold text-white">Login as {selectedRole}</button>
          </form>
        </section>
      </div>
    </Shell>
  );
}

function SimpleDashboard({ mobile, title, name, subtitle, stats, onLogout, children }) {
  return (
    <Shell mobile={mobile}>
      <div className={mobile ? "space-y-4" : "grid gap-5 lg:grid-cols-[260px_minmax(0,1fr)]"}>
        <aside className="rounded-[30px] bg-[#11201a] p-5 text-white">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/45">{title}</p>
          <h1 className="mt-3 text-3xl font-semibold">{name}</h1>
          <p className="mt-2 text-sm text-white/70">{subtitle}</p>
          <button type="button" onClick={onLogout} className="mt-6 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-[#11201a]">Sign Out</button>
        </aside>
        <section className="space-y-5">
          <div className={`grid gap-4 ${mobile ? "" : "md:grid-cols-3"}`}>
            {stats.map((stat) => <StatCard key={stat.title} title={stat.title} value={stat.value} note={stat.note} />)}
          </div>
          {children}
        </section>
      </div>
    </Shell>
  );
}

function AdminDashboard({ mobile, profile, onLogout, summary, collectors, subscribers, admins, services, onAddEntity, onEditEntity, onToggleEntity, onAssignCollector }) {
  return (
    <SimpleDashboard
      mobile={mobile}
      title="Admin"
      name={profile.name}
      subtitle={profile.station}
      onLogout={onLogout}
      stats={[
        { title: "Subscribers", value: summary.subscribers, note: "Registered village accounts." },
        { title: "Collectors", value: summary.collectors, note: "Active field collectors." },
        { title: "Admins", value: summary.admins, note: "Authorized back-office users." },
      ]}
    >
      <div className={`grid gap-5 ${mobile ? "" : "xl:grid-cols-2 2xl:grid-cols-4"}`}>
        <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">Collector management</h3><button type="button" onClick={() => onAddEntity("collector")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">Add Collector</button></div>
          <div className="mt-4 space-y-3">
            {collectors.map((collector) => (
              <article key={collector.id} className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                <p className="font-semibold">{collector.name}</p>
                <p className="mt-1 text-sm text-black/55">{collector.route}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEditEntity("collector", collector.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">Edit</button>
                  <button type="button" onClick={() => onToggleEntity("collector", collector.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">{collector.active ? "Disable" : "Enable"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">Subscriber management</h3><button type="button" onClick={() => onAddEntity("subscriber")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">Add Subscriber</button></div>
          <div className="mt-4 space-y-3">
            {subscribers.map((subscriber) => (
              <article key={subscriber.id} className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                <p className="font-semibold">{subscriber.name}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {(subscriber.services ?? []).map((service) => <span key={service} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">{service}</span>)}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEditEntity("subscriber", subscriber.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">Edit</button>
                  <button type="button" onClick={() => onAssignCollector(subscriber.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">Assign Collector</button>
                  <button type="button" onClick={() => onToggleEntity("subscriber", subscriber.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">{subscriber.active ? "Disable" : "Enable"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">Admin management</h3><button type="button" onClick={() => onAddEntity("admin")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">Add Admin</button></div>
          <div className="mt-4 space-y-3">
            {admins.map((admin) => (
              <article key={admin.id} className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                <p className="font-semibold">{admin.name}</p>
                <p className="mt-1 text-sm text-black/55">{admin.role}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEditEntity("admin", admin.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">Edit</button>
                  <button type="button" onClick={() => onToggleEntity("admin", admin.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">{admin.active ? "Disable" : "Enable"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
        <section className="rounded-[30px] border border-[color:var(--line)] bg-white p-5">
          <div className="flex items-center justify-between gap-3"><h3 className="text-xl font-semibold">Service catalog</h3><button type="button" onClick={() => onAddEntity("service")} className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">Add Service</button></div>
          <div className="mt-4 space-y-3">
            {services.map((service) => (
              <article key={service.id} className="rounded-[24px] bg-[color:var(--surface-muted)] p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-semibold">{service.name}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[color:var(--brand-deep)]">{formatCurrency(service.rate)}</span>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button type="button" onClick={() => onEditEntity("service", service.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">Edit</button>
                  <button type="button" onClick={() => onToggleEntity("service", service.id)} className="rounded-2xl border border-[color:var(--line)] px-3 py-2 text-sm font-semibold text-black/65">{service.active ? "Disable" : "Enable"}</button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </SimpleDashboard>
  );
}
function createEntityDraft(type, collectors, current = null) {
  if (type === "subscriber") return { name: current?.name ?? "", ward: current?.ward ?? "", phone: current?.phone ?? "", address: current?.address ?? "", email: current?.email ?? "", lat: current?.lat ?? "", lon: current?.lon ?? "", status: current?.status ?? "Pending", pending: String(current?.pending ?? 0), collectorId: current?.collectorId ?? collectors.find((item) => item.active !== false)?.id ?? "", services: current?.services ?? [] };
  if (type === "collector") return { name: current?.name ?? "", route: current?.route ?? "", phone: current?.phone ?? "", address: current?.address ?? "", email: current?.email ?? "", lat: current?.lat ?? "", lon: current?.lon ?? "" };
  if (type === "service") return { name: current?.name ?? "", rate: String(current?.rate ?? 0) };
  return { name: current?.name ?? "", role: current?.role ?? "Operations Admin", access: current?.access ?? "User management" };
}

export default function RolePortal({ mobile = false, initialRole = "Subscriber", allowedRoles = roles }) {
  const permittedRoles = allowedRoles.length ? allowedRoles : roles;
  const [selectedRole, setSelectedRole] = useState(permittedRoles.includes(initialRole) ? initialRole : permittedRoles[0]);
  const [session, setSession] = useState(null);
  const [error, setError] = useState("");
  const [adminCollectors, setAdminCollectors] = useState(adminCollectorsSeed);
  const [adminSubscribersState, setAdminSubscribersState] = useState(adminSubscribers);
  const [adminAdminsState, setAdminAdminsState] = useState(adminAdmins);
  const [adminServices, setAdminServices] = useState(serviceCatalogSeed);
  const [adminSummary, setAdminSummary] = useState(adminSummarySeed);
  const [entityDialog, setEntityDialog] = useState(null);

  const currentProfile = useMemo(() => session ? demoUsers[session.role].profile : null, [session]);

  function refreshAdminSummary(nextSubscribers, nextCollectors, nextAdmins) {
    setAdminSummary((current) => ({ ...current, subscribers: nextSubscribers.length, collectors: nextCollectors.filter((item) => item.active !== false).length, admins: nextAdmins.filter((item) => item.active !== false).length, pendingSubscribers: nextSubscribers.filter((item) => item.pending > 0 && item.active !== false).length }));
  }

  function handleLogin({ role, userId, password }) {
    const account = demoUsers[role];
    if (account.userId === userId && account.password === password) {
      setSession({ role });
      setError("");
      return;
    }
    setError("Invalid credentials for the selected role.");
  }

  function handleEntityFormChange(field, value) {
    setEntityDialog((current) => current ? { ...current, values: { ...current.values, [field]: value } } : current);
  }

  function handleEntityServiceToggle(serviceName) {
    setEntityDialog((current) => {
      if (!current || current.type !== "subscriber") return current;
      const services = current.values.services.includes(serviceName) ? current.values.services.filter((item) => item !== serviceName) : [...current.values.services, serviceName];
      return { ...current, values: { ...current.values, services } };
    });
  }

  function handleAddEntity(type) {
    setEntityDialog({ mode: "create", type, entityId: null, values: createEntityDraft(type, adminCollectors) });
  }

  function handleEditEntity(type, id) {
    const current = type === "subscriber" ? adminSubscribersState.find((item) => item.id === id) : type === "collector" ? adminCollectors.find((item) => item.id === id) : type === "service" ? adminServices.find((item) => item.id === id) : adminAdminsState.find((item) => item.id === id);
    if (!current) return;
    setEntityDialog({ mode: "edit", type, entityId: id, values: createEntityDraft(type, adminCollectors, current) });
  }

  function handleEntitySubmit(event) {
    event.preventDefault();
    if (!entityDialog) return;
    const { mode, type, entityId, values } = entityDialog;

    if (type === "subscriber") {
      const collector = adminCollectors.find((item) => item.id === values.collectorId);
      const record = { ...values, pending: Number(values.pending || 0), collectorName: collector?.name ?? "Unassigned" };
      const nextSubscribers = mode === "create" ? [{ id: `SUB${Date.now().toString().slice(-3)}`, ...record, active: true }, ...adminSubscribersState] : adminSubscribersState.map((item) => item.id === entityId ? { ...item, ...record } : item);
      setAdminSubscribersState(nextSubscribers);
      refreshAdminSummary(nextSubscribers, adminCollectors, adminAdminsState);
      toast.success(mode === "create" ? "Subscriber added" : "Subscriber updated");
    } else if (type === "collector") {
      const nextCollectors = mode === "create" ? [{ id: `COLL${Date.now().toString().slice(-2)}`, ...values, cashInHand: 0, submitted: 0, active: true }, ...adminCollectors] : adminCollectors.map((item) => item.id === entityId ? { ...item, ...values } : item);
      setAdminCollectors(nextCollectors);
      refreshAdminSummary(adminSubscribersState, nextCollectors, adminAdminsState);
      toast.success(mode === "create" ? "Collector added" : "Collector updated");
    } else if (type === "service") {
      const nextServices = mode === "create" ? [{ id: `SRV${Date.now().toString().slice(-3)}`, name: values.name.trim(), rate: Number(values.rate || 0), active: true }, ...adminServices] : adminServices.map((item) => item.id === entityId ? { ...item, name: values.name.trim(), rate: Number(values.rate || 0) } : item);
      setAdminServices(nextServices);
      toast.success(mode === "create" ? "Service added" : "Service updated");
    } else {
      const nextAdmins = mode === "create" ? [{ id: `ADMIN${Date.now().toString().slice(-1)}`, name: values.name.trim(), role: values.role.trim(), access: values.access.trim(), active: true }, ...adminAdminsState] : adminAdminsState.map((item) => item.id === entityId ? { ...item, name: values.name.trim(), role: values.role.trim(), access: values.access.trim() } : item);
      setAdminAdminsState(nextAdmins);
      refreshAdminSummary(adminSubscribersState, adminCollectors, nextAdmins);
      toast.success(mode === "create" ? "Admin added" : "Admin updated");
    }

    setEntityDialog(null);
  }

  function handleToggleEntity(type, id) {
    if (type === "subscriber") {
      const next = adminSubscribersState.map((item) => item.id === id ? { ...item, active: !item.active } : item);
      setAdminSubscribersState(next);
      refreshAdminSummary(next, adminCollectors, adminAdminsState);
      return;
    }
    if (type === "collector") {
      const next = adminCollectors.map((item) => item.id === id ? { ...item, active: !item.active } : item);
      setAdminCollectors(next);
      refreshAdminSummary(adminSubscribersState, next, adminAdminsState);
      return;
    }
    if (type === "service") {
      const target = adminServices.find((item) => item.id === id);
      const next = adminServices.map((item) => item.id === id ? { ...item, active: !item.active } : item);
      setAdminServices(next);
      if (target?.active) {
        setAdminSubscribersState((current) => current.map((item) => ({ ...item, services: (item.services ?? []).filter((service) => service !== target.name) })));
      }
      return;
    }
    const next = adminAdminsState.map((item) => item.id === id ? { ...item, active: !item.active } : item);
    setAdminAdminsState(next);
    refreshAdminSummary(adminSubscribersState, adminCollectors, next);
  }

  function handleAssignCollector(subscriberId) {
    const activeCollectors = adminCollectors.filter((item) => item.active !== false);
    if (!activeCollectors.length) return;
    const nextSubscribers = adminSubscribersState.map((item) => {
      if (item.id !== subscriberId) return item;
      const currentIndex = activeCollectors.findIndex((collector) => collector.id === item.collectorId);
      const nextCollector = activeCollectors[(currentIndex + 1) % activeCollectors.length];
      return { ...item, collectorId: nextCollector.id, collectorName: nextCollector.name };
    });
    setAdminSubscribersState(nextSubscribers);
    refreshAdminSummary(nextSubscribers, adminCollectors, adminAdminsState);
  }

  function handleLogout() {
    setSession(null);
    setError("");
  }

  if (!session) {
    return <LoginScreen mobile={mobile} selectedRole={selectedRole} setSelectedRole={setSelectedRole} onLogin={handleLogin} error={error} allowedRoles={permittedRoles} />;
  }

  return (
    <>
      {session.role === "Subscriber" ? <SimpleDashboard mobile={mobile} title="Subscriber" name={currentProfile.name} subtitle={`${currentProfile.code} | ${currentProfile.ward}`} stats={[{ title: "Paid bills", value: subscriberPaymentsSeed.length, note: "Receipts already settled." }, { title: "Total paid", value: formatCurrency(subscriberPaymentsSeed.reduce((sum, item) => sum + item.amount, 0)), note: "Amount paid through collector visits." }, { title: "Pending", value: formatCurrency(subscriberPendingsSeed.reduce((sum, item) => sum + item.amount, 0)), note: `${subscriberPendingsSeed.length} dues still open.` }]} onLogout={handleLogout} /> : null}
      {session.role === "Collector" ? <SimpleDashboard mobile={mobile} title="Collector" name={currentProfile.name} subtitle={currentProfile.route} stats={[{ title: "Pending subscribers", value: collectorPendingSubscribersSeed.length, note: "Households still to collect from." }, { title: "Pending amount", value: formatCurrency(collectorPendingSubscribersSeed.reduce((sum, item) => sum + item.amount, 0)), note: "Expected cash still outstanding." }, { title: "Payments received", value: formatCurrency(collectorReceivedPaymentsSeed.reduce((sum, item) => sum + item.amount, 0)), note: `${collectorReceivedPaymentsSeed.length} payments recorded.` }]} onLogout={handleLogout} /> : null}
      {session.role === "Admin" ? <AdminDashboard mobile={mobile} profile={currentProfile} onLogout={handleLogout} summary={adminSummary} collectors={adminCollectors} subscribers={adminSubscribersState} admins={adminAdminsState} services={adminServices} onAddEntity={handleAddEntity} onEditEntity={handleEditEntity} onToggleEntity={handleToggleEntity} onAssignCollector={handleAssignCollector} /> : null}
      <AdminEntityDialog dialog={entityDialog} collectors={adminCollectors} serviceCatalog={adminServices} onChange={handleEntityFormChange} onToggleService={handleEntityServiceToggle} onClose={() => setEntityDialog(null)} onSubmit={handleEntitySubmit} />
    </>
  );
}

