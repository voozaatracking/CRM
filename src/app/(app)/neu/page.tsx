"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createLead } from "@/actions/leads";
import { useName } from "@/components/NameProvider";

export default function NewLeadPage() {
  const { name } = useName();
  const router = useRouter();
  const [form, setForm] = useState({
    company_name: "",
    contact_person: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  });

  function change(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.company_name.trim()) return;
    await createLead(form, name);
    router.push("/");
  }

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-6">Neuer Lead</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 space-y-4">
        {[
          { key: "company_name", label: "Firma *" },
          { key: "contact_person", label: "Ansprechpartner" },
          { key: "email", label: "E-Mail" },
          { key: "phone", label: "Telefon" },
          { key: "address", label: "Adresse" },
        ].map(({ key, label }) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={(form as any)[key]}
              onChange={(e) => change(key, e.target.value)}
            />
          </div>
        ))}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notizen</label>
          <textarea
            className="w-full border rounded-lg px-3 py-2 h-24"
            value={form.notes}
            onChange={(e) => change("notes", e.target.value)}
          />
        </div>
        <button className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700">
          Lead erstellen
        </button>
      </form>
    </div>
  );
}
