export const TextItem = (
    value?: string | null,
    fallback = "—"
) => value?.trim() || fallback

export const NumberItem = (
    value?: number | null,
    fallback = 0
) => value ?? fallback

export const DateItem = (
    value?: string | Date | null,
    fallback = "—"
) => {
    if (!value) return fallback
    const d = new Date(value)
    return isNaN(d.getTime()) ? fallback : d.toLocaleDateString()
}