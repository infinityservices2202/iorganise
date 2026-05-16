'use client';

import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onSearch?: () => void;
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Search services, organizers...',
  onSearch,
}: SearchBarProps) {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  const handleClear = () => {
    onChange('');
  };

  return (
    <div className="relative group">
      {/* Search icon */}
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground transition-colors group-focus-within:text-[#D4A843]" />

      {/* Input */}
      <Input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className={cn(
          'h-10 w-full rounded-lg bg-[#1a1a1a] border-border pl-10 pr-10',
          'text-sm text-foreground placeholder:text-muted-foreground/60',
          'transition-all duration-200',
          'focus:border-[#8B1A2B] focus:ring-1 focus:ring-[#8B1A2B]/30',
          'hover:border-[#D4A843]/30'
        )}
      />

      {/* Clear button */}
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2',
            'flex size-5 items-center justify-center rounded-full',
            'text-muted-foreground hover:text-foreground',
            'bg-muted/50 hover:bg-muted',
            'transition-all duration-150'
          )}
          aria-label="Clear search"
        >
          <X className="size-3" />
        </button>
      )}
    </div>
  );
}
