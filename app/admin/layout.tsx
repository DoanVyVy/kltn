export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
