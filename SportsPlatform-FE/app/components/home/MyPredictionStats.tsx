'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUserStore } from '@/app/store/useUserStore';

interface PredictionHistoryDto {
  id: number;
  status: string;
  isCorrect: boolean | null;
}

const getAccuracyColor = (accuracy: number) => {
  if (accuracy >= 70) return 'text-[#16a34a]';
  if (accuracy >= 50) return 'text-[#f59e0b]';
  return 'text-[#e11d48]';
};

export default function MyPredictionStats() {
  const { accessToken, isLoggedIn, nickname } = useUserStore();
  const [predictions, setPredictions] = useState<PredictionHistoryDto[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || !accessToken) return;
    const fetch_ = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/predictions/my`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        const data = await res.json();
        setPredictions(data);
      } catch (err) {
        console.error('내 예측 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    fetch_();
  }, [isLoggedIn, accessToken]);

  if (!isLoggedIn) return null;

  const finished = predictions.filter(p => p.status === 'FINISHED');
  const correct = predictions.filter(p => p.isCorrect === true);
  const pending = predictions.filter(p => p.status !== 'FINISHED');
  const accuracy = finished.length > 0
    ? Math.round((correct.length / finished.length) * 100)
    : 0;

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[15px] font-bold text-[#1a1f36]">
          {nickname}님의 예측 현황
        </span>
        <Link href="/predictions/history" className="text-[12px] text-[#1a56db] hover:underline">
          전체 보기 →
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : predictions.length === 0 ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="text-[28px] mb-2">🎯</span>
          <p className="text-[13px] text-[#a0a8c0] mb-3">아직 예측한 경기가 없어요</p>
          <Link
            href="/predictions"
            className="px-4 py-2 rounded-full bg-[#1a56db] text-white text-[12px] font-semibold"
          >
            예측하러 가기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-[#f8f9fc] rounded-xl p-3 flex flex-col items-center gap-1">
            <span className="text-[22px] font-bold text-[#1a1f36]">{predictions.length}</span>
            <span className="text-[11px] text-[#a0a8c0]">총 예측</span>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-3 flex flex-col items-center gap-1">
            <span className="text-[22px] font-bold text-[#16a34a]">{correct.length}</span>
            <span className="text-[11px] text-[#a0a8c0]">적중</span>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-3 flex flex-col items-center gap-1">
            <span className="text-[22px] font-bold text-[#f59e0b]">{pending.length}</span>
            <span className="text-[11px] text-[#a0a8c0]">진행중</span>
          </div>
          <div className="bg-[#f8f9fc] rounded-xl p-3 flex flex-col items-center gap-1">
            <span className={`text-[22px] font-bold ${getAccuracyColor(accuracy)}`}>
              {accuracy}%
            </span>
            <span className="text-[11px] text-[#a0a8c0]">적중률</span>
          </div>
        </div>
      )}
    </div>
  );
}