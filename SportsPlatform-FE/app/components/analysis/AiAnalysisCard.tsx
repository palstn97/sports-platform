'use client';

import { useState, useEffect } from 'react';
import { useUserStore } from '@/app/store/useUserStore';

interface AiAnalysisCardProps {
  matchId: number;
}

export default function AiAnalysisCard({ matchId }: AiAnalysisCardProps) {
  const { accessToken } = useUserStore();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);

  // ✅ 마운트 시 자동 조회
  useEffect(() => {
    const checkAnalysis = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}/result`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        if (res.ok) {
          const data = await res.json();
          setAnalysis(data.analysisText);
          setDone(true);
        }
      } catch (err) {
        console.error('분석 결과 조회 실패', err);
      } finally {
        setLoading(false);
      }
    };
    checkAnalysis();
  }, [matchId]);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setAnalysis(data.analysisText);
      setDone(true);
    } catch (err) {
      console.error('AI 분석 조회 실패', err);
      setAnalysis('AI 분석을 불러오는 데 실패했습니다.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  const refetchAnalysis = async () => {
    setDone(false);
    setAnalysis('');
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      const data = await res.json();
      setAnalysis(data.analysisText);
      setDone(true);
    } catch (err) {
      console.error('AI 재분석 실패', err);
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f0f4ff] flex items-center justify-center">
            <span className="text-[14px]">🤖</span>
          </div>
          <span className="text-[14px] font-bold text-[#1a1f36]">AI 경기 분석</span>
          <span className="text-[10px] font-semibold text-[#1a56db] bg-[#f0f4ff] px-2 py-[2px] rounded-full">
            GPT-4o mini
          </span>
        </div>
        {done && (
          <button
            onClick={refetchAnalysis}
            disabled={loading}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold text-[#5a6282] bg-[#f4f6fb] hover:bg-[#eef0f6] transition-all"
          >
            🔄 재분석
          </button>
        )}
      </div>

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* 분석 없음 → 분석 시작 버튼 */}
      {!loading && !done && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-[32px] mb-2">⚽</span>
          <p className="text-[13px] text-[#a0a8c0] mb-4">
            버튼을 눌러 AI 분석을 시작해보세요
          </p>
          <button
            onClick={fetchAnalysis}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[13px] font-semibold bg-[#1a56db] text-white hover:bg-[#1544b8] transition-all"
          >
            ✨ 분석 시작
          </button>
        </div>
      )}

      {/* 분석 결과 */}
      {!loading && done && analysis && (
        <>
          <div className="bg-[#f8f9fc] rounded-xl p-4">
            <p className="text-[13px] text-[#1a1f36] leading-relaxed whitespace-pre-wrap">
              {analysis}
            </p>
          </div>
          <p className="text-[10px] text-[#c0c4d0] mt-3 text-right">
            * AI 분석은 참고용이며 실제 결과와 다를 수 있습니다
          </p>
        </>
      )}
    </div>
  );
}