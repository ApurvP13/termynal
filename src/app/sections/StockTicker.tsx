import React from "react";
import StockTick from "../components/StockTick";

const StockTicker = () => {
  return (
    <div className="w-full h-[105px] rounded-xl bg-white/5 flex items-center justify-center gap-8 py-3">
      {/* Tesla Example */}
      <StockTick
        image="https://logo.clearbit.com/tesla.com"
        name="TSLA"
        price={338.33}
        isPositive={true}
      />

      {/* Apple Example */}
      <StockTick
        image="https://logo.clearbit.com/apple.com"
        name="AAPL"
        price={227.52}
        isPositive={true}
      />

      {/* Ethereum Example */}
      <StockTick
        image="https://cryptologos.cc/logos/ethereum-eth-logo.png"
        name="ETH(USD)"
        price={2847.91}
        isPositive={false}
      />
    </div>
  );
};

export default StockTicker;
