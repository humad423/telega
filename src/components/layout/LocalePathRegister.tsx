'use client';

import { useEffect } from 'react';

interface LocalePathRegisterProps {
  paths: {
    en?: string;
    ar?: string;
  };
}

export default function LocalePathRegister({ paths }: LocalePathRegisterProps) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).__localePaths = paths;
    }
    return () => {
      if (typeof window !== 'undefined') {
        const currentPaths = (window as any).__localePaths;
        if (JSON.stringify(currentPaths) === JSON.stringify(paths)) {
          delete (window as any).__localePaths;
        }
      }
    };
  }, [paths]);

  return null;
}
