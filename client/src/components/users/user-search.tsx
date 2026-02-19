import { useState, useMemo } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { User } from "@/types";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface UserSearchProps {
    users: User[];
    onSelect?: (user: User) => void;
    onSearch: (term: string) => void;
    className?: string;
}

export function UserSearch({ users, onSelect, onSearch, className }: UserSearchProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [inputValue, setInputValue] = useState("");

    // Filter users locally for autocomplete suggestions (top 5)
    // We prioritize matches at the start of the string
    const suggestions = useMemo(() => {
        if (!inputValue) return [];

        const term = inputValue.toLowerCase();
        return users
            .filter((user) =>
                user.displayName.toLowerCase().includes(term) ||
                user.email.toLowerCase().includes(term) ||
                (user.phoneNumber && user.phoneNumber.includes(term))
            )
            .slice(0, 5);
    }, [users, inputValue]);

    const handleSelect = (currentValue: string) => {
        // Find the user by ID (currentValue will be the ID)
        const selectedUser = users.find((u) => u.id === currentValue);
        if (selectedUser) {
            setValue(selectedUser.id);
            setInputValue(selectedUser.displayName); // Set input to name
            onSelect?.(selectedUser);
            onSearch(selectedUser.displayName); // Trigger search with specific name
            setOpen(false);
        }
    };

    const handleSearchChange = (term: string) => {
        setInputValue(term);
        onSearch(term); // Live search as user types
        if (term.length > 0) {
            setOpen(true);
        } else {
            setOpen(false);
        }
    };

    return (
        <div className={cn("relative w-full", className)}>
            <Command shouldFilter={false} className="rounded-lg border shadow-md overflow-visible">
                <CommandInput
                    placeholder="Search by name, email, or phone..."
                    value={inputValue}
                    onValueChange={handleSearchChange}
                />
                {open && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1">
                        <div className="rounded-lg border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                            <CommandList>
                                <CommandGroup heading="Suggestions">
                                    {suggestions.map((user) => (
                                        <CommandItem
                                            key={user.id}
                                            value={user.id}
                                            onSelect={() => handleSelect(user.id)}
                                            className="cursor-pointer"
                                        >
                                            <Search className="mr-2 h-4 w-4 opacity-50" />
                                            <div className="flex flex-col">
                                                <span className="font-medium">{user.displayName}</span>
                                                <span className="text-xs text-muted-foreground">{user.email}</span>
                                            </div>
                                        </CommandItem>
                                    ))}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </div>
                )}
            </Command>
        </div>
    );
}
