"use client";
import React, { useState } from "react";
import NavBar from "../components/NavBar";
import StockChart from "../components/StockChart";

const MainSec = () => {
  const [selectedStock, setSelectedStock] = useState<string>("NVDA"); // Default stock
  const [mode, setMode] = useState<"stocks" | "crypto">("stocks");

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol);
  };

  const handleModeChange = (newMode: "stocks" | "crypto") => {
    setMode(newMode);
    // You might want to clear the selected stock when switching modes
    // or have different default symbols for each mode
    if (newMode === "crypto") {
      setSelectedStock("BTC"); // Default crypto symbol
    } else {
      setSelectedStock("NVDA"); // Default stock symbol
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-gray-950 text-white min-h-screen">
      <NavBar
        onStockSelect={handleStockSelect}
        onModeChange={handleModeChange}
        selectedMode={mode}
      />
      <div className="flex-1 flex justify-center items-start pt-8">
        <StockChart selectedSymbol={selectedStock} mode={mode} />
      </div>
    </div>
  );
};

export default MainSec;
