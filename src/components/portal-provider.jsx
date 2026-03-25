"use client";

import { createContext, useContext, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  adminAdmins as adminAdminsSeed,
  adminCollectors as adminCollectorsSeed,
  adminSubscribers as adminSubscribersSeed,
  collectorReceivedPayments as collectorReceivedPaymentsSeed,
  demoUsers,
  serviceCatalog as serviceCatalogSeed,
  subscriberPayments as subscriberPaymentsSeed,
  subscriberPendings as subscriberPendingsSeed,
} from "../lib/collector-demo-data";

const PortalContext = createContext(null);

function createEntityDraft(type, collectors, current = null) {
  if (type === "subscriber") {
    return {
      name: current?.name ?? "",
      ward: current?.ward ?? "",
      phone: current?.phone ?? "",
      address: current?.address ?? "",
      email: current?.email ?? "",
      lat: current?.lat ?? "",
      lon: current?.lon ?? "",
      status: current?.status ?? "Pending",
      pending: String(current?.pending ?? 0),
      collectorId:
        current?.collectorId ??
        collectors.find((item) => item.active !== false)?.id ??
        "",
      services: current?.services ?? [],
    };
  }

  if (type === "collector") {
    return {
      name: current?.name ?? "",
      route: current?.route ?? "",
      phone: current?.phone ?? "",
      address: current?.address ?? "",
      email: current?.email ?? "",
      lat: current?.lat ?? "",
      lon: current?.lon ?? "",
    };
  }

  if (type === "service") {
    return {
      name: current?.name ?? "",
      rate: String(current?.rate ?? 0),
    };
  }

  return {
    name: current?.name ?? "",
    role: current?.role ?? "Operations Admin",
    access: current?.access ?? "User management",
  };
}

