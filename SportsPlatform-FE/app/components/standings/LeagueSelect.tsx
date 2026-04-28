'use client';

const leagues = [
  { code: 'PL', name: '프리미어리그' },
  { code: 'PD', name: '라리가' },
  { code: 'BL1', name: '분데스리가' },
  { code: 'SA', name: '세리에 A' },
  { code: 'FL1', name: '리그 1' },
  { code: 'CL', name: 'UCL' },
];

interface LeagueSelectProps {
  selectedLeague: string;
  onLeagueSelect: (code: string) => void;
}

export default function LeagueSelect({ selectedLeague, onLeagueSelect }: LeagueSelectProps) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {leagues.map((league) => (
        <button
          key={league.code}
          onClick={() => onLeagueSelect(league.code)}
          className={`px-4 py-[7px] rounded-full text-[13px] font-medium border transition-all
            ${selectedLeague === league.code
              ? 'bg-[#1a56db] border-[#1a56db] text-white font-semibold'
              : 'border-[#eef0f6] text-[#5a6282] bg-white hover:border-[#1a56db] hover:text-[#1a56db]'
            }`}
        >
          {league.name}
        </button>
      ))}
    </div>
  );
}