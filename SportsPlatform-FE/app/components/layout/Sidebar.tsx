'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { label: '홈', href: '/', section: 'menu' },
  { label: '경기 일정', href: '/schedule', section: 'menu' },
  { label: '리그 순위', href: '/standings', section: 'menu' },
  { label: '승부 예측', href: '/predictions', section: 'predict', color: '#8b5cf6' },
  { label: '예측 랭킹', href: '/ranking', section: 'predict', color: '#f59e0b' },
  { label: 'AI 분석', href: '/ai', section: 'predict', color: '#1a56db' },
  { label: '해외 축구', href: '/soccer', section: 'sports', color: '#16a34a' },
  { label: 'MLB 야구', href: '/baseball', section: 'sports', color: '#f59e0b' },
  { label: '뉴스 피드', href: '/news', section: 'community' },
  { label: '자유 게시판', href: '/board', section: 'community' },
];

const sectionLabels: Record<string, string> = {
  menu: '메뉴',
  predict: '예측',
  sports: '종목',
  community: '커뮤니티',
};

export default function Sidebar() {
  const pathname = usePathname();
  const sections = ['menu', 'predict', 'sports', 'community'];

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  return (
    <aside className="w-[220px] min-w-[220px] bg-white rounded-xl border border-[#eef0f6] self-start sticky top-[88px]">
      <nav className="py-4 px-3">
        {sections.map((section) => (
          <div key={section} className="mb-2">
            <div className="px-3 pt-3 pb-1 text-[10px] text-[#a0a8c0] font-semibold tracking-widest uppercase">
              {sectionLabels[section]}
            </div>
            {navItems
              .filter((item) => item.section === section)
              .map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-[9px] rounded-lg text-[13px] transition-all relative mb-[2px]
                    ${isActive(item.href)
                      ? 'bg-[#f0f4ff] text-[#1a56db] font-semibold'
                      : 'text-[#5a6282] font-medium hover:bg-[#f7f8fc] hover:text-[#1a1f36]'
                    }`}
                >
                  {isActive(item.href) && (
                    <div className="absolute left-0 top-1 bottom-1 w-[3px] bg-[#1a56db] rounded-r-sm" />
                  )}
                  <div
                    className="w-[7px] h-[7px] rounded-full flex-shrink-0"
                    style={{
                      background: isActive(item.href)
                        ? (item.color || '#1a56db')
                        : '#e2e6f0'
                    }}
                  />
                  {item.label}
                </Link>
              ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}