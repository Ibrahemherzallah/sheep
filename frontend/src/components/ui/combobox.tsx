// components/Combobox.tsx
import * as React from "react";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComboboxOption {
    label: string;
    value: string;
}

interface ComboboxProps {
    value: string;
    onChange: (value: string) => void;
    options: ComboboxOption[];
    placeholder?: string;
    dir?: "rtl" | "ltr";
}

export const Combobox: React.FC<ComboboxProps> = ({
                                                      value,
                                                      onChange,
                                                      options,
                                                      placeholder = "Select an option",
                                                      dir = "ltr",
                                                  }) => {
    const [open, setOpen] = React.useState(false);

    const selectedLabel = options.find((option) => option.value === value)?.label;

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger
                asChild
                className={cn("w-full text-right", dir === "rtl" && "text-right")}
            >
                <button
                    className="w-full flex items-center justify-between rounded-md border px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                >
                    <span>{selectedLabel || placeholder}</span>
                    <ChevronDown className="ml-2 h-4 w-4 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0 z-50" align="start">
                <Command dir={dir}>
                    <CommandInput placeholder="ابحث..." />
                    <CommandEmpty>لا يوجد نتائج</CommandEmpty>
                    <CommandList>
                        <CommandGroup>
                            {options.map((option) => (
                                <CommandItem
                                    key={option.value}
                                    onSelect={() => {
                                        onChange(option.value);
                                        setOpen(false);
                                    }}
                                >
                                    {option.label}
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            value === option.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
