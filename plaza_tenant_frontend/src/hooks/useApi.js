import { useState, useEffect, useCallback, useRef } from 'react';

export function useApi(apiFn, deps = [], immediate = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);
  const isMountedRef = useRef(true);

  const execute = useCallback(async (...args) => {
    if (!isMountedRef.current) return;
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn(...args);
      if (isMountedRef.current) {
        setData(result);
        setLoading(false);
      }
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err);
        setLoading(false);
      }
      throw err;
    }
  }, [apiFn]);

  useEffect(() => {
    isMountedRef.current = true;
    if (immediate) {
      execute();
    }
    return () => {
      isMountedRef.current = false;
    };
  }, deps);

  const refetch = useCallback((...args) => execute(...args), [execute]);

  return { data, loading, error, refetch, execute };
}
