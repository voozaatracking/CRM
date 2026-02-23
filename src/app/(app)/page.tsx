import { getLeads } from "@/actions/leads";
import KanbanBoard from "@/components/KanbanBoard";

export default async function HomePage() {
  const leads = await getLeads();
  const activeLeads = leads.filter((l) => l.status !== "Kein Interesse");
  const rejectedLeads = leads.filter((l) => l.status === "Kein Interesse");

  return (
    <div>
      <KanbanBoard initialLeads={activeLeads} />

      {rejectedLeads.length > 0 && (
        <div className="mt-8 px-4">
          <h2 className="text-xl font-bold mb-4 text-red-600">Kein Interesse</h2>
          <div className="bg-red-50 rounded-lg border border-red-200 divide-y divide-red-200">
            {rejectedLeads.map((lead) => (
              <a
                key={lead.id}
                href={`/lead/${lead.id}`}
                className="flex items-center justify-between p-3 hover:bg-red-100 transition"
              >
                <div>
                  <span className="font-medium">{lead.company_name}</span>
                  {lead.contact_person && (
                    <span className="text-sm text-gray-500 ml-2">({lead.contact_person})</span>
                  )}
                </div>
                <div className="text-sm text-gray-400">
                  {lead.owner || "Kein Mitarbeiter"}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
