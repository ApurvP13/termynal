"use client";
import React, { useState } from "react";
import { Search } from "lucide-react";

interface NavBarProps {
  onStockSelect: (symbol: string) => void;
  onModeChange: (mode: "stocks" | "crypto") => void;
  selectedMode: "stocks" | "crypto";
}

const NavBar: React.FC<NavBarProps> = ({
  onStockSelect,
  onModeChange,
  selectedMode,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onStockSelect(searchQuery.toUpperCase().trim());
      setSearchQuery("");
    }
  };

  const handleModeToggle = (mode: "stocks" | "crypto") => {
    onModeChange(mode);
  };

  return (
    <nav className="w-full bg-gray-900 border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-white">
          Term<span className="text-green-400">Y</span>nal
        </div>

        {/* Center Toggle */}
        <div className="flex items-center bg-gray-800 rounded-lg p-1">
          <button
            onClick={() => handleModeToggle("stocks")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedMode === "stocks"
                ? "bg-green-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => handleModeToggle("crypto")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              selectedMode === "crypto"
                ? "bg-green-500 text-white"
                : "text-gray-400 hover:text-white"
            }`}
          >
            Crypto
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Anything"
              className="bg-gray-800 text-white placeholder-gray-400 pl-10 pr-4 py-2 rounded-lg border border-gray-700 focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default NavBar;
