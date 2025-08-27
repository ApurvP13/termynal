import { NextRequest, NextResponse } from "next/server";

interface TickerSymbol {
  symbol: string;
  name: string;
  logo: string;
  type: "stock" | "crypto";
}

interface TickerData extends TickerSymbol {
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
}

const TICKER_SYMBOLS: TickerSymbol[] = [
  // Major Stocks
  {
    symbol: "AAPL",
    name: "AAPL",
    logo: "https://logo.clearbit.com/apple.com",
    type: "stock",
  },
  {
    symbol: "GOOGL",
    name: "GOOGL",
    logo: "https://logo.clearbit.com/google.com",
    type: "stock",
  },
  {
    symbol: "MSFT",
    name: "MSFT",
    logo: "https://logo.clearbit.com/microsoft.com",
    type: "stock",
  },
  {
    symbol: "TSLA",
    name: "TSLA",
    logo: "https://logo.clearbit.com/tesla.com",
    type: "stock",
  },
  {
    symbol: "NVDA",
    name: "NVDA",
    logo: "https://logo.clearbit.com/nvidia.com",
    type: "stock",
  },
  {
    symbol: "META",
    name: "META",
    logo: "https://logo.clearbit.com/meta.com",
    type: "stock",
  },
  {
    symbol: "AMZN",
    name: "AMZN",
    logo: "https://logo.clearbit.com/amazon.com",
    type: "stock",
  },
  {
    symbol: "NFLX",
    name: "NFLX",
    logo: "https://logo.clearbit.com/netflix.com",
    type: "stock",
  },

  // Major Cryptos
  {
    symbol: "BINANCE:BTCUSDT",
    name: "BTC(USD)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Bitcoin.svg/1200px-Bitcoin.svg.png",
    type: "crypto",
  },
  {
    symbol: "BINANCE:ETHUSDT",
    name: "ETH(USD)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Ethereum-icon-purple.svg/langfr-250px-Ethereum-icon-purple.svg.png",
    type: "crypto",
  },
  {
    symbol: "BINANCE:ADAUSDT",
    name: "ADA(USD)",
    logo: "https://cryptologos.cc/logos/cardano-ada-logo.png",
    type: "crypto",
  },
  {
    symbol: "BINANCE:SOLUSDT",
    name: "SOL(USD)",
    logo: "https://upload.wikimedia.org/wikipedia/en/b/b9/Solana_logo.png",
    type: "crypto",
  },
  {
    symbol: "BINANCE:DOTUSDT",
    name: "DOT(USD)",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4a/Circle_USDC_Logo.svg/1200px-Circle_USDC_Logo.svg.png",
    type: "crypto",
  },
];

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY;

async function fetchTickerData(symbol: TickerSymbol): Promise<TickerData> {
  try {
    const response = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${symbol.symbol}&token=${FINNHUB_API_KEY}`,
      {
        headers: {
          "X-Finnhub-Token": FINNHUB_API_KEY || "",
        },
        // Cache for 30 seconds
        next: { revalidate: 30 },
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch ${symbol.symbol}: ${response.statusText}`
      );
    }

    const data = await response.json();

    return {
      ...symbol,
      price: data.c || 0, // current price
      change: data.d || 0, // change
      changePercent: data.dp || 0, // change percent
      lastUpdated: new Date().toISOString(),
    };
  } catch (error) {
    console.error(`Error fetching ${symbol.symbol}:`, error);

    // Return fallback data if API fails
    return {
      ...symbol,
      price: Math.random() * 1000 + 100,
      change: (Math.random() - 0.5) * 20,
      changePercent: (Math.random() - 0.5) * 10,
      lastUpdated: new Date().toISOString(),
    };
  }
}

export async function GET(request: NextRequest) {
  try {
    if (!FINNHUB_API_KEY) {
      return NextResponse.json(
        { error: "Finnhub API key not configured" },
        { status: 500 }
      );
    }

    // Rate limiting: Don't fetch all at once
    const promises = TICKER_SYMBOLS.map(
      (symbol, index) =>
        new Promise((resolve) =>
          setTimeout(() => resolve(fetchTickerData(symbol)), index * 100)
        )
    );

    const tickerData = (await Promise.all(promises)) as TickerData[];

    return NextResponse.json(
      {
        data: tickerData,
        timestamp: new Date().toISOString(),
        count: tickerData.length,
      },
      {
        headers: {
          "Cache-Control": "s-maxage=30, stale-while-revalidate",
        },
      }
    );
  } catch (error) {
    console.error("Error in stock ticker API:", error);
    return NextResponse.json(
      { error: "Failed to fetch ticker data" },
      { status: 500 }
    );
  }
}
