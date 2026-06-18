import { useState, useMemo } from 'react'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { type PermitLocation } from '../map/permit-marker'
import { useLanguageStore } from '@/store/language-store'
import { translations } from '@/lib/translations'

interface SearchBarProps {
    permits: PermitLocation[]
    onSelectPermit: (permit: PermitLocation) => void
}

export function SearchBar({ permits, onSelectPermit }: SearchBarProps) {
    const language = useLanguageStore((state) => state.language)
    const t = translations[language]
    const [open, setOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState('')

    // Filter permits based on search query
    const filteredPermits = useMemo(() => {
        if (!searchQuery) return []

        const query = searchQuery.toLowerCase()
        return permits.filter(permit =>
            permit.permitNumber.toLowerCase().includes(query) ||
            permit.applicant.toLowerCase().includes(query)
        ).slice(0, 5) // Limit to 5 results
    }, [permits, searchQuery])

    const handleSelect = (permit: PermitLocation) => {
        setOpen(false)
        setSearchQuery('')
        onSelectPermit(permit)
    }

    return (
        <div className="relative w-full max-w-sm">
            <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    placeholder={t.searchPermits}
                    value={searchQuery}
                    onChange={(e) => {
                        setSearchQuery(e.target.value)
                        setOpen(e.target.value.length > 0)
                    }}
                    onFocus={() => searchQuery.length > 0 && setOpen(true)}
                    className="pl-10"
                />
            </div>

            {open && filteredPermits.length > 0 && (
                <div className="absolute z-50 mt-2 w-full rounded-md border bg-popover shadow-md">
                    <div className="max-h-60 overflow-auto p-2">
                        {filteredPermits.map((permit) => (
                            <div
                                key={permit.id}
                                className="flex cursor-pointer flex-col gap-1 rounded-sm px-3 py-2 hover:bg-accent"
                                onClick={() => handleSelect(permit)}
                            >
                                <div className="font-medium">{permit.permitNumber}</div>
                                <div className="text-sm text-muted-foreground">{permit.applicant}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    )
}
