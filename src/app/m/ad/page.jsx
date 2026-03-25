import RolePortal from "../../../components/role-portal";

export default function AdminMobilePage() {
  return <RolePortal mobile initialRole="Admin" allowedRoles={["Admin"]} />;
}
