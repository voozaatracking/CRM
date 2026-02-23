"use client";
import { useState } from "react";
import { Lead } from "@/types";

function getKW(dateStr: string): { kw: number; year: number } {
  const date = new Date(dateStr);
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const kw = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { kw, year: d.getUTCFullYear() };
}

export default function StatistikClient({ leads }: { leads: Lead[] }) {
  const currentKW = getKW(new Date().toISOString()).kw;
  const currentYear = new Date().getFullYear();

  const [selectedKW, setSelectedKW] = useState(currentKW);
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [stunden, setStunden] = useState<number>(0);

  const availableKWs = Array.from({ length: 52 }, (_, i) => i + 1);

  const filtered = leads.filter((l) => {
    if (!l.first_contacted_at) return false;
    const { kw, year } = getKW(l.first_contacted_at);
    return kw === selectedKW && year === selectedYear;
  });

  const perMitarbeiter = filtered.reduce((acc, lead) => {
    const owner = lead.owner || "Unbekannt";
    acc[owner] = (acc[owner] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sorted = Object.entries(perMitarbeiter).sort((a, b) => b[1] - a[1]);
  const total = filtered.length;
  const proStunde = stunden > 0 ? (total / stunden).toFixed(2) : null;

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold text-gray-800">📊 Wochenstatistik</h1>

      <div className="flex gap-4 items-end flex-wrap">
        <div>
          <label className="text-sm text-gray-600 block mb-1">Kalenderwoche</label>
          <select
            value={selectedKW}
            onChange={(e) => setSelectedKW(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {availableKWs.map((kw) => (
              <option key={kw} value={kw}>KW {kw}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Jahr</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-sm text-gray-600 block mb-1">Arbeitsstunden diese Woche</label>
          <input
            type="number"
            min={0}
            value={stunden || ""}
            onChange={(e) => setStunden(Number(e.target.value))}
            className="border rounded-lg px-3 py-2 text-sm w-28"
            placeholder="z.B. 40"
          />
        </div>
      </div>

      <div className="bg-white border rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-700">KW {selectedKW} / {selectedYear}</h2>
          <span className="text-2xl font-bold text-blue-600">{total} kontaktiert</span>
        </div>

        {proStunde && (
          <div className="bg-blue-50 rounded-lg px-4 py-3 text-sm text-blue-700">
            ⚡ <strong>{proStunde}</strong> Leads pro Stunde bei {stunden}h Arbeitszeit
          </div>
        )}

        {sorted.length === 0 ? (
          <p className="text-gray-400 text-sm">Keine Leads in dieser Woche kontaktiert.</p>
        ) : (
          <div className="space-y-2">
            {sorted.map(([owner, count]) => (
              <div
                key={owner}
                className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2"
              >
                <span className="text-sm font-medium text-gray-700">{owner}</span>
                <span className="text-sm font-bold text-blue-600">{count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
