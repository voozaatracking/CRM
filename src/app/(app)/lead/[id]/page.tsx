import { getLead } from "@/actions/leads";
import LeadDetail from "@/components/LeadDetail";

export const dynamic = "force-dynamic";

export default async function LeadPage({ params }: { params: { id: string } }) {
  const lead = await getLead(params.id);
  return <LeadDetail lead={lead} />;
}
