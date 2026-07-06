import { Station, CarDetail, CrowdLevel, RouteOption } from '../types';

// 主要な駅の定義（JR東日本管轄の主要駅・ターミナル）
export const STATIONS: Station[] = [
  // 山手線・都心主要駅
  { id: 'tokyo', name: '東京', nameEn: 'Tokyo', line: '山手線', lat: 35.681236, lng: 139.767125 },
  { id: 'akihabara', name: '秋葉原', nameEn: 'Akihabara', line: '山手線', lat: 35.698383, lng: 139.773072 },
  { id: 'ueno', name: '上野', nameEn: 'Ueno', line: '山手線', lat: 35.713768, lng: 139.777254 },
  { id: 'ikebukuro', name: '池袋', nameEn: 'Ikebukuro', line: '山手線', lat: 35.729503, lng: 139.710953 },
  { id: 'shinjuku', name: '新宿', nameEn: 'Shinjuku', line: '山手線', lat: 35.689508, lng: 139.700688 },
  { id: 'shibuya', name: '渋谷', nameEn: 'Shibuya', line: '山手線', lat: 35.658034, lng: 139.701636 },
  { id: 'shinagawa', name: '品川', nameEn: 'Shinagawa', line: '山手線', lat: 35.628471, lng: 139.73876 },
  { id: 'shimbashi', name: '新橋', nameEn: 'Shimbashi', line: '山手線', lat: 35.666495, lng: 139.758368 },

  // 首都圏郊外主要ターミナル
  { id: 'omiya', name: '大宮', nameEn: 'Omiya', line: '京浜東北線', lat: 35.906295, lng: 139.623999 },
  { id: 'urawa', name: '浦和', nameEn: 'Urawa', line: '京浜東北線', lat: 35.858231, lng: 139.657152 },
  { id: 'akabane', name: '赤羽', nameEn: 'Akabane', line: '京浜東北線', lat: 35.777675, lng: 139.720979 },
  { id: 'yokohama', name: '横浜', nameEn: 'Yokohama', line: '東海道線', lat: 35.465786, lng: 139.622299 },
  { id: 'kawasaki', name: '川崎', nameEn: 'Kawasaki', line: '京浜東北線', lat: 35.531393, lng: 139.696898 },
  { id: 'chiba', name: '千葉', nameEn: 'Chiba', line: '総武線', lat: 35.613375, lng: 140.113066 },
  { id: 'funabashi', name: '船橋', nameEn: 'Funabashi', line: '総武線', lat: 35.701662, lng: 139.98544 },
  { id: 'hachioji', name: '八王子', nameEn: 'Hachioji', line: '中央線', lat: 35.655554, lng: 139.338998 },
  { id: 'tachikawa', name: '立川', nameEn: 'Tachikawa', line: '中央線', lat: 35.698226, lng: 139.413725 },

  // 地方主要ターミナル (JR東日本管轄)
  { id: 'sendai', name: '仙台', nameEn: 'Sendai', line: '東北本線', lat: 38.260126, lng: 140.882437 },
  { id: 'niigata', name: '新潟', nameEn: 'Niigata', line: '信越本線', lat: 37.912173, lng: 139.06173 },
  { id: 'morioka', name: '盛岡', nameEn: 'Morioka', line: '東北本線', lat: 39.701633, lng: 141.136284 }
];

// JR東日本の主要路線と、それに属する駅の順序定義 (簡易ネットワーク経路検索用)
export const LINE_STATIONS: { [lineName: string]: string[] } = {
  '山手線': ['shinagawa', 'shibuya', 'shinjuku', 'ikebukuro', 'ueno', 'akihabara', 'tokyo', 'shimbashi', 'shinagawa'],
  '京浜東北線': ['omiya', 'urawa', 'akabane', 'ueno', 'akihabara', 'tokyo', 'shimbashi', 'shinagawa', 'kawasaki', 'yokohama'],
  '中央線': ['hachioji', 'tachikawa', 'shinjuku', 'tokyo'],
  '総武線': ['shinjuku', 'akihabara', 'funabashi', 'chiba'],
  '湘南新宿ライン': ['omiya', 'akabane', 'ikebukuro', 'shinjuku', 'shibuya', 'yokohama']
};

// 路線ごとの表示カラー (Tailwind CSSクラス)
export const LINE_COLORS: { [lineName: string]: string } = {
  '山手線': 'bg-lime-600',
  '京浜東北線': 'bg-sky-500',
  '中央線': 'bg-orange-500',
  '総武線': 'bg-yellow-400 text-slate-800',
  '湘南新宿ライン': 'bg-emerald-600',
  '東北本線': 'bg-green-600',
  '信越本線': 'bg-blue-600',
  'JR東日本 快速': 'bg-blue-600',
  'JR東日本 在来線': 'bg-slate-600',
  '東北新幹線': 'bg-emerald-700'
};

