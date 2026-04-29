'use client';

interface TeamDto {
  id: number;
  name: string;
  logoUrl: string;
}

interface MatchResponseDto {
  id: number;
  league: string;
  status: string;
  scheduledAt: string;
  homeTeam: TeamDto;
  awayTeam: TeamDto;
  homeScore: number | null;
  awayScore: number | null;
}

const statusLabel: Record<string, { label: string; color: string }> = {
  TIMED: { label: '예정', color: '#a0a8c0' },
  SCHEDULED: { label: '예정', color: '#a0a8c0' },
  IN_PLAY: { label: 'LIVE', color: '#e11d48' },
  PAUSED: { label: '하프타임', color: '#f59e0b' },
  FINISHED: { label: '종료', color: '#a0a8c0' },
  POSTPONED: { label: '연기', color: '#f59e0b' },
  CANCELLED: { label: '취소', color: '#e11d48' },
};

const formatTime = (scheduledAt: string) => {
  const date = new Date(scheduledAt + 'Z');
  return date.toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Seoul'
  });
};

interface MatchCardProps {
  match: MatchResponseDto;
  isLast: boolean;
}

export default function MatchCard({ match, isLast }: MatchCardProps) {
  const status = statusLabel[match.status] || { label: match.status, color: '#a0a8c0' };
  const isLive = match.status === 'IN_PLAY' || match.status === 'PAUSED';
  const isFinished = match.status === 'FINISHED';

  return (
    <div
      className={`bg-white border border-[#eef0f6] border-t-0 hover:bg-[#f7f8fc] transition-all cursor-pointer
        ${isLast ? 'rounded-b-xl' : ''}`}
    >
      <div className="flex items-center px-4 py-3 gap-4">

        {/* 시간/상태 */}
        <div className="w-[60px] flex flex-col items-center flex-shrink-0">
          <span className="text-[12px] font-semibold text-[#5a6282]">
            {formatTime(match.scheduledAt)}
          </span>
          <span
            className="text-[10px] font-semibold mt-1 flex items-center gap-1"
            style={{ color: status.color }}
          >
            {isLive && (
              <span className="inline-block w-[5px] h-[5px] rounded-full bg-[#e11d48] animate-pulse" />
            )}
            {status.label}
          </span>
        </div>

        {/* 홈팀 */}
        <div className="flex-1 flex items-center gap-2 justify-end">
          <span className={`text-[13px] font-semibold ${isFinished && match.homeScore! > match.awayScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
            {match.homeTeam.name}
          </span>
          {match.homeTeam.logoUrl && (
            <img src={match.homeTeam.logoUrl} alt={match.homeTeam.name} className="w-7 h-7 object-contain" />
          )}
        </div>

        {/* 스코어 */}
        <div className="w-[60px] flex items-center justify-center">
          {isFinished || isLive ? (
            <span className="text-[18px] font-bold text-[#1a1f36]">
              {match.homeScore ?? 0} - {match.awayScore ?? 0}
            </span>
          ) : (
            <span className="text-[13px] font-semibold text-[#c8cfe0]">vs</span>
          )}
        </div>

        {/* 원정팀 */}
        <div className="flex-1 flex items-center gap-2">
          {match.awayTeam.logoUrl && (
            <img src={match.awayTeam.logoUrl} alt={match.awayTeam.name} className="w-7 h-7 object-contain" />
          )}
          <span className={`text-[13px] font-semibold ${isFinished && match.awayScore! > match.homeScore! ? 'text-[#1a56db]' : 'text-[#1a1f36]'}`}>
            {match.awayTeam.name}
          </span>
        </div>
      </div>
    </div>
  );
}