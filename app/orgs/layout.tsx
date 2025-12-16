export default function OrgsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-muted">
      {children}
    </div>
  );
} 