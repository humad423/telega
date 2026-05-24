import React from 'react';

export default function Loading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[50vh] space-y-4">
      <div className="relative flex items-center justify-center">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-primary border-r-primary/50 animate-spin w-12 h-12"></div>
        {/* Inner pulsing dot */}
        <div className="w-4 h-4 bg-primary rounded-full animate-pulse"></div>
      </div>
      <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse font-['Inter','Tajawal']">
        جاري التحميل...
      </p>
    </div>
  );
}
