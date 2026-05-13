import { useCallback, useEffect, useRef, useState } from 'react';
import type { HistoryItem } from '../types';
import {
  loadHistoryItems,
  removeHistoryItem,
  saveHistoryItems,
  toggleHistoryFavorite,
  upsertHistoryItem,
} from '../lib/history';

export interface UseHistoryReturn {
  items: HistoryItem[];
  loading: boolean;
  addItem: (item: Pick<HistoryItem, 'kind' | 'input' | 'output' | 'context'>) => void;
  toggleFavorite: (id: string) => void;
  removeItem: (id: string) => void;
}

export function useHistory(): UseHistoryReturn {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const loadedRef = useRef(false);
  const isMountedRef = useRef(false);

  useEffect(() => {
    isMountedRef.current = true;

    loadHistoryItems()
      .then((loadedItems) => {
        if (isMountedRef.current) {
          setItems(loadedItems);
          loadedRef.current = true;
        }
      })
      .catch((error) => {
        console.error('Failed to load history:', error);
        loadedRef.current = true;
      })
      .finally(() => {
        if (isMountedRef.current) {
          setLoading(false);
        }
      });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const addItem = useCallback<UseHistoryReturn['addItem']>((item) => {
    setItems((currentItems) => {
      const nextItems = upsertHistoryItem(currentItems, item);

      if (loadedRef.current) {
        void saveHistoryItems(nextItems).catch((error) => {
          console.error('Failed to save history:', error);
        });
      }

      return nextItems;
    });
  }, []);

  const toggleFavorite = useCallback((id: string) => {
    setItems((currentItems) => {
      const nextItems = toggleHistoryFavorite(currentItems, id);

      if (loadedRef.current) {
        void saveHistoryItems(nextItems).catch((error) => {
          console.error('Failed to save history:', error);
        });
      }

      return nextItems;
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((currentItems) => {
      const nextItems = removeHistoryItem(currentItems, id);

      if (loadedRef.current) {
        void saveHistoryItems(nextItems).catch((error) => {
          console.error('Failed to save history:', error);
        });
      }

      return nextItems;
    });
  }, []);

  return {
    items,
    loading,
    addItem,
    toggleFavorite,
    removeItem,
  };
}
