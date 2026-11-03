import React from 'react';

interface ManageTabProps {
  stories: any[];
}

export const ManageTab: React.FC<ManageTabProps> = ({ stories }) => {
  const uniqueSeriesList = Array.from(new Set(stories.map(s => s.title)));

  return (
    <div className="bg-[#16131c] p-4 rounded-2xl border border-gray-800 space-y-3 shadow-lg">
      <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wide">Manage Series ({uniqueSeriesList.length})</h3>
      <p className="text-[11px] text-gray-400">Total episodes in database: {stories.length}</p>
      <div className="space-y-2 pt-2">
        {uniqueSeriesList.map((seriesTitle: any, idx) => (
          <div key={idx} className="bg-[#0f0d13] p-3 rounded-xl border border-gray-800 flex justify-between items-center">
            <span className="text-xs font-bold text-white">{seriesTitle}</span>
            <span className="text-[10px] bg-orange-900/60 text-orange-300 px-2 py-0.5 rounded-full font-semibold">
              {stories.filter(s => s.title === seriesTitle).length} Episodes
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
