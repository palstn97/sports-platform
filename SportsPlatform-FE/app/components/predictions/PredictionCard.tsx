'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUserStore } from '@/app/store/useUserStore';

interface TeamDto {
  id: number;
  name: string;
  logoUrl: string;
}

interface PredictionRatioDto {
  homeRatio: number;
  drawRatio: number;
  awayRatio: number;
  totalCount: number;
}

interface PredictionCardProps {
  matchId: number;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  status: string;
}

export default function PredictionCard({ matchId, homeTeam, awayTeam, status }: PredictionCardProps) {
  const router = useRouter();
  const [ratio, setRatio] = useState<PredictionRatioDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [predicted, setPredicted] = useState(false);
  const { accessToken, isLoggedIn } = useUserStore();

  const isFinished = status === 'FINISHED' || status === 'POSTPONED' || status === 'CANCELLED';

  const fetchRatio = async () => {
    if (!accessToken) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predictions/${matchId}/ratio`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data) {
            setRatio(data);
            setPredicted(true);
          }
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  // 종료된 경기는 로그인 없이도 비율 조회
  const fetchRatioPublic = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predictions/${matchId}/ratio/public`);
      if (res.ok) {
        const text = await res.text();
        if (text) {
          const data = JSON.parse(text);
          if (data) setRatio(data);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (isFinished) {
      fetchRatioPublic();
    } else {
      fetchRatio();
    }
  }, [matchId, accessToken, isFinished]);

  const handlePredict = async (result: 'HOME' | 'DRAW' | 'AWAY') => {
    if (!isLoggedIn || !accessToken) {
      router.push('/login');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/predictions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`
        },
        body: JSON.stringify({ matchId, predictedResult: result })
      });
      if (res.ok) {
        await fetchRatio();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5">
      <h3 className="text-[13px] font-bold text-[#1a1f36] mb-4">
        {isFinished ? '예측 결과' : '누가 이길까요?'}
      </h3>

      {/* 종료된 경기 or 예측 완료 → 비율 바 표시 */}
      {(isFinished || predicted) && ratio ? (
        <div className="rounded-xl overflow-hidden h-[56px] flex">
          <div
            className="flex flex-col items-center justify-center gap-1 transition-all duration-500"
            style={{ width: `${ratio.homeRatio}%`, backgroundColor: '#1a56db' }}
          >
            {ratio.homeRatio > 15 && (
              <>
                <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-5 h-5 object-contain" />
                <span className="text-[11px] font-bold text-white">{ratio.homeRatio}%</span>
              </>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center gap-1 transition-all duration-500"
            style={{ width: `${ratio.drawRatio}%`, backgroundColor: '#6b7280' }}
          >
            {ratio.drawRatio > 15 && (
              <span className="text-[11px] font-bold text-white">{ratio.drawRatio}%</span>
            )}
          </div>
          <div
            className="flex flex-col items-center justify-center gap-1 transition-all duration-500"
            style={{ width: `${ratio.awayRatio}%`, backgroundColor: '#e11d48' }}
          >
            {ratio.awayRatio > 15 && (
              <>
                <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-5 h-5 object-contain" />
                <span className="text-[11px] font-bold text-white">{ratio.awayRatio}%</span>
              </>
            )}
          </div>
        </div>
      ) : isFinished ? (
        // 종료됐는데 예측 데이터 없음
        <div className="text-center py-4 text-[13px] text-[#a0a8c0]">
          예측 데이터가 없습니다.
        </div>
      ) : (
        // 예측 전 → 버튼 표시
        <div className="flex gap-2">
          <button
            onClick={() => handlePredict('HOME')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#eef0f6] hover:border-[#1a56db] hover:bg-[#f0f4ff] transition-all"
          >
            {homeTeam.logoUrl && (
              <img src={homeTeam.logoUrl} alt={homeTeam.name} className="w-8 h-8 object-contain" />
            )}
            <span className="text-[12px] font-semibold text-[#1a1f36]">{homeTeam.name}</span>
          </button>
          <button
            onClick={() => handlePredict('DRAW')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#eef0f6] hover:border-[#6b7280] hover:bg-[#f4f6fb] transition-all"
          >
            <span className="text-[20px]">🤝</span>
            <span className="text-[12px] font-semibold text-[#1a1f36]">무승부</span>
          </button>
          <button
            onClick={() => handlePredict('AWAY')}
            disabled={loading}
            className="flex-1 flex flex-col items-center gap-2 py-3 rounded-xl border-2 border-[#eef0f6] hover:border-[#e11d48] hover:bg-[#fff0f3] transition-all"
          >
            {awayTeam.logoUrl && (
              <img src={awayTeam.logoUrl} alt={awayTeam.name} className="w-8 h-8 object-contain" />
            )}
            <span className="text-[12px] font-semibold text-[#1a1f36]">{awayTeam.name}</span>
          </button>
        </div>
      )}

      {ratio && (
        <div className="text-center mt-3 text-[11px] text-[#a0a8c0]">
          총 {ratio.totalCount}명 참여
        </div>
      )}
    </div>
  );
}