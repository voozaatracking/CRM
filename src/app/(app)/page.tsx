import { getLeads } from "@/actions/leads";
import KanbanBoard from "@/components/KanbanBoard";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function KanbanPage() {
  const leads = await getLeads();
  return <KanbanBoard initialLeads={leads} />;
}
