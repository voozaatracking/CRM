"use client";
import { useDroppable } from "@dnd-kit/core";
import { Lead, LeadStatus } from "@/types";
import LeadCard from "./LeadCard";

export default function KanbanColumn({
  status,
  leads,
}: {
  status: LeadStatus;
  leads: Lead[];
}) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 bg-gray-100 rounded-xl p-3 space-y-2 transition ${
        isOver ? "ring-2 ring-blue-400" : ""
      }`}
    >
      <h3 className="font-semibold text-sm text-gray-700 mb-2">
        {status} <span className="text-gray-400">({leads.length})</span>
      </h3>
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}
