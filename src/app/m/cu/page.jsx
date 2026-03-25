import RolePortal from "../../../components/role-portal";

export default function CustomerMobilePage() {
  return <RolePortal mobile initialRole="Subscriber" allowedRoles={["Subscriber"]} />;
}
