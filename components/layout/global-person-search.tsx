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
    router.push(result.type === "student" ? `/students/${result.id}` : `/staff/${result.id}`);
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
    <div ref={containerRef} className="relative w-full max-w-md">
      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onFocus={() => query.trim() && setIsOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder={isTeacher ? "Search students..." : "Search students or teachers..."}
        aria-label={isTeacher ? "Search students" : "Search students and teachers"}
        aria-autocomplete="list"
        aria-expanded={isOpen}
        className="w-full bg-slate-50 border border-gurukul-gray rounded-lg pl-9 pr-4 py-1.5 text-xs text-gurukul-dark placeholder:text-slate-400 focus:outline-none focus:border-gurukul-tech transition-colors"
      />

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gurukul-gray bg-white shadow-floating z-50">
          {isLoading ? (
            <p className="px-4 py-3 text-xs text-slate-500">Searching {isTeacher ? "students" : "students and teachers"}...</p>
          ) : results.length === 0 ? (
            <p className="px-4 py-3 text-xs text-slate-500">No {isTeacher ? "students" : "students or teachers"} found.</p>
          ) : (
            <ul role="listbox" aria-label="Search results" className="py-1.5">
              {results.map((result, index) => {
                const Icon = result.type === "student" ? GraduationCap : Users;
                return (
                  <li key={`${result.type}-${result.id}`} role="option" aria-selected={activeIndex === index}>
                    <button
                      type="button"
                      onClick={() => selectResult(result)}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`w-full px-4 py-2.5 text-left flex items-center gap-3 transition-colors ${
                        activeIndex === index ? "bg-slate-100" : "hover:bg-slate-50"
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-full flex items-center justify-center ${result.type === "student" ? "bg-gurukul-tech/10 text-gurukul-tech" : "bg-gurukul-dark text-white"}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-xs font-semibold text-gurukul-dark truncate">{result.name} <span className="font-normal text-slate-500">- {result.type === "student" ? "Student" : "Teacher"}</span></span>
                        <span className="block text-[11px] text-slate-500 truncate">{result.detail}</span>
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
