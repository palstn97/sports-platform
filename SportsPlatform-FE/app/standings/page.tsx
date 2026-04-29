import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StandingTable from '../components/standings/StandingTable';

export default function StandingsPage() {
  return (
    <div className="bg-[#f4f6fb] min-h-screen">
      <Header />
      <div className="max-w-[1280px] mx-auto px-10 py-6 flex gap-6">
        <Sidebar />
        <StandingTable />
      </div>
    </div>
  );
}