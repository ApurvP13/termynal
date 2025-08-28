import MainSec from "./sections/MainSec";
import StockTicker from "./sections/StockTicker";

export default function Home() {
  return (
    <div className="flex flex-col items-center px-[65px] py-6 justify-between">
      {/* main section containing the graph, toggles and search functionality. */}
      <MainSec />
      {/* the stock ticker */}
      <StockTicker />
    </div>
  );
}
