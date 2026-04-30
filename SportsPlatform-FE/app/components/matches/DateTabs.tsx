'use client';

const toKST = (date: Date) => new Date(date.getTime() + 9 * 60 * 60 * 1000);
const formatDate = (date: Date) => toKST(date).toISOString().split('T')[0];
const formatDay = (date: Date) => {
  const kst = toKST(date);
  const days = ['일', '월', '화', '수', '목', '금', '토'];
  return days[kst.getDay()];
};
const isToday = (date: Date) => formatDate(date) === formatDate(new Date());

interface DateTabsProps {
  selectedDate: string;
  onDateSelect: (date: string) => void;
  weekOffset: number;
  onWeekChange: (offset: number) => void;
}

const generateWeekDates = (weekOffset: number) => {
  const dates = [];
  const now = new Date();
  const kstNow = toKST(now);
  const kstMidnight = new Date(kstNow);
  kstMidnight.setHours(0, 0, 0, 0);

  for (let i = 0; i < 7; i++) {
    const date = new Date(kstMidnight.getTime() + (weekOffset * 7 + i) * 24 * 60 * 60 * 1000);
    dates.push(date);
  }
  return dates;
};

export default function DateTabs({ selectedDate, onDateSelect, weekOffset, onWeekChange }: DateTabsProps) {
  const dates = generateWeekDates(weekOffset);

  return (
    <div className="bg-white rounded-xl border border-[#eef0f6] p-2 flex items-center gap-1 mb-4">
      <button
        onClick={() => onWeekChange(weekOffset - 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f6fb] transition-all flex-shrink-0 text-[#a0a8c0] hover:text-[#1a56db]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {dates.map((date) => (
        <button
          key={formatDate(date)}
          onClick={() => onDateSelect(formatDate(date))}
          className={`flex-1 py-2 rounded-lg text-center transition-all
            ${selectedDate === formatDate(date)
              ? 'bg-[#1a56db] text-white'
              : 'hover:bg-[#f4f6fb] text-[#5a6282]'
            }`}
        >
          <div className={`text-[13px] font-bold ${selectedDate === formatDate(date) ? 'text-white' : 'text-[#1a1f36]'}`}>
            {toKST(date).getMonth() + 1}/{toKST(date).getDate()}
          </div>
          {isToday(date) ? (
            <div className={`text-[10px] font-bold mt-1 ${selectedDate === formatDate(date) ? 'text-blue-200' : 'text-[#1a56db]'}`}>
              오늘
            </div>
          ) : (
            <div className={`text-[10px] mt-1 ${selectedDate === formatDate(date) ? 'text-blue-200' : 'text-[#a0a8c0]'}`}>
              {formatDay(date)}
            </div>
          )}
        </button>
      ))}

      <button
        onClick={() => onWeekChange(weekOffset + 1)}
        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#f4f6fb] transition-all flex-shrink-0 text-[#a0a8c0] hover:text-[#1a56db]"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}