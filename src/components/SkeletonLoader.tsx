'use client';

import React from 'react';

export function CardSkeleton() {
  return (
    <div className="p-5 rounded-xl bg-[#121620] border border-slate-800 animate-pulse space-y-3">
      <div className="flex items-center justify-between">
        <div className="h-3 w-24 bg-slate-800 rounded"></div>
        <div className="h-8 w-8 bg-slate-800 rounded-lg"></div>
      </div>
      <div className="h-7 w-20 bg-slate-800 rounded"></div>
      <div className="h-2.5 w-32 bg-slate-800 rounded"></div>
    </div>
  );
}

export function TableRowSkeleton({ cols = 7 }: { cols?: number }) {
  return (
    <tr className="animate-pulse">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-3.5 bg-slate-800/80 rounded w-3/4"></div>
        </td>
      ))}
    </tr>
  );
}
