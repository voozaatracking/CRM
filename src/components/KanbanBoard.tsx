"use client";
import { useEffect, useState } from "react";
import { Lead, LEAD_STATUSES, INACTIVE_STATUSES } from "@/types";
import { updateLeadStatus } from "@/actions/leads";
import { useName } from "./NameProvider";
import KanbanColumn from "./KanbanColumn";
import LeadCard from "./LeadCard";
import { getSupabaseClient } from "@/lib/supabase-client";

export default function KanbanBoard({ initialLeads }: { initialLeads: Lead[] }) {
  const { name } = useName();
  const [leads, setLeads] = useState<Lead[]>(initialLeads);

  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel("leads-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "leads" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setLeads((prev) => [payload.new as Lead, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setLeads((prev) =>
              prev.map((l) => (l.id === (payload.new as Lead).id ? (payload.new as Lead) : l))
            );
          } else if (payload.eventType === "DELETE") {
            setLeads((prev) => prev.filter((l) => l.id !== (payload.old as any).id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  async function handleDrop(leadId: string, newStatus: string) {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus as any } : l))
    );
    await updateLeadStatus(leadId, newStatus as any, name);
  }

  const activeLeads = leads.filter(
    (l) => !(INACTIVE_STATUSES as readonly string[]).includes(l.status)
  );
  const inactiveLeads = leads.filter((l) =>
    (INACTIVE_STATUSES as readonly string[]).includes(l.status)
  );

  return (
    <div className="space-y-8">
      <div className="flex gap-4 overflow-x-auto pb-4">
        {LEAD_STATUSES.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            leads={activeLeads.filter((l) => l.status === status)}
            onDrop={handleDrop}
          />
        ))}
      </div>

      <div
        className="border-2 border-dashed border-red-300 rounded-xl p-4 bg-red-50 min-h-[100px]"
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.classList.add("border-red-500", "bg-red-100");
        }}
        onDragLeave={(e) => {
          e.currentTarget.classList.remove("border-red-500", "bg-red-100");
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.classList.remove("border-red-500", "bg-red-100");
          const leadId = e.dataTransfer.getData("leadId");
          if (leadId) handleDrop(leadId, "Kein Interesse");
        }}
      >
        <h2 className="text-lg font-semibold text-red-700 mb-3">
          Kein Interesse ({inactiveLeads.length})
        </h2>
        {inactiveLeads.length === 0 ? (
          <p className="text-red-400 text-sm">Leads hierher ziehen um sie als &quot;Kein Interesse&quot; zu markieren</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {inactiveLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
