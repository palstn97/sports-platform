'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface RankingDto {
  nickname: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

const getMedalEmoji = (index: number) => {
  if (index === 0) return '🥇';
  if (index === 1) return '🥈';
  if (index === 2) return '🥉';
  return null;
};

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 70) return 'text-[#16a34a]';
  if (accuracy >= 50) return 'text-[#f59e0b]';
  return 'text-[#e11d48]';
};

export default function RankingPreview() {
  const [rankings, setRankings] = useState<RankingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/predictions/ranking`
        );
        const data = await res.json();
        setRankings(data.slice(0, 5));
      } catch (err) {
        console.error('랭킹 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-bold text-[#1a1f36]">예측 랭킹 TOP 5</span>
        <Link href="/ranking" className="text-[12px] text-[#1a56db] hover:underline">
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="w-5 h-5 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : rankings.length === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <span className="text-[28px] mb-2">🏆</span>
          <p className="text-[13px] text-[#a0a8c0]">아직 랭킹 데이터가 없어요</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {rankings.map((user, index) => (
            <div
              key={user.nickname}
              className="flex items-center px-3 py-2.5 rounded-lg hover:bg-[#f7f8fc] transition-all"
            >
              <div className="w-8 flex items-center">
                {getMedalEmoji(index) ? (
                  <span className="text-[16px]">{getMedalEmoji(index)}</span>
                ) : (
                  <span className="text-[13px] font-bold text-[#5a6282]">{index + 1}</span>
                )}
              </div>
              <span className="flex-1 text-[13px] font-semibold text-[#1a1f36]">
                {user.nickname}
              </span>
              <span className="text-[12px] text-[#a0a8c0] mr-4">
                {user.correctPredictions}/{user.totalPredictions}번
              </span>
              <span className={`text-[14px] font-bold ${getAccuracyColor(user.accuracy)}`}>
                {user.accuracy}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}