// 文字列から決定論的なハッシュ値を生成する (モックデータ自動生成用)
function getHashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

// 曜日と時間帯から混雑レベルを推定する
export function estimateBaseCrowdLevel(dayOfWeek: 'weekday' | 'weekend', timeStr: string): CrowdLevel {
  const [hourStr, minStr] = timeStr.split(':');
  const hour = parseInt(hourStr, 10);

  if (dayOfWeek === 'weekday') {
    // 平日の朝ラッシュ (7:30 - 9:30)
    if ((hour === 7 && parseInt(minStr, 10) >= 30) || hour === 8 || (hour === 9 && parseInt(minStr, 10) <= 30)) {
      return 'crowded';
    }
    // 平日の夕方ラッシュ (17:30 - 19:30)
    if ((hour === 17 && parseInt(minStr, 10) >= 30) || hour === 18 || (hour === 19 && parseInt(minStr, 10) <= 30)) {
      return 'crowded';
    }
    // 深夜帯 (23:00 - 24:59)
    if (hour >= 23 || hour <= 1) {
      return 'normal';
    }
    return 'empty';
  } else {
    // 休日 (11:00 - 18:00 は普通に混む)
    if (hour >= 11 && hour <= 18) {
      return 'normal';
    }
    return 'empty';
  }
}

// 駅名ハッシュを利用して、どの駅に対しても一貫性のある「車両おすすめ情報」を動的生成する
export function getCarDetailsForArrival(
  toStationName: string,
  baseCrowd: CrowdLevel
): CarDetail[] {
  const details: CarDetail[] = [];
  const hash = getHashCode(toStationName);

  // 1〜11号車の設備を決定論的に割り当てる
  // ハッシュコードの余りを利用して設備を配置
  const stairCars = [((hash % 11) + 1), (((hash + 3) % 11) + 1)];
  const escalatorCars = [(((hash + 1) % 11) + 1), (((hash + 7) % 11) + 1)];
  const elevatorCars = [(((hash + 5) % 11) + 1)];
  const exitCars = [(((hash + 2) % 11) + 1), (((hash + 9) % 11) + 1)];
  const transferCars = [(((hash + 4) % 11) + 1), (((hash + 8) % 11) + 1)];

  for (let carNum = 1; carNum <= 11; carNum++) {
    const carFeatures: CarDetail['features'] = [];

    if (stairCars.includes(carNum)) {
      carFeatures.push({ type: 'stairs', description: '階段が近いです' });
    }
    if (escalatorCars.includes(carNum)) {
      carFeatures.push({ type: 'escalator', description: 'エスカレーターが近いです' });
    }
    if (elevatorCars.includes(carNum)) {
      carFeatures.push({ type: 'elevator', description: 'エレベーターが近いです' });
    }
    if (exitCars.includes(carNum)) {
      carFeatures.push({ type: 'exit', description: '出口改札が近いです' });
    }
    if (transferCars.includes(carNum)) {
      carFeatures.push({ type: 'transfer', description: '乗り換え連絡通路が近いです' });
    }

    // 混雑度の決定論的補正
    let crowdLevel: CrowdLevel = baseCrowd;
    const isHeavyFeature = carFeatures.some(f => f.type === 'stairs' || f.type === 'escalator' || f.type === 'transfer');

    if (baseCrowd === 'crowded') {
      if (!isHeavyFeature && (carNum <= 2 || carNum >= 10)) {
        crowdLevel = 'normal'; // 端の車両は少し空いている
      }
    } else if (baseCrowd === 'normal') {
      if (isHeavyFeature) {
        crowdLevel = 'crowded'; // 階段付近は混雑
      } else if (carNum <= 2 || carNum >= 10) {
        crowdLevel = 'empty'; // 端はガラガラ
      }
    } else {
      if (isHeavyFeature) {
        crowdLevel = 'normal';
      } else {
        crowdLevel = 'empty';
      }
    }

    if (carFeatures.length === 0) {
      carFeatures.push({ type: 'none', description: '比較的空いている車両です' });
    }

    details.push({
      carNumber: carNum,
      crowdLevel,
      features: carFeatures,
    });
  }

  return details;
}

// 2つの座標間の距離（km）をハバーサインの公式で計算
export function getDistanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // 地球の半径 (km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// 緯度・経度から最も近い駅を見つける
export function findNearestStation(lat: number, lng: number): Station {
  let minDistance = Infinity;
  let nearest: Station = STATIONS[0];

  for (const station of STATIONS) {
    const dist = getDistanceKm(lat, lng, station.lat, station.lng);
    if (dist < minDistance) {
      minDistance = dist;
      nearest = station;
    }
  }

  return nearest;
}

