import { getLeads } from "@/actions/leads";
import LeadList from "@/components/LeadList";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const fetchCache = "force-no-store";

export default async function ListPage() {
  const leads = await getLeads();
  return <LeadList initialLeads={leads} />;
}
