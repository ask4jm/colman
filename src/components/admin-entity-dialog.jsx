import dynamic from "next/dynamic";

const SubscriberLocationPicker = dynamic(() => import("./subscriber-location-picker"), {
  ssr: false,
  loading: () => <div className="h-[280px] rounded-[24px] border border-[color:var(--line)] bg-[color:var(--surface-muted)]" />,
});

const titles = {
  subscriber: { create: "Add Subscriber", edit: "Edit Subscriber" },
  collector: { create: "Add Collector", edit: "Edit Collector" },
  admin: { create: "Add Admin", edit: "Edit Admin" },
  service: { create: "Add Service", edit: "Edit Service" },
};

const subscriberStatuses = ["Pending", "Partial", "Paid"];

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[color:var(--foreground-muted)]">{label}</span>
      {children}
    </label>
  );
}

function Input(props) {
  return <input {...props} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm outline-none" />;
}

function Select(props) {
  return <select {...props} className="w-full rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm outline-none" />;
}

export default function AdminEntityDialog({ dialog, collectors, serviceCatalog, onChange, onToggleService, onClose, onSubmit }) {
  if (!dialog) {
    return null;
  }

  const { mode, type, values } = dialog;
  const activeCollectors = collectors.filter((collector) => collector.active !== false);
  const serviceOptions = serviceCatalog.filter((service) => service.active !== false);
  const title = titles[type][mode];
  const description =
    type === "subscriber"
      ? "Maintain subscriber details, contact information, due status, assigned collector, and map location."
      : type === "collector"
        ? "Maintain collector profile, service route, and contact details."
        : type === "service"
          ? "Maintain services offered by the panchayat and the standard collection rate for each service."
          : "Maintain admin profile and access responsibility.";

  function handleMapPick(lat, lon) {
    onChange("lat", lat.toFixed(6));
    onChange("lon", lon.toFixed(6));
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/45 px-4 py-4 sm:flex sm:items-start sm:justify-center">
      <div className="my-4 flex w-full max-w-3xl flex-col rounded-[30px] border border-[color:var(--line)] bg-[color:var(--surface-elevated)] p-5 panel-shadow sm:max-h-[calc(100vh-2rem)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.72rem] font-semibold uppercase tracking-[0.24em] text-[color:var(--brand-deep)]">{mode === "create" ? "Create Record" : "Update Record"}</p>
            <h3 className="mt-3 text-2xl font-semibold">{title}</h3>
            <p className="mt-2 text-sm leading-6 text-[color:var(--foreground-muted)]">{description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground-muted)]">Close</button>
        </div>

        <form onSubmit={onSubmit} className="mt-5 space-y-5 overflow-y-auto pr-1 sm:min-h-0">
          {type === "subscriber" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Subscriber name"><Input value={values.name} onChange={(event) => onChange("name", event.target.value)} required /></Field>
              <Field label="Ward"><Input value={values.ward} onChange={(event) => onChange("ward", event.target.value)} required /></Field>
              <Field label="Contact number"><Input value={values.phone} onChange={(event) => onChange("phone", event.target.value)} required /></Field>
              <Field label="Email"><Input type="email" value={values.email} onChange={(event) => onChange("email", event.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Address"><Input value={values.address} onChange={(event) => onChange("address", event.target.value)} required /></Field></div>
              <Field label="Latitude"><Input value={values.lat} onChange={(event) => onChange("lat", event.target.value)} /></Field>
              <Field label="Longitude"><Input value={values.lon} onChange={(event) => onChange("lon", event.target.value)} /></Field>
              <div className="md:col-span-2">
                <Field label="Subscriber location map">
                  <SubscriberLocationPicker lat={values.lat} lon={values.lon} onPick={handleMapPick} />
                  <p className="mt-2 text-xs text-[color:var(--foreground-muted)]">Click on the satellite map to set subscriber latitude and longitude.</p>
                </Field>
              </div>
              <Field label="Status">
                <Select value={values.status} onChange={(event) => onChange("status", event.target.value)}>
                  {subscriberStatuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </Select>
              </Field>
              <Field label="Pending amount"><Input type="number" min="0" value={values.pending} onChange={(event) => onChange("pending", event.target.value)} required /></Field>
              <div className="md:col-span-2">
                <Field label="Assigned collector">
                  <Select value={values.collectorId} onChange={(event) => onChange("collectorId", event.target.value)}>
                    <option value="">Unassigned</option>
                    {activeCollectors.map((collector) => <option key={collector.id} value={collector.id}>{collector.name} ({collector.route})</option>)}
                  </Select>
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Services">
                  <div className="flex flex-wrap gap-2 rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] p-3">
                    {serviceOptions.map((service) => {
                      const selected = values.services.includes(service.name);
                      return (
                        <button key={service.id} type="button" onClick={() => onToggleService(service.name)} className={`rounded-full px-3 py-2 text-sm font-semibold ${selected ? "bg-[color:var(--brand)] text-white" : "bg-[color:var(--surface-elevated)] text-[color:var(--foreground-muted)]"}`}>
                          {selected ? "Remove" : "Add"} {service.name} ({service.rate})
                        </button>
                      );
                    })}
                  </div>
                </Field>
              </div>
            </div>
          ) : null}

          {type === "collector" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Collector name"><Input value={values.name} onChange={(event) => onChange("name", event.target.value)} required /></Field>
              <Field label="Route"><Input value={values.route} onChange={(event) => onChange("route", event.target.value)} required /></Field>
              <Field label="Contact number"><Input value={values.phone} onChange={(event) => onChange("phone", event.target.value)} required /></Field>
              <Field label="Email"><Input type="email" value={values.email} onChange={(event) => onChange("email", event.target.value)} /></Field>
              <div className="md:col-span-2"><Field label="Address"><Input value={values.address} onChange={(event) => onChange("address", event.target.value)} required /></Field></div>
              <Field label="Latitude"><Input value={values.lat} onChange={(event) => onChange("lat", event.target.value)} /></Field>
              <Field label="Longitude"><Input value={values.lon} onChange={(event) => onChange("lon", event.target.value)} /></Field>
            </div>
          ) : null}

          {type === "admin" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Admin name"><Input value={values.name} onChange={(event) => onChange("name", event.target.value)} required /></Field>
              <Field label="Role"><Input value={values.role} onChange={(event) => onChange("role", event.target.value)} required /></Field>
              <div className="md:col-span-2"><Field label="Access"><Input value={values.access} onChange={(event) => onChange("access", event.target.value)} required /></Field></div>
            </div>
          ) : null}

          {type === "service" ? (
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Service name"><Input value={values.name} onChange={(event) => onChange("name", event.target.value)} required /></Field>
              <Field label="Rate"><Input type="number" min="0" value={values.rate} onChange={(event) => onChange("rate", event.target.value)} required /></Field>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={onClose} className="rounded-2xl border border-[color:var(--line)] bg-[color:var(--surface-muted)] px-4 py-3 text-sm font-semibold text-[color:var(--foreground-muted)]">Cancel</button>
            <button type="submit" className="rounded-2xl bg-[color:var(--brand)] px-4 py-3 text-sm font-semibold text-white">{mode === "create" ? "Save New Record" : "Save Changes"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
