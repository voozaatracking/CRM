import { getLeads } from "@/actions/leads";
import StatistikClient from "@/components/StatistikClient";

export default async function StatistikPage() {
  const leads = await getLeads();
  return <StatistikClient leads={leads} />;
}
