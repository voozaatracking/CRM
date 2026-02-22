import { getLeads } from "@/actions/leads";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";

export default async function KanbanPage() {
  const leads = await getLeads();
  return <KanbanBoard initialLeads={leads} />;
}
