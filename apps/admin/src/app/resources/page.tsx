import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";

export default function ResourcesPage() {
  return <OperationsWorkspace page={getAdminOperationsPage("resources")} />;
}
