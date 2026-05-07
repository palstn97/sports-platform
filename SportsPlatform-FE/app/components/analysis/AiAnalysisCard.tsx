'use client';

import { useState } from 'react';
import { useUserStore } from '@/app/store/useUserStore';

interface AiAnalysisCardProps {
  matchId: number;
}

export default function AiAnalysisCard({ matchId }: AiAnalysisCardProps) {
  const { accessToken } = useUserStore();
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const fetchAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
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
    // 기존 분석 삭제 후 재분석
    setDone(false);
    setAnalysis('');
    setLoading(true);
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/analysis/${matchId}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const data = await res.json();
      setAnalysis(data.analysisText);
      setDone(true);
    } catch (err) {
      console.error('AI 재분석 실패', err);
      setAnalysis('AI 분석을 불러오는 데 실패했습니다.');
      setDone(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-5 mt-4">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#f0f4ff] flex items-center justify-center">
            <span className="text-[14px]">🤖</span>
          </div>
          <span className="text-[14px] font-bold text-[#1a1f36]">AI 경기 분석</span>
        </div>

        {/* 분석 버튼 */}
        {!done && (
          <button
            onClick={fetchAnalysis}
            disabled={loading}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[12px] font-semibold transition-all
              ${loading
                ? 'bg-[#f4f6fb] text-[#a0a8c0] cursor-not-allowed'
                : 'bg-[#1a56db] text-white hover:bg-[#1544b8]'
              }`}
          >
            {loading ? (
              <>
                <div className="w-3 h-3 border-2 border-[#a0a8c0] border-t-transparent rounded-full animate-spin" />
                분석 중...
              </>
            ) : (
              '✨ 분석 시작'
            )}
          </button>
        )}

        {/* 재분석 버튼 */}
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

      {/* 빈 상태 */}
      {!analysis && !loading && (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <span className="text-[32px] mb-2">⚽</span>
          <p className="text-[13px] text-[#a0a8c0]">
            버튼을 눌러 AI 분석을 시작해보세요
          </p>
        </div>
      )}

      {/* 로딩 */}
      {loading && (
        <div className="flex items-center justify-center py-8">
          <div className="w-6 h-6 border-2 border-[#1a56db] border-t-transparent rounded-full animate-spin" />
          <span className="ml-3 text-[13px] text-[#a0a8c0]">AI가 분석 중입니다...</span>
        </div>
      )}

      {/* 분석 결과 */}
      {analysis && !loading && (
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