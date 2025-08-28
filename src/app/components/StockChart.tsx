"use client";

import React, { useEffect, useRef, useState } from "react";
import { createChart, AreaSeries } from "lightweight-charts";

interface FinnhubTradeMessage {
  type: string;
  data: Array<{
    s: string; // symbol
    p: number; // price
    t: number; // timestamp
    v: number; // volume
  }>;
}

const StockChart: React.FC = () => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const areaSeries = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const selectedSymbol = "TSLA";
  const initialPriceRef = useRef<number | null>(null);

  useEffect(() => {
    if (!chartContainerRef.current) return;

    // Create the chart
    const chartOptions = {
      width: 984,
      height: 565,
      layout: {
        background: { color: "rgba(255, 255, 255, 0.05)" },
        textColor: "#aaaaaa",
      },
      grid: {
        vertLines: { color: "rgba(153, 153, 153, 0.2)" },
        horzLines: { color: "rgba(153, 153, 153, 0.2)" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    };

    chart.current = createChart(chartContainerRef.current, chartOptions);

    // Create area series (instead of line)
    areaSeries.current = chart.current.addSeries(AreaSeries, {
      lineColor: "#00C853",
      topColor: "rgba(0, 200, 83, 0.5)",
      bottomColor: "rgba(255, 255, 255, 0)",
    });

    // Handle window resize
    const handleResize = () => {
      if (chart.current) {
        chart.current.applyOptions({
          width: 984,
          height: 565,
        });
      }
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      if (chart.current) {
        chart.current.remove();
      }
    };
  }, []);

  useEffect(() => {
    // Initialize WebSocket connection
    const initWebSocket = () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;
        const ws = new WebSocket(`wss://ws.finnhub.io?token=${API_KEY}`);
        wsRef.current = ws;

        ws.onerror = (err: any) => {
          console.log("WebSocket connection failed:", err);
          setIsConnected(false);
        };

        ws.onclose = (event) => {
          console.log("WebSocket connection closed:", event.code, event.reason);
          setIsConnected(false);
        };

        ws.onopen = () => {
          console.log("WebSocket connection opened");
          setIsConnected(true);

          // Subscribe to AAPL trades
          ws.send(
            JSON.stringify({
              type: "subscribe",
              symbol: selectedSymbol,
            })
          );

          console.log(`Subscribed to ${selectedSymbol} trades`);
        };

        ws.onmessage = (event) => {
          try {
            const message: FinnhubTradeMessage = JSON.parse(event.data);

            if (
              message.type === "trade" &&
              message.data &&
              areaSeries.current
            ) {
              // Process each trade
              message.data.forEach((trade) => {
                if (trade.s === selectedSymbol) {
                  const tradeData = {
                    time: Math.floor(trade.t / 1000), // Convert ms to seconds
                    value: trade.p, // Current price
                  };

                  // Update the chart
                  areaSeries.current.update(tradeData);

                  // Set initial price reference
                  if (initialPriceRef.current === null) {
                    initialPriceRef.current = trade.p;
                  }

                  // Update current price and calculate change
                  setCurrentPrice(trade.p);
                  const change = trade.p - (initialPriceRef.current || trade.p);
                  setPriceChange(change);

                  // Update area colors based on price change
                  const lineColor = change >= 0 ? "#00C853" : "#fd372e";
                  const topColor =
                    change >= 0
                      ? "rgba(0, 200, 83, 0.05)"
                      : "rgba(253, 55, 46, 0.05)";

                  areaSeries.current.applyOptions({
                    lineColor,
                    topColor,
                    bottomColor: "rgba(255, 255, 255, 0)",
                  });

                  console.log(
                    `${selectedSymbol}: $${trade.p} at ${new Date(
                      trade.t
                    ).toLocaleTimeString()}`
                  );
                }
              });
            }
          } catch (error) {
            console.error("Error parsing WebSocket message:", error);
          }
        };
      } catch (error) {
        console.error("Error initializing WebSocket:", error);
      }
    };

    initWebSocket();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const now = new Date();

  const dateStr = now.toLocaleDateString("en-US", {
    day: "2-digit",
    month: "short",
  });

  const timeStr = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZoneName: "short",
  });

  return (
    <div className="w-full flex flex-col items-start gap-2 p-4">
      <div className="flex font-mono flex-col gap-1.5 items-start">
        {currentPrice && (
          <div className="flex gap-3 items-center justify-between">
            <div className="text-3xl text-white">
              <span className="text-lg">$</span>
              {currentPrice}
            </div>
            <span
              className={`text-sm ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}
            </span>
          </div>
        )}
        <div className="font-sm font-mono text-center">
          <span className="text-gray-400">{selectedSymbol} | </span>
          <span className="text-green-400">{`${dateStr} | ${timeStr}`}</span>
        </div>
      </div>
      {/* <div className="mb-4 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span
            className={`w-3 h-3 rounded-full ${
              isConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          <span className="text-sm">
            {isConnected ? `Connected` : "Disconnected"}
          </span>
        </div>

        {currentPrice && (
          <div className="flex items-center gap-2">
            <span className="text-lg font-semibold">
              ${currentPrice.toFixed(2)}
            </span>
            <span
              className={`text-sm ${
                priceChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(2)}
            </span>
          </div>
        )}
      </div> */}

      <div
        ref={chartContainerRef}
        className="border rounded"
        style={{ width: "984px", height: "565px" }}
      />
    </div>
  );
};

export default StockChart;
