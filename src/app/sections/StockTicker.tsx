"use client";

import React, { useState, useEffect } from "react";
import StockTick from "../components/StockTick";

interface TickerData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  logo: string;
  type: "stock" | "crypto";
  lastUpdated: string;
}

interface APIResponse {
  data: TickerData[];
  timestamp: string;
  count: number;
}

const StockTicker = () => {
  const [tickerData, setTickerData] = useState<TickerData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<string>("");

  const fetchTickerData = async () => {
    try {
      setError(null);
      const response = await fetch("/api/stockTickers");

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: APIResponse = await response.json();

      setTickerData(result.data);
      setLastUpdate(result.timestamp);
    } catch (error) {
      console.error("Error fetching ticker data:", error);
      setError("Failed to load market data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();

    // Update data every 30 seconds
    const interval = setInterval(fetchTickerData, 30000);

    return () => clearInterval(interval);
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[105px] rounded-xl bg-white/5 flex items-center justify-center">
        <div className="flex items-center gap-2 text-gray-400">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-400"></div>
          <span className="text-sm font-mono">Loading market data...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[105px] rounded-xl bg-white/5 flex items-center justify-center">
        <div className="flex items-center gap-2 text-red-400">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
          <span className="text-sm font-mono">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-[105px] rounded-xl bg-white/5 overflow-hidden relative">
      <div className="flex items-center h-full">
        {/* Marquee Container */}
        <div className="flex animate-marquee whitespace-nowrap">
          {/* First set of tickers */}
          {tickerData.map((ticker, index) => (
            <div
              key={`${ticker.symbol}-1-${index}`}
              className="mx-4 flex-shrink-0"
            >
              <StockTick
                image={ticker.logo}
                name={ticker.name}
                price={ticker.price}
                isPositive={ticker.change >= 0}
              />
            </div>
          ))}

          {/* Duplicate set for seamless loop */}
          {tickerData.map((ticker, index) => (
            <div
              key={`${ticker.symbol}-2-${index}`}
              className="mx-4 flex-shrink-0"
            >
              <StockTick
                image={ticker.logo}
                name={ticker.name}
                price={ticker.price}
                isPositive={ticker.change >= 0}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Gradient fade effects on sides */}
      <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-black/20 to-transparent pointer-events-none z-10"></div>
      <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-black/20 to-transparent pointer-events-none z-10"></div>

      {/* Optional: Last update indicator */}
      {lastUpdate && (
        <div className="absolute bottom-1 right-2 text-xs text-gray-500 font-mono">
          Updated: {new Date(lastUpdate).toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default StockTicker;