// 経路検索の主ロジック (JR東日本拡張シミュレータ)
export function getMockRoutes(
  fromIdOrName: string,
  toIdOrName: string,
  dayOfWeek: 'weekday' | 'weekend',
  timeStr: string
): RouteOption[] {
  // 入力が ID か 駅名 かを判別
  let fromStation = STATIONS.find(s => s.id === fromIdOrName || s.name === fromIdOrName);
  let toStation = STATIONS.find(s => s.id === toIdOrName || s.name === toIdOrName);

  // もしマスターデータに登録がなければ、動的に「カスタム駅」を作成する (JR東日本管轄全駅対応)
  if (!fromStation) {
    const hash = getHashCode(fromIdOrName);
    // 東京駅の座標付近に適当にオフセット
    const offsetLat = ((hash % 100) - 50) / 1000;
    const offsetLng = (((hash + 13) % 100) - 50) / 1000;
    fromStation = {
      id: `custom-${hash}`,
      name: fromIdOrName,
      nameEn: `Station-${hash}`,
      line: 'JR東日本 在来線',
      lat: 35.681236 + offsetLat,
      lng: 139.767125 + offsetLng
    };
  }

  if (!toStation) {
    const hash = getHashCode(toIdOrName);
    const offsetLat = ((hash % 100) - 50) / 1000;
    const offsetLng = (((hash + 13) % 100) - 50) / 1000;
    toStation = {
      id: `custom-${hash}`,
      name: toIdOrName,
      nameEn: `Station-${hash}`,
      line: 'JR東日本 在来線',
      lat: 35.681236 + offsetLat,
      lng: 139.767125 + offsetLng
    };
  }

  if (fromStation.name === toStation.name) {
    return [];
  }

  const baseCrowd = estimateBaseCrowdLevel(dayOfWeek, timeStr);
  const distance = getDistanceKm(fromStation.lat, fromStation.lng, toStation.lat, toStation.lng);
  
  // 決定論的に所要時間を計算 (速さは時速 40km 程度と仮定して、最小5分)
  const duration = Math.max(5, Math.round((distance / 40) * 60 + 3));

  const [hourStr, minStr] = timeStr.split(':');
  const startHour = parseInt(hourStr, 10);
  const startMin = parseInt(minStr, 10);

  const formatTimePlusMinutes = (h: number, m: number, addMins: number): string => {
    const totalMins = h * 60 + m + addMins;
    const finalHour = Math.floor(totalMins / 60) % 24;
    const finalMin = totalMins % 60;
    return `${String(finalHour).padStart(2, '0')}:${String(finalMin).padStart(2, '0')}`;
  };

  // 1. 直通ルート
  // 路線名を推定。駅の元路線が共通していればそれを使う。
  let matchedLine = 'JR東日本 在来線';
  if (fromStation.line === toStation.line && fromStation.line !== 'JR東日本 在来線') {
    matchedLine = fromStation.line;
  } else {
    // 登録された路線マスターから、両方の駅が含まれている路線を探す
    for (const [lineName, stationsList] of Object.entries(LINE_STATIONS)) {
      if (stationsList.includes(fromStation.id) && stationsList.includes(toStation.id)) {
        matchedLine = lineName;
        break;
      }
    }
  }

  const routes: RouteOption[] = [];

  // ルートオプション1: 直通ルート、もしくは標準快速ルート
  routes.push({
    id: `route-direct-${fromStation.id}-${toStation.id}`,
    totalDurationMinutes: duration,
    transferCount: 0,
    startTime: timeStr,
    endTime: formatTimePlusMinutes(startHour, startMin, duration),
    segments: [
      {
        id: `seg-1-${fromStation.id}-${toStation.id}`,
        lineName: matchedLine,
        lineColor: LINE_COLORS[matchedLine] || 'bg-slate-600',
        fromStation,
        toStation,
        durationMinutes: duration,
        crowdLevel: baseCrowd,
        carDetails: getCarDetailsForArrival(toStation.name, baseCrowd),
      }
    ]
  });

  // ルートオプション2: 遠回り or 各駅停車 (距離がある場合のみ提示)
  if (distance > 8) {
    const route2Duration = Math.round(duration * 1.3);
    const line2 = matchedLine === '山手線' ? '山手線' : 'JR東日本 快速';
    routes.push({
      id: `route-local-${fromStation.id}-${toStation.id}`,
      totalDurationMinutes: route2Duration,
      transferCount: 0,
      startTime: timeStr,
      endTime: formatTimePlusMinutes(startHour, startMin, route2Duration),
      segments: [
        {
          id: `seg-2-${fromStation.id}-${toStation.id}`,
          lineName: `${line2} (各駅停車)`,
          lineColor: 'bg-slate-600',
          fromStation,
          toStation,
          durationMinutes: route2Duration,
          crowdLevel: baseCrowd === 'crowded' ? 'normal' : 'empty', // 各駅は比較的空いている傾向
          carDetails: getCarDetailsForArrival(toStation.name, baseCrowd === 'crowded' ? 'normal' : 'empty'),
        }
      ]
    });
  }

  return routes.sort((a, b) => a.totalDurationMinutes - b.totalDurationMinutes);
}
