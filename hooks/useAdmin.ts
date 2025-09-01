import { useState, useEffect } from 'react';
import { useUser } from './useUser';

export function useAdmin() {
  const { user, isLoading: isUserLoading } = useUser();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isUserLoading) {
      // Don't draw any conclusions until the user state is resolved.
      return;
    }

    if (!user) {
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Check for the admin custom claim.
    user
      .getIdTokenResult(true) // Force refresh the token
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
