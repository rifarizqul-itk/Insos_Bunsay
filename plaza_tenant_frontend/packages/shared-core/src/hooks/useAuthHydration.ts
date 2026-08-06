import { useState, useEffect } from 'react';

export interface IUseAuthHydrationOptions {
  onHydrate: () => Promise<void>;
}

export function useAuthHydration(options: IUseAuthHydrationOptions) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      try {
        await options.onHydrate();
      } catch (err) {
        // Silent hydration error handling - user defaults to unauthenticated
      } finally {
        if (isMounted) {
          setIsHydrated(true);
        }
      }
    }

    initSession();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isHydrated };
}
