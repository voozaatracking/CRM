import { getLeads } from "@/actions/leads";
import LeadList from "@/components/LeadList";

export const dynamic = "force-dynamic";

export default async function ListPage() {
  const leads = await getLeads();
  return <LeadList initialLeads={leads} />;
}
