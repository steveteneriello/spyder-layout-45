import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  value?: [Date, Date] | null;
  onChange?: (range: [Date, Date] | null) => void;
  className?: string;
  placeholder?: string;
}

export function DatePickerWithRange({
  value,
  onChange,
  className,
  placeholder = "Pick a date range"
}: DatePickerWithRangeProps) {
  const [date, setDate] = React.useState<DateRange | undefined>(() => {
    if (value) {
      return { from: value[0], to: value[1] };
    }
    return undefined;
  });

  React.useEffect(() => {
    if (value) {
      setDate({ from: value[0], to: value[1] });
    } else {
      setDate(undefined);
    }
  }, [value]);

  const handleSelect = (selectedDate: DateRange | undefined) => {
    setDate(selectedDate);
    
    if (selectedDate?.from && selectedDate?.to) {
      onChange?.([selectedDate.from, selectedDate.to]);
    } else {
      onChange?.(null);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {date.from.toLocaleDateString()} -{" "}
                  {date.to.toLocaleDateString()}
                </>
              ) : (
                date.from.toLocaleDateString()
              )
            ) : (
              <span>{placeholder}</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={handleSelect}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
