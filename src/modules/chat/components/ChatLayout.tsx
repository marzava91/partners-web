export function ChatLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full min-h-0 w-full grid grid-cols-[320px_1fr_360px] gap-4">
      {children}
    </div>
  );
}
