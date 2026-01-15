import { Search } from 'lucide-react'
import type { ReactNode } from 'react'
import { Input } from './input'

export interface SearchableListProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  placeholder?: string
  children: ReactNode
}

/**
 * SearchableList component with search input
 * Extracted from duplicated search patterns in AssetSelector and VaultSelector
 */
export const SearchableList = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search',
  children,
}: SearchableListProps) => {
  return (
    <>
      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-1" />
        <Input
          type="text"
          placeholder={placeholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="h-[48px] pl-10 pr-4"
        />
      </div>

      {/* List Content */}
      {children}
    </>
  )
}
