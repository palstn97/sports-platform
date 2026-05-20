'use client';

import { useState, useEffect } from 'react';
import Header from '@/app/components/layout/Header';
import Sidebar from '@/app/components/layout/Sidebar';

interface RankingDto {
  nickname: string;
  totalPredictions: number;
  correctPredictions: number;
  accuracy: number;
}

export default function RankingPage() {
  const [rankings, setRankings] = useState<RankingDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRankings = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predictions/ranking`);
        const data = await res.json();
        setRankings(data);
      } catch (err) {
        console.error('랭킹 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetchRankings();
  }, []);

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

  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1">

          {/* 페이지 제목 */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-[18px] font-bold text-[#1a1f36]">예측 랭킹</span>
            <span className="text-[11px] font-semibold text-[#f59e0b] bg-[#fffbeb] px-2 py-[2px] rounded-full">
              실시간
            </span>
          </div>

          {/* 상위 3명 하이라이트 */}
          {!loading && rankings.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              {[rankings[1], rankings[0], rankings[2]].map((user, i) => {
                const actualIndex = i === 0 ? 1 : i === 1 ? 0 : 2;
                return (
                  <div
                    key={user.nickname}
                    className={`bg-white rounded-xl border p-4 flex flex-col items-center gap-2 
                      ${actualIndex === 0 ? 'border-[#f59e0b] shadow-md scale-105' : 'border-[#eef0f6]'}`}
                  >
                    <span className="text-[32px]">{getMedalEmoji(actualIndex)}</span>
                    <span className="text-[14px] font-bold text-[#1a1f36]">{user.nickname}</span>
                    <span className={`text-[22px] font-bold ${getAccuracyColor(user.accuracy)}`}>
                      {user.accuracy}%
                    </span>
                    <span className="text-[11px] text-[#a0a8c0]">
                      {user.correctPredictions}번 적중 / {user.totalPredictions}번 예측
                    </span>
                  </div>
                );
              })}
            </div>
          )}

          {/* 전체 랭킹 테이블 */}
          <div className="bg-white rounded-xl border border-[#eef0f6] overflow-hidden">
            {/* 테이블 헤더 */}
            <div className="grid grid-cols-5 px-5 py-3 bg-[#f8f9fc] border-b border-[#eef0f6]">
              <span className="text-[12px] font-semibold text-[#a0a8c0]">순위</span>
              <span className="text-[12px] font-semibold text-[#a0a8c0] col-span-2">닉네임</span>
              <span className="text-[12px] font-semibold text-[#a0a8c0] text-center">예측/적중</span>
              <span className="text-[12px] font-semibold text-[#a0a8c0] text-right">적중률</span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-[14px] text-[#a0a8c0]">불러오는 중...</div>
              </div>
            ) : rankings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="text-[40px] mb-4">🎯</div>
                <div className="text-[15px] font-semibold text-[#1a1f36] mb-2">아직 랭킹이 없어요</div>
                <div className="text-[12px] text-[#a0a8c0]">경기를 예측하고 랭킹에 도전해보세요!</div>
              </div>
            ) : (
              rankings.map((user, index) => (
                <div
                  key={user.nickname}
                  className={`grid grid-cols-5 px-5 py-4 border-b border-[#eef0f6] last:border-0 
                    hover:bg-[#f8f9fc] transition-all
                    ${index < 3 ? 'bg-white' : ''}`}
                >
                  {/* 순위 */}
                  <div className="flex items-center">
                    {getMedalEmoji(index) ? (
                      <span className="text-[18px]">{getMedalEmoji(index)}</span>
                    ) : (
                      <span className="text-[14px] font-bold text-[#5a6282]">{index + 1}</span>
                    )}
                  </div>

                  {/* 닉네임 */}
                  <div className="col-span-2 flex items-center">
                    <span className="text-[14px] font-semibold text-[#1a1f36]">{user.nickname}</span>
                  </div>

                  {/* 예측/적중 */}
                  <div className="flex items-center justify-center">
                    <span className="text-[13px] text-[#5a6282]">
                      {user.totalPredictions}번 /
                      <span className="text-[#1a56db] font-semibold ml-1">{user.correctPredictions}번</span>
                    </span>
                  </div>

                  {/* 적중률 */}
                  <div className="flex items-center justify-end">
                    <span className={`text-[15px] font-bold ${getAccuracyColor(user.accuracy)}`}>
                      {user.accuracy}%
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* 안내 문구 */}
          {!loading && rankings.length > 0 && (
            <p className="text-[11px] text-[#c0c4d0] mt-3 text-right">
              * 종료된 경기 예측 기준 / 실시간 업데이트
            </p>
          )}
        </div>
      </div>
    </div>
  );
}