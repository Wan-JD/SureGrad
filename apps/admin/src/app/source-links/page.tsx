import { OperationsWorkspace } from "@/components/operations-workspace";
import { getAdminOperationsPage } from "@/lib/admin-operations";

export default function SourceLinksPage() {
  return <OperationsWorkspace page={getAdminOperationsPage("source-links")} />;
}
