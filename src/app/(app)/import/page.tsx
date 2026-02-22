"use client";
import { useState, useCallback } from "react";
import Papa from "papaparse";
import { importLeads } from "@/actions/leads";
import { useName } from "@/components/NameProvider";

const DB_FIELDS = [
  { key: "company_name", label: "Firma" },
  { key: "contact_person", label: "Ansprechpartner" },
  { key: "email", label: "E-Mail" },
  { key: "phone", label: "Telefon" },
  { key: "address", label: "Adresse" },
  { key: "notes", label: "Notizen" },
];

export default function ImportPage() {
  const { name } = useName();
  const [csvHeaders, setCsvHeaders] = useState<string[]>([]);
  const [csvRows, setCsvRows] = useState<Record<string, string>[]>([]);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields || [];
        setCsvHeaders(headers);
        setCsvRows(res.data as Record<string, string>[]);
        // Auto-map by matching names
        const autoMap: Record<string, string> = {};
        for (const f of DB_FIELDS) {
          const match = headers.find(
            (h) => h.toLowerCase().replace(/[^a-z]/g, "") === f.key.replace(/_/g, "")
          );
          if (match) autoMap[f.key] = match;
        }
        setMapping(autoMap);
        setResult(null);
      },
    });
  }, []);

  async function handleImport() {
    setImporting(true);
    const mapped = csvRows.map((row) => {
      const lead: Record<string, string> = {};
      for (const f of DB_FIELDS) {
        const csvCol = mapping[f.key];
        if (csvCol && row[csvCol]) lead[f.key] = row[csvCol];
      }
      return lead;
    });
    const res = await importLeads(mapped, name);
    setResult(res);
    setImporting(false);
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">CSV Import</h1>

      <div className="bg-white rounded-xl shadow p-6 space-y-4">
        <input type="file" accept=".csv" onChange={handleFile} />

        {csvHeaders.length > 0 && (
          <>
            <p className="text-sm text-gray-600">{csvRows.length} Zeilen erkannt. Ordne die Spalten zu:</p>
            <div className="space-y-2">
              {DB_FIELDS.map(({ key, label }) => (
                <div key={key} className="flex items-center gap-3">
                  <span className="w-36 text-sm font-medium">{label}</span>
                  <select
                    className="border rounded-lg px-2 py-1 flex-1"
                    value={mapping[key] || ""}
                    onChange={(e) => setMapping((m) => ({ ...m, [key]: e.target.value }))}
                  >
                    <option value="">– nicht zuordnen –</option>
                    {csvHeaders.map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
            <button
              onClick={handleImport}
              disabled={importing || !mapping.company_name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {importing ? "Importiere..." : `${csvRows.length} Leads importieren`}
            </button>
          </>
        )}

        {result && (
          <div className="p-4 rounded-lg bg-gray-50 text-sm space-y-1">
            <p className="text-green-700">✅ {result.success} erfolgreich importiert</p>
            {result.failed > 0 && <p className="text-red-600">❌ {result.failed} fehlgeschlagen</p>}
            {result.errors.map((err, i) => (
              <p key={i} className="text-red-500 text-xs">{err}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
