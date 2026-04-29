import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import MatchList from './components/matches/MatchList';

export default function Home() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen">

      {/* 헤더 */}
      <Header />

      {/* 콘텐츠 */}
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">

        {/* 사이드바 */}
        <Sidebar />

        {/* 메인 콘텐츠 */}
        <MatchList />
      </div>
    </div>
  );
}