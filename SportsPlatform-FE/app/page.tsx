import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import TodayMatches from './components/home/TodayMatches';
import MyPredictionStats from './components/home/MyPredictionStats';
import RankingPreview from './components/home/RankingPreview';


export default function Home() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <div className="flex-1 flex flex-col gap-5">
          <MyPredictionStats />
          <TodayMatches />
          <RankingPreview />
        </div>
      </div>
    </div>
  );
}