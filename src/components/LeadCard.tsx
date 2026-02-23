"use client";
import { useDraggable } from "@dnd-kit/core";
import { Lead } from "@/types";
import Link from "next/link";

export default function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className={`bg-white rounded-lg p-3 shadow-sm border cursor-grab hover:shadow-md transition ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <div className="flex items-center justify-between gap-2">
        <Link href={`/lead/${lead.id}`} className="block min-w-0 flex-1">
          <p className="font-medium text-sm truncate">{lead.company_name}</p>
        </Link>
        {lead.website && (
          <a
            href={lead.website}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            onPointerDown={(e) => e.stopPropagation()}
            className="text-gray-400 hover:text-blue-600 shrink-0"
            title="Link öffnen"
          >
            🔗
          </a>
        )}
      </div>
      {lead.contact_person && (
        <p className="text-xs text-gray-500">{lead.contact_person}</p>
      )}
      {lead.owner && (
        <p className="text-xs text-blue-600 mt-1">👤 {lead.owner}</p>
      )}
    </div>
  );
}
