import { authClient } from "@/lib/auth-client";
import { useEffect, useRef } from "react";

function useAuthSession() {
  const {
    data,
    isPending,
    error,
    refetch,
  } = authClient.useSession();

  const isPendingRef = useRef(isPending);

  useEffect(() => {
    isPendingRef.current = isPending;
  }, [isPending]);

  useEffect(() => {
    if (isPending) {
      const timerNotify = setTimeout(() => {
        if (isPendingRef.current) {
          refetch();
        }
      }, 2500);

      const timerReload = setTimeout(() => {
        if (isPendingRef.current) {
          window.location.reload();
        }
      }, 5000);

      return () => {
        clearTimeout(timerNotify);
        clearTimeout(timerReload);
      };
    }
  }, [isPending, refetch]);

  return {
    data,
    isPending,
    error,
  };
}

export { useAuthSession };