import { useEffect, useRef } from 'react';

/**
 * Auto-save hook that debounces value changes
 * @param value - The value to auto-save
 * @param onSave - Callback function to save the value
 * @param delay - Debounce delay in milliseconds (default: 2000ms)
 */
export const useAutoSave = <T>(
  value: T,
  onSave: (value: T) => void | Promise<void>,
  delay: number = 2000
) => {
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      onSave(value);
    }, delay);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [value, onSave, delay]);
};
