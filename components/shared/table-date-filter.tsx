import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PiFileCsv, PiMicrosoftExcelLogo } from "react-icons/pi";
import { Upload, Search, ChevronDown } from "lucide-react";
import { DateRangeFilter } from "./date-range-filter";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateRangeFilterValue } from "@/types/date";

export default function TableDateFilter({
  selected,
  setSelected,
}: {
  selected: DateRangeFilterValue | undefined;
  setSelected: (value: DateRangeFilterValue | undefined) => void;
}) {
  return (
    <div className="flex items-center gap-3 flex-wrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="h-9 gap-2 outline-none ring-0 rounded-full font-normal"
          >
            <Upload className="h-4 w-4 text-gray-400" />
            Export
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40 p-1">
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer"
            onClick={() => console.log("Export CSV")}
          >
            <PiFileCsv className="size-6! text-foreground" />{" "}
            <p className="font-medium text-sm text-foreground">CSV</p>
          </DropdownMenuItem>
          <DropdownMenuItem
            className="flex items-center gap-2 text-sm cursor-pointer"
            onClick={() => console.log("Export Excel")}
          >
            <PiMicrosoftExcelLogo className="size-6! text-foreground" />{" "}
            <p className="font-medium text-sm text-foreground">Excel</p>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <DateRangeFilter value={selected} onChange={setSelected} />

      <div className="relative w-full md:w-50">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          placeholder="Search"
          className="h-9 w-full focus-visible:border-primary focus-within:border-primary md:w-50 rounded-full pl-9 font-normal"
        />
      </div>
    </div>
  );
}
