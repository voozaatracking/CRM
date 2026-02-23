"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useName } from "./NameProvider";

export default function Header() {
  const { name, setName } = useName();
  const router = useRouter();
  const pathname = usePathname();

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.push("/login");
  }

  const navItems = [
    { href: "/", label: "Kanban" },
    { href: "/liste", label: "Liste" },
    { href: "/neu", label: "+ Neu" },
    { href: "/import", label: "Import" },
    { href: "/statistik", label: "Statistik" },
  ];

  return (
    <header className="bg-white border-b px-4 py-3 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <span className="font-bold text-lg">CRM Lite</span>
        <nav className="flex gap-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm hover:text-blue-600 ${
                pathname === item.href ? "text-blue-600 font-semibold" : ""
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Hallo, <button onClick={() => setName("")} className="underline">{name}</button>
        </span>
        <button onClick={logout} className="text-sm text-red-600 hover:underline">
          Logout
        </button>
      </div>
    </header>
  );
}
