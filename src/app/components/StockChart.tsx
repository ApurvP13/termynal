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

interface StockChartProps {
  selectedSymbol: string;
  mode: "stocks" | "crypto";
}

const StockChart: React.FC<StockChartProps> = ({ selectedSymbol, mode }) => {
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const chart = useRef<any>(null);
  const areaSeries = useRef<any>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [priceChange, setPriceChange] = useState<number>(0);
  const initialPriceRef = useRef<number | null>(null);

  // Format symbol based on mode
  const formatSymbolForFinnhub = (
    symbol: string,
    mode: "stocks" | "crypto"
  ): string => {
    if (mode === "crypto") {
      // Finnhub crypto format examples:
      // Bitcoin: BINANCE:BTCUSDT, COINBASE:BTC-USD
      // Ethereum: BINANCE:ETHUSDT, COINBASE:ETH-USD
      const upperSymbol = symbol.toUpperCase();

      // Try to format for major exchanges
      if (upperSymbol.includes(":")) {
        return upperSymbol; // Already formatted (e.g., "BINANCE:BTCUSDT")
      }

      // Auto-format common symbols
      const cryptoMappings: { [key: string]: string } = {
        BTC: "COINBASE:BTC-USD",
        ETH: "COINBASE:ETH-USD",
        ADA: "COINBASE:ADA-USD",
        SOL: "COINBASE:SOL-USD",
        DOT: "COINBASE:DOT-USD",
        MATIC: "COINBASE:MATIC-USD",
        AVAX: "COINBASE:AVAX-USD",
        LINK: "COINBASE:LINK-USD",
        UNI: "COINBASE:UNI-USD",
        DOGE: "COINBASE:DOGE-USD",
        LTC: "COINBASE:LTC-USD",
        XRP: "COINBASE:XRP-USD",
      };

      return cryptoMappings[upperSymbol] || `COINBASE:${upperSymbol}-USD`;
    } else {
      // Stock format is just the symbol
      return symbol.toUpperCase();
    }
  };

  // Get display symbol (remove exchange prefix for crypto)
  const getDisplaySymbol = (
    fullSymbol: string,
    mode: "stocks" | "crypto"
  ): string => {
    if (mode === "crypto" && fullSymbol.includes(":")) {
      const parts = fullSymbol.split(":");
      if (parts.length > 1) {
        // Convert COINBASE:BTC-USD to BTC
        return parts[1].split("-")[0];
      }
    }
    return fullSymbol;
  };

  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef.current) return;

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

    areaSeries.current = chart.current.addSeries(AreaSeries, {
      lineColor: "#00C853",
      topColor: "rgba(0, 200, 83, 0.5)",
      bottomColor: "rgba(255, 255, 255, 0)",
    });

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

  // WebSocket connection and symbol subscription
  useEffect(() => {
    // Clean up previous connection
    if (wsRef.current) {
      wsRef.current.close();
    }

    // Reset states for new symbol
    setCurrentPrice(null);
    setPriceChange(0);
    initialPriceRef.current = null;

    // Clear chart data
    if (areaSeries.current) {
      areaSeries.current.setData([]);
    }

    // Don't connect if no symbol is selected
    if (!selectedSymbol) return;

    const initWebSocket = () => {
      try {
        const API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY;

        if (!API_KEY) {
          console.error("Finnhub API key is not configured");
          return;
        }

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

          // Format symbol for Finnhub based on mode
          const formattedSymbol = formatSymbolForFinnhub(selectedSymbol, mode);

          // Subscribe to symbol trades
          ws.send(
            JSON.stringify({
              type: "subscribe",
              symbol: formattedSymbol,
            })
          );

          console.log(`Subscribed to ${formattedSymbol} trades (${mode} mode)`);
        };

        ws.onmessage = (event) => {
          try {
            console.log("Raw WebSocket message:", event.data); // Debug log
            const message: FinnhubTradeMessage = JSON.parse(event.data);
            console.log("Parsed message:", message); // Debug log

            if (
              message.type === "trade" &&
              message.data &&
              areaSeries.current
            ) {
              const formattedSymbol = formatSymbolForFinnhub(
                selectedSymbol,
                mode
              );

              console.log(
                "Looking for symbol:",
                formattedSymbol,
                "in trades:",
                message.data
              ); // Debug log

              message.data.forEach((trade) => {
                if (trade.s === formattedSymbol) {
                  const tradeData = {
                    time: Math.floor(trade.t / 1000),
                    value: trade.p,
                  };

                  areaSeries.current.update(tradeData);

                  if (initialPriceRef.current === null) {
                    initialPriceRef.current = trade.p;
                  }

                  setCurrentPrice(trade.p);
                  const change = trade.p - (initialPriceRef.current || trade.p);
                  setPriceChange(change);

                  // Update colors based on price change
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
                    `${formattedSymbol}: $${trade.p} at ${new Date(
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
  }, [selectedSymbol, mode]);

  const formatDateTime = () => {
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
    return { dateStr, timeStr };
  };

  const { dateStr, timeStr } = formatDateTime();
  const displaySymbol = getDisplaySymbol(selectedSymbol, mode);

  if (!selectedSymbol) {
    return (
      <div className="w-full flex items-center justify-center h-96">
        <p className="text-gray-400 text-lg">
          Search for a {mode === "stocks" ? "stock" : "crypto"} symbol to view
          the chart
        </p>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col items-start gap-4 p-4">
      {/* Header Info */}
      <div className="flex font-mono flex-col gap-2 items-start">
        <div className="flex items-center gap-4">
          {/* Connection Status */}
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                isConnected ? "bg-green-500" : "bg-red-500"
              }`}
            ></span>
            <span className="text-sm text-gray-400">
              {isConnected ? "Connected" : "Connecting..."}
            </span>
          </div>

          {/* Mode Badge */}
          <div className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-300 uppercase">
            {mode}
          </div>

          {/* API Source */}
          <div className="px-2 py-1 bg-blue-900/30 rounded text-xs text-blue-300">
            Finnhub
          </div>

          {/* Exchange Info for Crypto */}
          {mode === "crypto" && (
            <div className="px-2 py-1 bg-purple-900/30 rounded text-xs text-purple-300">
              Coinbase
            </div>
          )}
        </div>

        {/* Price Display */}
        {currentPrice && (
          <div className="flex gap-3 items-center">
            <div className="text-3xl text-white">
              <span className="text-lg">$</span>
              {currentPrice.toFixed(mode === "crypto" ? 6 : 2)}
            </div>
            <span
              className={`text-sm font-medium ${
                priceChange >= 0 ? "text-green-400" : "text-red-400"
              }`}
            >
              {priceChange >= 0 ? "+" : ""}
              {priceChange.toFixed(mode === "crypto" ? 6 : 2)}
            </span>
          </div>
        )}

        {/* Symbol and Time */}
        <div className="text-sm font-mono">
          <span className="text-gray-400 font-bold">
            {displaySymbol.toUpperCase()}
          </span>
          <span className="text-gray-500"> | </span>
          <span className="text-green-400">
            {dateStr} | {timeStr}
          </span>
        </div>
      </div>

      {/* Chart */}
      <div
        ref={chartContainerRef}
        className="border border-gray-700 rounded-lg bg-gray-900/50"
        style={{ width: "984px", height: "565px" }}
      />
    </div>
  );
};

export default StockChart;
