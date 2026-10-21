import React from 'react';
import { Briefcase, Search, Sparkles } from 'lucide-react';

const EmptyState = ({
  icon: Icon = Briefcase,
  title = 'No items found',
  description = 'Try adjusting your search criteria or filters.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-slate-200/80 shadow-sm max-w-lg mx-auto my-8">
      <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 stroke-[1.75]" />
      </div>
      <h3 className="text-lg font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 mb-6 max-w-sm">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm transition hover:shadow duration-150"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
