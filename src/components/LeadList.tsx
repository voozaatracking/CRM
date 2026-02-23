"use client";
import { useState, useMemo } from "react";
import Link from "next/link";
import { Lead, LEAD_STATUSES, LeadStatus } from "@/types";
import { deleteLead } from "@/actions/leads";

export default function LeadList({ initialLeads }: { initialLeads: Lead[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<LeadStatus | "">("");
  const [leads, setLeads] = useState(initialLeads);

  const filtered = useMemo(() => {
    return leads.filter((l) => {
      const matchSearch =
        !search ||
        l.company_name.toLowerCase().includes(search.toLowerCase()) ||
        (l.contact_person || "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = !statusFilter || l.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [leads, search, statusFilter]);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`"${name}" wirklich löschen?`)) return;
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Leads Liste</h1>
      <div className="flex gap-3">
        <input
          className="border rounded-lg px-3 py-2 flex-1"
          placeholder="Suche nach Firma oder Kontakt..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="border rounded-lg px-3 py-2"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as LeadStatus | "")}
        >
          <option value="">Alle Status</option>
          {LEAD_STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>
      <div className="bg-white rounded-xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left">
            <tr>
              <th className="px-4 py-3">Firma</th>
              <th className="px-4 py-3">Kontakt</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Aktualisiert</th>
              <th className="px-4 py-3 w-16"></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((lead) => (
              <tr key={lead.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/lead/${lead.id}`} className="text-blue-600 hover:underline font-medium">
                    {lead.company_name}
                  </Link>
                </td>
                <td className="px-4 py-3">{lead.contact_person || "–"}</td>
                <td className="px-4 py-3">{lead.status}</td>
                <td className="px-4 py-3">{lead.owner || "–"}</td>
                <td className="px-4 py-3">{new Date(lead.updated_at).toLocaleDateString("de-DE")}</td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => handleDelete(lead.id, lead.company_name)}
                    className="text-red-500 hover:text-red-700 text-xs"
                    title="Löschen"
                  >
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Keine Leads gefunden</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
