import { getApiErrorMessage } from "@/shared/errors/apiError";
import { ListPatientItem, patientService } from "@/shared/services/patient.service";
import { useCallback, useEffect, useRef, useState } from "react";

const SEARCH_DEBOUNCE_MS = 350;

export function usePatientSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ListPatientItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestIdRef = useRef(0);

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim()) {
      setResults([]);
      setHasSearched(false);
      setLoading(false);
      return;
    }
    const myRequest = ++requestIdRef.current;
    setLoading(true);
    setError(null);
    setHasSearched(true);
    try {
      const res = await patientService.search(q.trim());
      if (myRequest !== requestIdRef.current) return;
      setResults(res);
    } catch (err) {
      if (myRequest !== requestIdRef.current) return;
      setError(getApiErrorMessage(err));
      setResults([]);
    } finally {
      if (myRequest === requestIdRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, runSearch]);

  const clear = useCallback(() => {
    setQuery("");
    setResults([]);
    setHasSearched(false);
    setError(null);
  }, []);

  return { query, setQuery, results, loading, error, hasSearched, clear };
}
