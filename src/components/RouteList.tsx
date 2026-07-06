import React from 'react';
import { RouteOption } from '../types';

interface RouteListProps {
  routes: RouteOption[];
  selectedRouteId: string | null;
  onSelectRoute: (routeId: string) => void;
}

export const RouteList: React.FC<RouteListProps> = ({
  routes,
  selectedRouteId,
  onSelectRoute,
}) => {
  const getCrowdBadgeColor = (level: string) => {
    switch (level) {
      case 'empty':
        return 'bg-emerald-50 text-emerald-700 border-emerald-100';
      case 'normal':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'crowded':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      default:
        return 'bg-slate-50 text-slate-700 border-slate-100';
    }
  };

  const getCrowdLabel = (level: string) => {
    switch (level) {
      case 'empty': return '空き';
      case 'normal': return '普通';
      case 'crowded': return '混雑';
      default: return '不明';
    }
  };

  if (routes.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3">
      <h3 className="text-sm font-extrabold text-slate-500 uppercase tracking-wider pl-1">
        検索結果: 経路候補 ({routes.length}件)
      </h3>
      <div className="flex flex-col gap-3.5">
        {routes.map((route, idx) => {
          const isSelected = selectedRouteId === route.id;
          const firstSegment = route.segments[0];

          return (
            <button
              key={route.id}
              onClick={() => onSelectRoute(route.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all duration-300 ${
                isSelected
                  ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-500 ring-2 ring-blue-500 ring-opacity-20 shadow-md transform -translate-y-0.5'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
              } flex flex-col gap-3`}
            >
              {/* カード上部：時間と所要時間 */}
              <div className="flex justify-between items-start">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-black text-slate-800">
                    {route.totalDurationMinutes}
                  </span>
                  <span className="text-xs font-bold text-slate-500">分</span>
                  
                  {idx === 0 && (
                    <span className="ml-2 text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full">
                      最速ルート
                    </span>
                  )}
                </div>
                
                <div className="flex flex-col items-end">
                  <span className="text-sm font-extrabold text-slate-700">
                    {route.startTime} → {route.endTime}
                  </span>
                  <span className="text-[10px] font-bold text-slate-400">
                    乗換 {route.transferCount}回
                  </span>
                </div>
              </div>

              {/* カード下部：路線名と混雑度 */}
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500"></span>
                  <span className="text-xs font-bold text-slate-700">
                    {firstSegment?.lineName || '山手線'}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">基本混雑度:</span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getCrowdBadgeColor(firstSegment?.crowdLevel)}`}>
                    {getCrowdLabel(firstSegment?.crowdLevel)}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
