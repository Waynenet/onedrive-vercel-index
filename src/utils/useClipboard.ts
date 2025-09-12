// src/utils/useClipboard.ts
import { useState, useCallback } from 'react';

type CopyStatus = 'inactive' | 'copied' | 'failed';

export function useClipboard(timeout = 2000): { copy: (text: string) => void; status: CopyStatus } {
  const [status, setStatus] = useState<CopyStatus>('inactive');

  const copy = useCallback(
    async (text: string) => {
      if (!navigator?.clipboard) {
        console.warn('Clipboard not supported');
        setStatus('failed');
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        setStatus('copied');
        // Reset status after a timeout
        setTimeout(() => setStatus('inactive'), timeout);
      } catch (error) {
        console.warn('Copy failed', error);
        setStatus('failed');
        setTimeout(() => setStatus('inactive'), timeout);
      }
    },
    [timeout]
  );

  return { copy, status };
}