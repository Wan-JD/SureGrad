import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";

export default function DepartmentsPage() {
  return <OperationsWorkspace page={getAdminOperationsPage("departments")} />;
}
