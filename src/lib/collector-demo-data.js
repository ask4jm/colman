export const demoUsers = {
  Subscriber: {
    userId: "SUB001",
    password: "PASS123",
    profile: {
      code: "SUB001",
      name: "Ramesh Kumar",
      phone: "9876543210",
      ward: "Ward 1",
      collector: "Biren Singh",
    },
  },
  Collector: {
    userId: "COLL17",
    password: "COLL123",
    profile: {
      code: "COLL-17",
      name: "Biren Singh",
      phone: "7005011122",
      route: "Ward 1 to Ward 3",
      station: "Thoubal Main Station",
    },
  },
  Admin: {
    userId: "ADMIN1",
    password: "ADMIN123",
    profile: {
      code: "ADM-01",
      name: "Panchayat Admin",
      station: "Thoubal Main Station",
    },
  },
};

export const subscriberPayments = [
  { id: "PAY-3401", service: "Water Supply", period: "Jan 2026", amount: 90, paidOn: "12 Jan 2026", collectedBy: "Biren Singh" },
  { id: "PAY-3514", service: "Waste Collection", period: "Feb 2026", amount: 60, paidOn: "19 Feb 2026", collectedBy: "Biren Singh" },
  { id: "PAY-3672", service: "Street Light", period: "Feb 2026", amount: 75, paidOn: "19 Feb 2026", collectedBy: "Biren Singh" },
];

export const subscriberPendings = [
  { id: "DUE-401", service: "Water Supply", period: "Mar 2026", amount: 90, dueDate: "31 Mar 2026" },
  { id: "DUE-402", service: "Waste Collection", period: "Mar 2026", amount: 60, dueDate: "31 Mar 2026" },
];

export const collectorPendingSubscribers = [
  { id: "SUB014", name: "Anita Devi", ward: "Ward 2", phone: "9362014782", amount: 75, service: "Street Light" },
  { id: "SUB024", name: "Mohan Singh", ward: "Ward 3", phone: "8794412568", amount: 60, service: "Waste Collection" },
  { id: "SUB041", name: "Lata Chanu", ward: "Ward 1", phone: "7005341882", amount: 75, service: "Street Light" },
];

export const collectorReceivedPayments = [
  { id: "COL-7781", subscriber: "Ramesh Kumar", subscriberId: "SUB001", service: "Water Supply", amount: 90, paidOn: "25 Mar 2026, 10:10 AM" },
  { id: "COL-7782", subscriber: "Mohan Singh", subscriberId: "SUB024", service: "Water Supply", amount: 90, paidOn: "25 Mar 2026, 11:45 AM" },
  { id: "COL-7783", subscriber: "Ramesh Kumar", subscriberId: "SUB001", service: "Waste Collection", amount: 60, paidOn: "25 Mar 2026, 12:05 PM" },
];

export const serviceCatalog = [
  { id: "SRV001", name: "Water Supply", rate: 90, active: true },
  { id: "SRV002", name: "Waste Collection", rate: 60, active: true },
  { id: "SRV003", name: "Street Light", rate: 75, active: true },
  { id: "SRV004", name: "Trade License", rate: 120, active: true },
  { id: "SRV005", name: "Sanitation", rate: 45, active: true },
];

export const adminSummary = {
  subscribers: 86,
  collectors: 4,
  admins: 2,
  pendingSubscribers: 19,
  totalCollected: 18450,
  submittedToStation: 15220,
};

export const adminCollectors = [
  {
    id: "COLL17",
    name: "Biren Singh",
    route: "Ward 1 to Ward 3",
    cashInHand: 240,
    submitted: 1440,
    phone: "7005011122",
    address: "Thoubal Bazar Road, Ward 1",
    email: "biren.collector@panchayat.local",
    lat: "24.6384",
    lon: "93.9982",
    active: true,
  },
  {
    id: "COLL18",
    name: "Ibohal Devi",
    route: "Ward 4 to Ward 5",
    cashInHand: 360,
    submitted: 2210,
    phone: "7005011133",
    address: "Khangabok Market Lane, Ward 4",
    email: "ibohal.collector@panchayat.local",
    lat: "24.6311",
    lon: "94.0045",
    active: true,
  },
];

export const adminSubscribers = [
  {
    id: "SUB001",
    name: "Ramesh Kumar",
    status: "Partial",
    pending: 150,
    ward: "Ward 1",
    phone: "9876543210",
    address: "Near Community Hall, Ward 1",
    email: "ramesh.kumar@example.com",
    lat: "24.6398",
    lon: "93.9977",
    collectorId: "COLL17",
    collectorName: "Biren Singh",
    services: ["Water Supply", "Waste Collection"],
    active: true,
  },
  {
    id: "SUB014",
    name: "Anita Devi",
    status: "Pending",
    pending: 75,
    ward: "Ward 2",
    phone: "9362014782",
    address: "School Road, Ward 2",
    email: "anita.devi@example.com",
    lat: "24.6409",
    lon: "93.9991",
    collectorId: "COLL17",
    collectorName: "Biren Singh",
    services: ["Street Light"],
    active: true,
  },
  {
    id: "SUB024",
    name: "Mohan Singh",
    status: "Pending",
    pending: 60,
    ward: "Ward 3",
    phone: "8794412568",
    address: "Paddy Field Road, Ward 3",
    email: "mohan.singh@example.com",
    lat: "24.6356",
    lon: "94.0014",
    collectorId: "COLL18",
    collectorName: "Ibohal Devi",
    services: ["Waste Collection"],
    active: true,
  },
];

export const adminAdmins = [
  { id: "ADMIN1", name: "Panchayat Admin", role: "Super Admin", access: "Collections, users, reports", active: true },
  { id: "ADMIN2", name: "Station Officer", role: "Operations Admin", access: "Collector receipts, station handover", active: true },
];
