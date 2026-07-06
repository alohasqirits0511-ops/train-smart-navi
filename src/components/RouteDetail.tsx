import React from 'react';
import { RouteOption } from '../types';
import { CarRecommendations } from './CarRecommendations';
import { CrowdStatus } from './CrowdStatus';

interface RouteDetailProps {
  route: RouteOption | null;
  dayOfWeek: 'weekday' | 'weekend';
  time: string;
}

export const RouteDetail: React.FC<RouteDetailProps> = ({ route, dayOfWeek, time }) => {
  if (!route) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center text-slate-400">
        <svg className="w-12 h-12 mx-auto mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
        <p className="text-sm font-semibold">経路候補を選択すると、詳細な乗車位置や混雑情報が表示されます。</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* 経路概要 */}
      <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-base font-extrabold text-slate-800">
            選択中の経路詳細
          </h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-sm text-slate-500 font-bold">総所要時間:</span>
            <span className="text-2xl font-black text-blue-600">
              {route.totalDurationMinutes}
            </span>
            <span className="text-xs font-bold text-slate-500">分</span>
            <span className="text-xs text-slate-400 font-semibold ml-2">
              ( {route.startTime} 発 → {route.endTime} 着 )
            </span>
          </div>
        </div>

        {/* ルートの縦型タイムラインUI */}
        <div className="flex flex-col relative pl-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-1 before:bg-slate-200 before:rounded-full">
          {route.segments.map((segment, index) => (
            <div key={segment.id} className="flex flex-col gap-5 relative mb-4 last:mb-0">
              {/* 出発駅 */}
              <div className="flex items-start gap-4">
                <span className="absolute -left-5.5 top-1.5 w-4 h-4 rounded-full bg-blue-600 border-4 border-white shadow-sm"></span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      {segment.fromStation.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {segment.fromStation.line}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {route.startTime} 発
                  </span>
                </div>
              </div>

              {/* 移動区間 (路線名、所要時間) */}
              <div className="flex items-center gap-3 pl-3.5 py-1.5 bg-slate-50 rounded-xl border border-slate-100 relative before:absolute before:-left-5.5 before:top-0 before:bottom-0 before:w-1 before:bg-green-500">
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-700">
                    {segment.lineName}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold">
                    乗車時間: {segment.durationMinutes}分
                  </span>
                </div>
              </div>

              {/* 到着駅 */}
              <div className="flex items-start gap-4">
                <span className="absolute -left-5.5 top-1.5 w-4 h-4 rounded-full bg-rose-600 border-4 border-white shadow-sm"></span>
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-slate-800">
                      {segment.toStation.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      {segment.toStation.line}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {route.endTime} 着
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 各セグメントの混雑度と車両おすすめを表示 */}
      {route.segments.map((segment) => (
        <div key={segment.id} className="flex flex-col gap-4">
          {/* 混雑度予測 */}
          <CrowdStatus
            level={segment.crowdLevel}
            dayOfWeek={dayOfWeek}
            time={route.startTime}
          />

          {/* おすすめ乗車車両 */}
          <CarRecommendations
            carDetails={segment.carDetails}
            toStationName={segment.toStation.name}
          />
        </div>
      ))}
    </div>
  );
};
