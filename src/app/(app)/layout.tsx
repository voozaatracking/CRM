import { NameProvider } from "@/components/NameProvider";
import NameGate from "@/components/NameGate";
import Header from "@/components/Header";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <NameProvider>
      <NameGate>
        <Header />
        <main className="p-4 max-w-7xl mx-auto">{children}</main>
      </NameGate>
    </NameProvider>
  );
}
