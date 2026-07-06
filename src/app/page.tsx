'use client';

import React, { useState, useRef } from 'react';
import { SearchForm } from '../components/SearchForm';
import { RouteList } from '../components/RouteList';
import { RouteDetail } from '../components/RouteDetail';
import { RouteOption } from '../types';
import { RouteService } from '../services/routeService';

export default function Home() {
  const [routes, setRoutes] = useState<RouteOption[] | null>(null);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [dayOfWeek, setDayOfWeek] = useState<'weekday' | 'weekend'>('weekday');
  const [time, setTime] = useState('08:00');
  const [isLoading, setIsLoading] = useState(false);
  const [isSearched, setIsSearched] = useState(false);

  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSearch = async (
    fromId: string,
    toId: string,
    day: 'weekday' | 'weekend',
    timeStr: string
  ) => {
    setIsLoading(true);
    setDayOfWeek(day);
    setTime(timeStr);
    setIsSearched(true);

    // 擬似的な検索ローディング体験
    setTimeout(async () => {
      try {
        const results = await RouteService.searchRoutes(fromId, toId, day, timeStr);
        setRoutes(results);
        if (results.length > 0) {
          setSelectedRouteId(results[0].id);
        } else {
          setSelectedRouteId(null);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
        // 結果エリアへスムーズスクロール
        setTimeout(() => {
          resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }, 600);
  };

  const selectedRoute = routes?.find(r => r.id === selectedRouteId) || null;

  return (
    <div className="flex flex-col min-h-screen">
      {/* ナビゲーションヘッダー */}
      <header className="sticky top-0 z-40 bg-white bg-opacity-90 backdrop-blur-md border-b border-slate-100 shadow-sm transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-200">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div className="flex flex-col">
              <h1 className="text-base font-black text-slate-800 tracking-tight leading-none">
                TrainSmart Navi
              </h1>
              <span className="text-[9px] font-bold text-slate-400 mt-0.5 tracking-wider uppercase">
                Smart Boarding Guide
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full border border-blue-100">
              山手線エリア対応
            </span>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="flex-grow max-w-6xl w-full mx-auto px-4 py-6 flex flex-col gap-6">
        {/* アプリ紹介（検索前） */}
        {!isSearched && (
          <div className="text-center py-6 max-w-2xl mx-auto flex flex-col gap-3 animate-fadeIn">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-800 tracking-tight">
              電車の「空いている車両」と<br />
              「最適な乗車位置」を瞬時に提案
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
              TrainSmart Naviは、目的地への経路案内だけでなく、曜日や時間帯に基づいた混雑予測、乗り換え・改札出口・エレベーターに近い「乗るべき車両」をピンポイントで案内します。
            </p>
          </div>
        )}

        {/* 検索フォームセクション */}
        <div className={`transition-all duration-500 ${isSearched ? 'max-w-4xl mx-auto w-full' : 'max-w-xl mx-auto w-full'}`}>
          <SearchForm onSearch={handleSearch} />
        </div>

        {/* ローディング表示 */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="relative w-12 h-12">
              <span className="absolute inset-0 rounded-full border-4 border-slate-200"></span>
              <span className="absolute inset-0 rounded-full border-4 border-blue-600 border-t-transparent animate-spin"></span>
            </div>
            <p className="text-xs font-bold text-slate-500 animate-pulse">最適な車両と経路を探索中...</p>
          </div>
        )}

        {/* 検索結果セクション */}
        {isSearched && !isLoading && routes && (
          <div ref={resultsRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 pb-12 animate-fadeIn">
            {/* 左側：経路候補リスト */}
            <div className="md:col-span-1 flex flex-col gap-4">
              <RouteList
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={setSelectedRouteId}
              />
            </div>

            {/* 右側：選択経路の混雑度・おすすめ車両詳細 */}
            <div className="md:col-span-2">
              <RouteDetail
                route={selectedRoute}
                dayOfWeek={dayOfWeek}
                time={time}
              />
            </div>
          </div>
        )}
      </main>

      {/* フッター */}
      <footer className="bg-white border-t border-slate-100 py-6 mt-auto">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400">
          <p className="text-xs font-semibold">
            &copy; 2026 TrainSmart Navi. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs font-bold">
            <span className="hover:text-slate-600 cursor-pointer">利用規約</span>
            <span className="hover:text-slate-600 cursor-pointer">プライバシーポリシー</span>
            <span className="hover:text-slate-600 cursor-pointer">API連携について</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
