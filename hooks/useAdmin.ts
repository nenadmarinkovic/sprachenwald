import { useState, useEffect } from 'react';
import { useUser } from './useUser';

export function useAdmin() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    user
      .getIdTokenResult(true)
      .then((idTokenResult) => {
        setIsAdmin(!!idTokenResult.claims.admin);
        setIsLoading(false);
      })
      .catch(() => {
        setIsAdmin(false);
        setIsLoading(false);
      });
  }, [user, isUserLoading]);

  return { isAdmin, isLoading };
}
