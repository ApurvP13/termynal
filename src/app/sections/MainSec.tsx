import React from "react";
import StockChart from "../components/StockChart";

const MainSec = () => {
  return (
    <div className="w-full h-full flex flex-col gap-4 items-center">
      <h1>NAV BAR</h1>
      <StockChart />
    </div>
  );
};

export default MainSec;
