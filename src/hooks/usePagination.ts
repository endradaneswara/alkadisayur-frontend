import * as React from "react";

export interface UsePaginationResult {
  page: number;
  lastPage: number;
  total: number;
  setPage: (page: number) => void;
  setMeta: (meta: { last_page?: number | null; total?: number | null }) => void;
  goToNextPage: () => void;
  goToPreviousPage: () => void;
  canGoNext: boolean;
  canGoPrevious: boolean;
  reset: () => void;
}

export function usePagination(initialPage = 1): UsePaginationResult {
  const [page, setPageState] = React.useState(initialPage);
  const [lastPage, setLastPageState] = React.useState(1);
  const [total, setTotalState] = React.useState(0);

  const setPage = React.useCallback((next: number) => {
    setPageState((current) => Math.max(1, Math.min(next, current === 1 ? next : lastPage)));
  }, [lastPage]);

  const setMeta = React.useCallback(
    (meta: { last_page?: number | null; total?: number | null }) => {
      const nextLastPage = meta.last_page ?? 1;
      setLastPageState(nextLastPage);
      setTotalState(meta.total ?? 0);

      setPageState((current) => {
        if (current > nextLastPage && nextLastPage >= 1) {
          return nextLastPage;
        }
        return current;
      });
    },
    [],
  );

  const goToNextPage = React.useCallback(() => {
    setPageState((current) => Math.min(current + 1, lastPage));
  }, [lastPage]);

  const goToPreviousPage = React.useCallback(() => {
    setPageState((current) => Math.max(1, current - 1));
  }, []);

  const reset = React.useCallback(() => {
    setPageState(1);
    setLastPageState(1);
    setTotalState(0);
  }, []);

  return {
    page,
    lastPage,
    total,
    setPage,
    setMeta,
    goToNextPage,
    goToPreviousPage,
    canGoNext: page < lastPage,
    canGoPrevious: page > 1,
    reset,
  };
}
