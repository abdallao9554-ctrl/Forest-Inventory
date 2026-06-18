import { Button } from "@/components/ui/button"
import { useLanguageStore } from '@/store/language-store'
import { translations } from '@/lib/translations'

export type HotspotCategory = 'combined' | 'permits' | 'inventory'

interface HotspotFiltersProps {
    activeCategory: HotspotCategory
    onCategoryChange: (category: HotspotCategory) => void
}

export function HotspotFilters({ activeCategory, onCategoryChange }: HotspotFiltersProps) {
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]

    const filters: { value: HotspotCategory; label: string }[] = [
        { value: 'combined', label: t.all },
        { value: 'permits', label: t.permitsOnly },
        { value: 'inventory', label: t.inventoryOnly }
    ]

    return (
        <div className="flex gap-2">
            {filters.map((filter) => (
                <Button
                    key={filter.value}
                    variant={activeCategory === filter.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onCategoryChange(filter.value)}
                    className="transition-all"
                >
                    {filter.label}
                </Button>
            ))}
        </div>
    )
}
