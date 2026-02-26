import { Check, ChevronsUpDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";

export type ComboboxOptions = {
    value: string;
    label: string;
}

interface ReusableComboboxProps {
    data: ComboboxOptions[];
    value?: string | null;
    onChange: (value: string | null) => void;
    placeholder?: string;
    searchPlaceholder?: string;
    notFoundText?: string;
    disabled?: boolean;
    isLoading?: boolean;
    onSearchQueryChange?: (query: string) => void;
}

export function ReusableCombobox({
    data=[],
    value,
    onChange,
    placeholder="Pilih item",
    searchPlaceholder="cari",
    notFoundText="Tidak ditemukan",
    disabled=false,
    isLoading=false,
    onSearchQueryChange
}: ReusableComboboxProps){
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const wrapperRef = useRef<HTMLDivElement>(null);

    // cari label dari item yang di pilih
    const selectedLabel = useMemo(() => 
        data.find((item) => item.value === value)?.label
    ,[data, value]);

    // filter data berdasarkan pencarian
    const filteredData = useMemo(() => {
        if(onSearchQueryChange){
            return data;
        }

        if(!query) return data;
        return data.filter((item) => item.label.toLowerCase().includes(query.toLowerCase()))
    }, [data, query, onSearchQueryChange]);

    // tutup dropdown jika keluar
    // useEffect(() => {
    //     function handlerClikOutside(event: MouseEvent){
    //         if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)){
    //             setOpen(false);
    //         }
    //     }

    //     document.addEventListener("mousedown", handlerClikOutside);
    //     return () => document.removeEventListener("mousedown", handlerClikOutside);
    // }, []);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <button
                    type="button"
                    role="combobox"
                    aria-expanded={open}
                    className={`flex w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${
                        disabled || isLoading ? 'opacity-60 cursor-not-allowed' : ''
                    }`}
                >
                    <span className="truncate">
                        {isLoading ? 'Memuat data...' : (selectedLabel || placeholder)}
                    </span>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </button>
            </PopoverTrigger>
            <PopoverContent className="w-[--radix-popover-trigger-width] max-h-[--radix-popover-available-height] p-0 z-9999">
                <div className="sticky top-0 border-b border-gray-100 bg-white px-2 py-2">
                    <input
                        type="text"
                        className="w-full rounded-sm border-none bg-gray-50 px-2 py-1 text-sm outline-none ring-1 ring-gray-200 focus:ring-2 focus:ring-blue-500"
                        placeholder={searchPlaceholder}
                        value={query}
                        onChange={(e) => {
                            const newQuery = e.target.value;
                            setQuery(newQuery);
                            if(onSearchQueryChange){
                                onSearchQueryChange(newQuery);
                            }
                        }}
                        autoFocus
                    />
                </div>
                {filteredData.length === 0 ? (
                    <div className="relative cursor-default select-none px-4 py-2 text-gray-700 text-center">
                        {notFoundText}
                    </div>
                ) : (
                    <div className="max-h-60 overflow-auto">
                        {filteredData.map((item) => (
                            <div
                                key={item.value}
                                className={`relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 outline-none hover:bg-gray-100 ${
                                    value === item.value ? 'bg-gray-100 font-medium text-gray-900' : 'text-gray-700'
                                }`}
                                onClick={() => {
                                    onChange(item.value === value ? null : item.value);
                                    setOpen(false);
                                    setQuery("");
                                }}
                            >
                                <span className={`mr-2 flex h-4 w-4 items-center justify-center ${value === item.value ? 'opacity-100' : 'opacity-0'}`}>
                                    <Check className="h-4 w-4" />
                                </span>
                                <span className="truncate">{item.label}</span>
                            </div>
                        ))}
                    </div>
                )}
            </PopoverContent>
        </Popover>
    )
}