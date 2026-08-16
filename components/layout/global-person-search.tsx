"use client";

import { KeyboardEvent, useEffect, useRef, useState } from "react";
import { Search, GraduationCap, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/session-context";

type SearchResult = {
  id: string;
  name: string;
  type: "student" | "teacher";
  detail: string;
};

export function GlobalPersonSearch() {
  const router = useRouter();
  const { isTeacher } = useAuth();
  const containerRef = useRef<HTMLDivElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) {
      setResults([]);
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsLoading(true);
      try {
        const peopleScope = isTeacher ? "&people=students" : "";
        const response = await fetch(`/api/search?q=${encodeURIComponent(trimmedQuery)}${peopleScope}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Search failed");
        const data = await response.json();
        setResults(data.results);
        setIsOpen(true);
        setActiveIndex(-1);
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          setResults([]);
          setIsOpen(true);
        }
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    }, 250);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query, isTeacher]);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, []);

  const selectResult = (result: SearchResult) => {
    setIsOpen(false);
    setQuery("");
    router.push(result.type === "student" ? `/students?sel=${result.id}` : `/staff?sel=${result.id}`);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
      return;
    }
    if (!isOpen || results.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => (index + 1) % results.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => (index <= 0 ? results.length - 1 : index - 1));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      selectResult(results[activeIndex]);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={isTeacher ? "Search students..." : "Search people..."}
        role="combobox"
        aria-label={isTeacher ? "Search students" : "Search students and teachers"}
        aria-autocomplete="list"
        aria-controls="global-person-search-results"
        aria-expanded={isOpen}
        className="w-full bg-neutral-50 border border-neutral-200 rounded-lg pl-8 pr-3 py-1.5 text-xs text-gurukul-dark placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-neutral-200 focus:border-neutral-300 transition-all"
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1.5 max-h-72 overflow-y-auto rounded-xl border border-neutral-200 bg-white shadow-floating z-50 custom-scrollbar">
          {isLoading ? (
            <div className="px-3 py-3 text-xs text-neutral-400 flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-neutral-200 border-t-neutral-500 rounded-full animate-spin" />
              <span>Searching...</span>
            </div>
          ) : results.length === 0 ? (
            <p className="px-3 py-3 text-xs text-neutral-400">No results found.</p>
          ) : (
            <ul id="global-person-search-results" role="listbox" aria-label="Search results" className="py-1">
              {results.map((result, index) => {
                const Icon = result.type === "student" ? GraduationCap : Users;
                return (
                  <li key={`${result.type}-${result.id}`} role="option" aria-selected={activeIndex === index}>
                    <button
                      type="button"
                      onClick={() => selectResult(result)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full px-3 py-2 text-left flex items-center gap-2.5 transition-colors ${
                        activeIndex === index ? "bg-neutral-50" : "hover:bg-neutral-50"
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        result.type === "student" ? "bg-neutral-100 text-neutral-500" : "bg-gurukul-dark text-white"
                      }`}>
                        <Icon className="w-3 h-3" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-medium text-gurukul-dark truncate">
                          {result.name}
                          <span className="font-normal text-neutral-400"> — {result.type === "student" ? "Student" : "Teacher"}</span>
                        </span>
                        <span className="block text-[10px] text-neutral-400 truncate">{result.detail}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