export function PortalProvider({ children }) {
  const [session, setSession] = useState(null);
  const [adminCollectors, setAdminCollectors] = useState(adminCollectorsSeed);
  const [adminSubscribers, setAdminSubscribers] = useState(adminSubscribersSeed);
  const [adminAdmins, setAdminAdmins] = useState(adminAdminsSeed);
  const [adminServices, setAdminServices] = useState(serviceCatalogSeed);
  const [subscriberPayments] = useState(subscriberPaymentsSeed);
  const [subscriberPendings] = useState(subscriberPendingsSeed);
  const [collectorReceivedPayments] = useState(collectorReceivedPaymentsSeed);

  const summary = useMemo(
    () => ({
      subscribers: adminSubscribers.length,
      collectors: adminCollectors.filter((item) => item.active !== false).length,
      admins: adminAdmins.filter((item) => item.active !== false).length,
      pendingSubscribers: adminSubscribers.filter(
        (item) => item.pending > 0 && item.active !== false,
      ).length,
      totalCollected: adminCollectors.reduce(
        (sum, item) => sum + (item.cashInHand ?? 0) + (item.submitted ?? 0),
        0,
      ),
      submittedToStation: adminCollectors.reduce(
        (sum, item) => sum + (item.submitted ?? 0),
        0,
      ),
    }),
    [adminAdmins, adminCollectors, adminSubscribers],
  );

  const currentProfile = useMemo(() => {
    if (!session) {
      return null;
    }

    return demoUsers[session.role]?.profile ?? null;
  }, [session]);

  function login(role, userId, password) {
    const account = demoUsers[role];

    if (!account || account.userId !== userId || account.password !== password) {
      return {
        ok: false,
        error: "Invalid credentials for the selected role.",
      };
    }

    setSession({ role });
    toast.success(`${role} session started`);

    return {
      ok: true,
      role,
    };
  }

  function logout() {
    setSession(null);
    toast.success("Signed out");
  }

  function saveEntity({ mode, type, entityId, values }) {
    if (type === "subscriber") {
      const collector = adminCollectors.find((item) => item.id === values.collectorId);
      const record = {
        ...values,
        pending: Number(values.pending || 0),
        collectorName: collector?.name ?? "Unassigned",
      };
      const nextSubscribers =
        mode === "create"
          ? [
              {
                id: `SUB${Date.now().toString().slice(-3)}`,
                ...record,
                active: true,
              },
              ...adminSubscribers,
            ]
          : adminSubscribers.map((item) =>
              item.id === entityId ? { ...item, ...record } : item,
            );

      setAdminSubscribers(nextSubscribers);
      toast.success(mode === "create" ? "Subscriber added" : "Subscriber updated");
      return;
    }

    if (type === "collector") {
      const nextCollectors =
        mode === "create"
          ? [
              {
                id: `COLL${Date.now().toString().slice(-2)}`,
                ...values,
                cashInHand: 0,
                submitted: 0,
                active: true,
              },
              ...adminCollectors,
            ]
          : adminCollectors.map((item) =>
              item.id === entityId ? { ...item, ...values } : item,
            );

      setAdminCollectors(nextCollectors);
      toast.success(mode === "create" ? "Collector added" : "Collector updated");
      return;
    }

    if (type === "service") {
      const nextServices =
        mode === "create"
          ? [
              {
                id: `SRV${Date.now().toString().slice(-3)}`,
                name: values.name.trim(),
                rate: Number(values.rate || 0),
                active: true,
              },
              ...adminServices,
            ]
          : adminServices.map((item) =>
              item.id === entityId
                ? {
                    ...item,
                    name: values.name.trim(),
                    rate: Number(values.rate || 0),
                  }
                : item,
            );

      setAdminServices(nextServices);
      toast.success(mode === "create" ? "Service added" : "Service updated");
      return;
    }

    const nextAdmins =
      mode === "create"
        ? [
            {
              id: `ADMIN${Date.now().toString().slice(-1)}`,
              name: values.name.trim(),
              role: values.role.trim(),
              access: values.access.trim(),
              active: true,
            },
            ...adminAdmins,
          ]
        : adminAdmins.map((item) =>
            item.id === entityId
              ? {
                  ...item,
                  name: values.name.trim(),
                  role: values.role.trim(),
                  access: values.access.trim(),
                }
              : item,
          );

    setAdminAdmins(nextAdmins);
    toast.success(mode === "create" ? "Admin added" : "Admin updated");
  }

  function toggleEntity(type, id) {
    if (type === "subscriber") {
      setAdminSubscribers((current) =>
        current.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      );
      return;
    }

    if (type === "collector") {
      setAdminCollectors((current) =>
        current.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      );
      return;
    }

    if (type === "service") {
      const target = adminServices.find((item) => item.id === id);

      setAdminServices((current) =>
        current.map((item) =>
          item.id === id ? { ...item, active: !item.active } : item,
        ),
      );

      if (target?.active) {
        setAdminSubscribers((current) =>
          current.map((item) => ({
            ...item,
            services: (item.services ?? []).filter(
              (service) => service !== target.name,
            ),
          })),
        );
      }
      return;
    }

    setAdminAdmins((current) =>
      current.map((item) =>
        item.id === id ? { ...item, active: !item.active } : item,
      ),
    );
  }

  function assignCollector(subscriberId) {
    const activeCollectors = adminCollectors.filter((item) => item.active !== false);

    if (!activeCollectors.length) {
      return;
    }

    setAdminSubscribers((current) =>
      current.map((item) => {
        if (item.id !== subscriberId) {
          return item;
        }

        const currentIndex = activeCollectors.findIndex(
          (collector) => collector.id === item.collectorId,
        );
        const nextCollector =
          activeCollectors[(currentIndex + 1) % activeCollectors.length];

        return {
          ...item,
          collectorId: nextCollector.id,
          collectorName: nextCollector.name,
        };
      }),
    );
    toast.success("Collector reassigned");
  }

  const subscriberRecord = useMemo(() => {
    const code = demoUsers.Subscriber.profile.code;
    return adminSubscribers.find((item) => item.id === code) ?? null;
  }, [adminSubscribers]);

  const collectorRecord = useMemo(() => {
    return (
      adminCollectors.find((item) => item.id === demoUsers.Collector.userId) ?? null
    );
  }, [adminCollectors]);

  const collectorPendingSubscribers = useMemo(() => {
    const collectorId = collectorRecord?.id;

    if (!collectorId) {
      return [];
    }

    return adminSubscribers
      .filter(
        (item) =>
          item.collectorId === collectorId &&
          item.pending > 0 &&
          item.active !== false,
      )
      .map((item) => ({
        id: item.id,
        name: item.name,
        ward: item.ward,
        phone: item.phone,
        amount: item.pending,
        service: (item.services ?? []).join(", "),
      }));
  }, [adminSubscribers, collectorRecord]);

  const value = {
    session,
    currentProfile,
    demoUsers,
    summary,
    adminCollectors,
    adminSubscribers,
    adminAdmins,
    adminServices,
    subscriberPayments,
    subscriberPendings,
    subscriberRecord,
    collectorRecord,
    collectorPendingSubscribers,
    collectorReceivedPayments,
    createEntityDraft: (type, current = null) =>
      createEntityDraft(type, adminCollectors, current),
    login,
    logout,
    saveEntity,
    toggleEntity,
    assignCollector,
  };

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal() {
  const context = useContext(PortalContext);

  if (!context) {
    throw new Error("usePortal must be used inside PortalProvider");
  }

  return context;
}
