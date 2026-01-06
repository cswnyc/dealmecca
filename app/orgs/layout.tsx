export default function OrgsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0B1220]">
      {children}
    </div>
  );
} 