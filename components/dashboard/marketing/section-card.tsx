export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-gray-200 rounded-lg p-3 md:p-5 mb-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>
      {children}
    </div>
  );
}
