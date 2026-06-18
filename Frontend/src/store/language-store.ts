import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface LanguageState {
    language: 'EN' | 'SW'
    setLanguage: (lang: 'EN' | 'SW') => void
}

export const useLanguageStore = create<LanguageState>()(
    persist(
        (set) => ({
            language: 'EN',
            setLanguage: (lang) => set({ language: lang }),
        }),
        {
            name: 'language-storage',
        }
    )
)
