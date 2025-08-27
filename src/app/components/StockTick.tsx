import React from "react";
import { FaSortDown } from "react-icons/fa6";

interface StockTickProps {
  image: string;
  name: string;
  price: number;
  isPositive: boolean;
  changePercent?: number;
}

const StockTick: React.FC<StockTickProps> = ({
  image,
  name,
  price,
  isPositive,
}) => {
  const formatPrice = (price: number) => {
    return price.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="flex items-center gap-3">
      <img src={image} alt={`logo of ${name}`} className="w-12 h-12 " />
      <div className="flex flex-col items-start gap-0.5 font-pixel">
        <p className="text-3xl  text-white text-left uppercase">{name}</p>

        <div className="flex gap-2 items-center justify-center">
          <p
            className={`text-3xl text-center ${
              !isPositive ? "text-[#E23D3D]" : "text-[#00C853]"
            }`}
          >
            {`$ ${price}`}
          </p>
          <FaSortDown
            className={`size-5 ${
              !isPositive ? "fill-[#E23D3D]" : "fill-[#00C853]"
            } ${isPositive ? "rotate-180" : ""}`}
          />
        </div>
      </div>
    </div>
  );
};

export default StockTick;

// // Usage Examples:
// const App = () => {
//   return (
//     <div className="bg-black min-h-screen p-8 space-y-4">
//       <h2 className="text-white text-xl mb-4">StockTick Component Examples</h2>

//       {/* Bitcoin Example */}
//       <StockTick
//         image="https://cryptologos.cc/logos/bitcoin-btc-logo.png"
//         name="BTC(USD)"
//         price={45184}
//         isPositive={false}
//       />

//       {/* Tesla Example */}
//       <StockTick
//         image="https://logo.clearbit.com/tesla.com"
//         name="TSLA"
//         price={338.33}
//         isPositive={true}
//       />

//       {/* Apple Example */}
//       <StockTick
//         image="https://logo.clearbit.com/apple.com"
//         name="AAPL"
//         price={227.52}
//         isPositive={true}
//       />

//       {/* Ethereum Example */}
//       <StockTick
//         image="https://cryptologos.cc/logos/ethereum-eth-logo.png"
//         name="ETH(USD)"
//         price={2847.91}
//         isPositive={false}
//       />
//     </div>
//   );
// };
