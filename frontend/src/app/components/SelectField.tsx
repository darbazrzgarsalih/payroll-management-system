import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "@/components/ui/label"

type Option = {
    value: string
    label: string
}

type SelectFieldProps = {
    label: string
    name: string
    value: string
    options: Option[]
    onChange: (name: string, value: string) => void
    submitted?: boolean
}

export function SelectField({
    label,
    name,
    value,
    options,
    onChange,
    submitted,
}: SelectFieldProps) {
    const isInvalid = submitted && !value

    return (
        <div className="w-full mt-2 flex flex-col gap-1">
            <Label>{label} *</Label>

            <Select
                value={value}
                onValueChange={(val) => onChange(name, val)}
            >
                <SelectTrigger
                    className={isInvalid ? "border-red-500" : ""}
                >
                    <SelectValue placeholder={`Select ${label}`} />
                </SelectTrigger>

                <SelectContent>
                    {options.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                            {opt.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {isInvalid && (
                <span className="text-xs text-red-500">Required</span>
            )}
        </div>
    )
}