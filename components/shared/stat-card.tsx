export default function SharedStatCard({
  label,
  value,
  icon: Icon,
  ref,
}: {
  label: string;
  value: string | number;
  icon: React.ElementType;
  ref?: React.RefObject<HTMLParagraphElement | null>;
}) {
  return (
    <div className="bg-background rounded-md h-full p-3 md:p-5 flex items-center justify-between">
      <div className="grid gap-1">
        <p
          ref={ref}
          className="text-2xl md:text-[32px]  font-bold text-[#1B1C1E]"
        >
          {value.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground font-medium">{label}</p>
      </div>

      <Icon className="size-6 md:size-8 text-[#1B1C1E] shrink-0" />
    </div>
  );
}
