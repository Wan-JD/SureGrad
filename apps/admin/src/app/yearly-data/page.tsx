import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";

export default function YearlyDataPage() {
  return <OperationsWorkspace page={getAdminOperationsPage("yearly-data")} />;
}
