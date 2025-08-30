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
    <nav className="w-full  px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-medium font-mono text-white">
          Term<span className="text-green-400 font-logo">Y</span>nal
        </div>

        {/* Center Toggle */}
        <div className="flex gap-3 font-sans items-center bg-white/10 rounded-[40px] p-2.5">
          <button
            onClick={() => handleModeToggle("stocks")}
            className={`px-4 py-2.5 rounded-[40px] text-sm font-medium transition-all ${
              selectedMode === "stocks"
                ? "underline decoration-1 decoration-[#6BE95F]"
                : "text-[#999999] hover:text-white"
            }`}
          >
            Stocks
          </button>
          <button
            onClick={() => handleModeToggle("crypto")}
            className={` px-4 py-2.5 rounded-[40px] text-sm font-medium transition-all ${
              selectedMode === "crypto"
                ? "underline decoration-1 decoration-[#6BE95F] underline-offset-2"
                : "text-[#999999] hover:text-white"
            }`}
          >
            Crypto
          </button>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="relative">
          <div className="flex items-center">
            <Search className="absolute left-3 w-4 h-4 text-white" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Anything"
              className="bg-white/10 font-mono text-white placeholder-white/30 pl-10 pr-4 py-2 rounded-[20px]  focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500 w-64"
            />
          </div>
        </form>
      </div>
    </nav>
  );
};

export default NavBar;
