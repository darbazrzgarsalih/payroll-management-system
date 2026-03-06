import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

 type Props = {
    label?: string,
    name?: string,
    value?: number | string,
    onChange?: (e: any) => void,
    required?: boolean,
    submitted?: boolean,
    placeholder?: string,
    type?: string
}

export const FormField = ({
    label,
    name,
    value,
    onChange,
    required,
    submitted,
    type = "text",
    placeholder
} : Props) => {
    const error = required && submitted && !value

    return (
        <div className="w-full flex flex-col gap-2">
            <Label>
                {label} {required && <span className="text-xs text-red-500">*</span>}
                {error && <span className="text-xs text-red-500">required</span>}
            </Label>

            <Input 
            name={name}
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className={error ? "border-red-500 focus-visible:ring-red-500 border-2" : ""}
            />
        </div>
    )
}