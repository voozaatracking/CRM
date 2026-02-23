"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lead, LEAD_STATUSES, INACTIVE_STATUSES, MITARBEITER } from "@/types";
import { updateLead, markContacted, setOwner, deleteLead } from "@/actions/leads";
import { useName } from "./NameProvider";

export default function LeadDetail({ lead }: { lead: Lead }) {
  const { name } = useName();
  const router = useRouter();
  const [form, setForm] = useState(lead);
  const [saving, setSaving] = useState(false);

  function change(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    await updateLead(lead.id, {
      company_name: form.company_name,
      contact_person: form.contact_person,
      email: form.email,
      phone: form.phone,
      address: form.address,
      status: form.status,
      notes: form.notes,
    }, name);
    setSaving(false);
    router.refresh();
  }

  async function handleMarkContacted() {
    await markContacted(lead.id, name);
    router.refresh();
  }

  async function handleOwnerChange(newOwner: string) {
    change("owner", newOwner);
    await setOwner(lead.id, newOwner, name);
    router.refresh();
  }

  async function handleDelete() {
    if (confirm("Lead wirklich loeschen?")) {
      await deleteLead(lead.id);
      router.push("/");
    }
  }

  const fields = [
    { key: "company_name", label: "Firma", required: true },
    { key: "contact_person", label: "Ansprechpartner" },
    { key: "email", label: "E-Mail" },
    { key: "phone", label: "Telefon" },
    { key: "address", label: "Adresse" },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{lead.company_name}</h1>
        <div className="flex gap-2">
          <button
            onClick={handleMarkContacted}
            className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            Jetzt kontaktiert
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        {fields.map(({ key, label, required }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={(form as any)[key] || ""}
              onChange={(e) => change(key, e.target.value)}
            />
          </div>
        ))}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.status}
            onChange={(e) => change("status", e.target.value)}
          >
            {LEAD_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
            {INACTIVE_STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Mitarbeiter</label>
          <select
            className="w-full border rounded-lg px-3 py-2"
            value={form.owner || ""}
            onChange={(e) => handleOwnerChange(e.target.value)}
          >
            <option value="">-- Mitarbeiter waehlen --</option>
            {MITARBEITER.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 h-24"
            value={form.notes || ""}
            onChange={(e) => change("notes", e.target.value)}
          />
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p>Zuletzt kontaktiert: {lead.last_contacted_at ? new Date(lead.last_contacted_at).toLocaleString("de-DE") : "–"}</p>
          <p>Zuletzt bearbeitet von: {lead.updated_by || "–"}</p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? "Speichern..." : "Speichern"}
          </button>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
          >
            Loeschen
          </button>
          <button onClick={() => router.back()} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
            Zurueck
          </button>
        </div>
      </div>
    </div>
  );
}
