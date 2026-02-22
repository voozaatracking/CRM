"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

const NameContext = createContext<{
  name: string;
  setName: (n: string) => void;
}>({ name: "", setName: () => {} });

export const useName = () => useContext(NameContext);

export function NameProvider({ children }: { children: ReactNode }) {
  const [name, setNameState] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("crm_user_name");
    if (stored) setNameState(stored);
  }, []);

  function setName(n: string) {
    localStorage.setItem("crm_user_name", n);
    setNameState(n);
  }

  return (
    <NameContext.Provider value={{ name, setName }}>
      {children}
    </NameContext.Provider>
  );
}
