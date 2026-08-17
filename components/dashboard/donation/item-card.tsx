import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
export function ItemCard({
  title,
  category,
  image,
}: {
  title: string;
  category: string;
  image?: string;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 shrink-0">
        <Avatar>
          <AvatarImage src={image} alt={title} />
          <AvatarFallback className="bg-gray-200">
            {title
              ?.split(" ")
              .map((n) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-gray-900 truncate">{title}</p>
        <p className="text-xs text-gray-400">{category}</p>
      </div>
      <span className="text-xs bg-[#2D7A4F] text-white px-2 py-0.5 rounded-full font-medium shrink-0">
        Donate
      </span>
    </div>
  );
}
