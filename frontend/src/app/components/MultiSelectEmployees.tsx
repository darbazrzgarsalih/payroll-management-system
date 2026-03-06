import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";

type Option = {
    value: string;
    label: string;
}

type MultiSelectEmployeesProps = {
    label: string;
    options: Option[];
    selectedValues: string[];
    onChange: (values: string[]) => void;
}

export function MultiSelectEmployees({
    label,
    options,
    selectedValues,
    onChange
}: MultiSelectEmployeesProps) {
    const handleToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-2">
            <Label>{label}</Label>
            <ScrollArea className="h-48 border rounded-md p-2">
                <div className="flex flex-col gap-2">
                    {options.map(option => (
                        <div key={option.value} className="flex items-center gap-2">
                            <Checkbox
                                id={option.value}
                                checked={selectedValues.includes(option.value)}
                                onCheckedChange={() => handleToggle(option.value)}
                            />
                            <Label htmlFor={option.value} className="cursor-pointer font-normal">
                                {option.label}
                            </Label>
                        </div>
                    ))}
                </div>
            </ScrollArea>
            <div className="text-xs text-muted-foreground">
                {selectedValues.length} employees selected
            </div>
        </div>
    );
}
