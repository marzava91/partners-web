export function PosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-0 w-full grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-4">
      {children}
    </div>
  );
}
