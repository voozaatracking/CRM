"use client";
import { useState } from "react";
import { useName } from "./NameProvider";

export default function NameGate({ children }: { children: React.ReactNode }) {
  const { name, setName } = useName();
  const [input, setInput] = useState("");

  if (!name) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white p-8 rounded-xl shadow-md w-full max-w-sm space-y-4">
          <h2 className="text-xl font-bold text-center">Wie heisst du?</h2>
          <input
            className="w-full border rounded-lg px-3 py-2"
            placeholder="Dein Name"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button
            className="w-full bg-blue-600 text-white rounded-lg py-2 hover:bg-blue-700"
            onClick={() => input.trim() && setName(input.trim())}
          >
            Weiter
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
