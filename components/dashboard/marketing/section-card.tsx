export default function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    // The panel is the grey one here and the fields inside it are white — the
    // reverse of this form's usual footing, where grey fields sit on a white
    // dialog. `main` is white on this page, so the card supplies the grey and
    // needs no outline to separate itself from it.
    <div className="rounded-lg bg-background p-4 mb-4">
      <p className="text-sm font-semibold text-gray-900 mb-4">{title}</p>
      {children}
    </div>
  );
}
