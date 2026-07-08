export interface LineInfo {
  name: string;
  category:
    | 'JR East'
    | 'JR West'
    | 'JR Central'
    | 'JR Hokkaido'
    | 'JR Shikoku'
    | 'JR Kyushu'
    | 'Other';
  color: string; // Tailwind class or hex
}

const lineInfoMap: Record<string, LineInfo> = {
  // JR East
  山手線: { name: '山手線', category: 'JR East', color: 'bg-emerald-500' },
  中央線快速: { name: '中央線快速', category: 'JR East', color: 'bg-blue-500' },
  総武線: { name: '総武線', category: 'JR East', color: 'bg-indigo-500' },
  // JR West
  東海道本線: { name: '東海道本線', category: 'JR West', color: 'bg-red-500' },
  // JR Central
  東海道新幹線: { name: '東海道新幹線', category: 'JR Central', color: 'bg-yellow-500' },
  // JR Hokkaido
  函館本線: { name: '函館本線', category: 'JR Hokkaido', color: 'bg-indigo-500' },
  // JR Shikoku
  予讃線: { name: '予讃線', category: 'JR Shikoku', color: 'bg-pink-5' },
  // JR Kyushu
  鹿児島本線: { name: '鹿児島本線', category: 'JR Kyushu', color: 'bg-purple-500' },
  // Default fallback
};

export function getLineInfo(lineName: string): LineInfo {
  return (
    lineInfoMap[lineName] ?? {
      name: lineName,
      category: 'Other',
      color: 'bg-gray-400',
    }
  );
}
