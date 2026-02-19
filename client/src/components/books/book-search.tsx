import { useState, useMemo } from "react";
import { Check, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Book, Author } from "@shared/schema";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";

interface BookSearchProps {
    books: Book[];
    authors: Author[];
    onSelect?: (book: Book) => void;
    onSearch: (term: string) => void;
    className?: string;
}

export function BookSearch({ books, authors, onSelect, onSearch, className }: BookSearchProps) {
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState("");
    const [inputValue, setInputValue] = useState("");

    const suggestions = useMemo(() => {
        if (!inputValue) return [];

        const term = inputValue.toLowerCase();
        return books
            .filter((book) => {
                const titleMatch = book.title.toLowerCase().includes(term);
                const isbnMatch = book.ISBN ? String(book.ISBN).toLowerCase().includes(term) : false;

                // Find author name
                const author = authors.find(a => a.id === book.author_id);
                const authorMatch = author ? author.name.toLowerCase().includes(term) : false;

                return titleMatch || isbnMatch || authorMatch;
            })
            .slice(0, 5);
    }, [books, authors, inputValue]);

    const handleSelect = (bookId: string) => {
        const selectedBook = books.find((b) => b.id === bookId);
        if (selectedBook) {
            setValue(selectedBook.id);
            setInputValue(selectedBook.title);
            onSelect?.(selectedBook);
            onSearch(selectedBook.title);
            setOpen(false);
        }
    };

    const handleSearchChange = (term: string) => {
        setInputValue(term);
        onSearch(term);
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
                    placeholder="ابحث بالعنوان، ISBN، أو اسم المؤلف..."
                    value={inputValue}
                    onValueChange={handleSearchChange}
                    className="text-right"
                />
                {open && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 w-full z-50 mt-1">
                        <div className="rounded-lg border bg-popover text-popover-foreground shadow-md outline-none animate-in fade-in-0 zoom-in-95">
                            <CommandList>
                                <CommandGroup heading="اقتراحات" className="text-right">
                                    {suggestions.map((book) => {
                                        const author = authors.find(a => a.id === book.author_id);
                                        return (
                                            <CommandItem
                                                key={book.id}
                                                value={book.id}
                                                onSelect={() => handleSelect(book.id)}
                                                className="cursor-pointer flex flex-row-reverse justify-between"
                                            >
                                                <div className="flex flex-row-reverse items-center gap-2">
                                                    <Search className="h-4 w-4 opacity-50 ml-2" />
                                                    <div className="flex flex-col items-end">
                                                        <span className="font-medium">{book.title}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {author ? author.name : "مؤلف غير معروف"} • {new Date(book.publication_date).getFullYear()}
                                                        </span>
                                                    </div>
                                                </div>
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>
                            </CommandList>
                        </div>
                    </div>
                )}
            </Command>
        </div>
    );
}
