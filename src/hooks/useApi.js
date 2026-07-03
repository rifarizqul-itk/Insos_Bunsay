import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const abortRef = useRef(null);

  const execute = useCallback(async (...args) => {
    // Cancel previous request if any
    if (abortRef.current) {
      abortRef.current();
      abortRef.current = null;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      setData(result);
      setLoading(false);
      return result;
    } catch (err) {
      setError(err);
      setLoading(false);
      throw err;
    }
  }, [apiFn]);

  useEffect(() => {
    if (immediate) {
      execute();
    }
    return () => {
      if (abortRef.current) {
        abortRef.current();
      }
    };
  }, deps);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, execute };
}
