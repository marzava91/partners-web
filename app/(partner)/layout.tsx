import type { ReactNode } from "react";

export default function PartnerLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      {/* v1: placeholder. Fase 2: Sidebar + Topbar */}
      <div className="p-6">{children}</div>
    </div>
  );
}
