import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PersonDetails } from "@/types/donation";

export function PersonCard({ person }: { person: PersonDetails }) {
  return (
    <div className="mb-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        {" "}
        {person.role} Details
      </h3>
      <div className="flex items-center gap-3">
        <Avatar className="w-11 h-11">
          <AvatarImage src="/avatars/avatar-1.png" alt={person.name} />
          <AvatarFallback>{person.name.slice(0, 2)}</AvatarFallback>
        </Avatar>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{person.name}</p>
            <span className="text-xs text-primary bg-primary/20 px-1.5 py-0.5 rounded-full font-medium">
              Verified
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{person.email}</p>
          <p className="text-xs text-muted-foreground">Individual</p>
        </div>
      </div>
      <p className="text-xs md:text-sm font-medium text-muted-foreground mt-2 ">
        User ID: <span className="text-foreground ">{person.userId}</span>
      </p>
    </div>
  );
}
