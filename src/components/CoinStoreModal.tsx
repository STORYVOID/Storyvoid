import React, { useState } from 'react';

interface CoinStoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBuyCoins: (coinsToAdd: number, amount: number) => void;
}

export const CoinStoreModal: React.FC<CoinStoreModalProps> = ({ isOpen, onClose, onBuyCoins }) => {
  const [selectedPack, setSelectedPack] = useState<{ coins: number; price: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  if (!isOpen) return null;

  const coinPacks = [
    { coins: 50, price: 29 },
    { coins: 150, price: 79 },
    { coins: 400, price: 199 },
    { coins: 1000, price: 449 },
  ];

  const handlePayment = () => {
    if (!selectedPack) return;
    setIsProcessing(true);

    // Simulate UPI / PhonePe / GPay payment gateway delay
    setTimeout(() => {
      setIsProcessing(false);
      onBuyCoins(selectedPack.coins, selectedPack.price);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setSelectedPack(null);
        onClose();
      }, 2000);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
      <div className="bg-[#16131c] border border-orange-500/50 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
        <div className="flex justify-between items-center border-b border-gray-800 pb-3">
          <h3 className="text-sm font-black text-orange-500 uppercase tracking-wider">💰 Coin Store (Top-Up)</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white text-xs font-bold cursor-pointer">✕</button>
        </div>

        {showSuccess ? (
          <div className="text-center py-6 space-y-2">
            <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
              ✓
            </div>
            <h4 className="text-sm font-bold text-white">Payment Successful!</h4>
            <p className="text-[11px] text-gray-300">Coins added to your wallet successfully.</p>
          </div>
        ) : isProcessing ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="text-xs text-gray-300 font-medium">Processing UPI / PhonePe Payment...</p>
          </div>
        ) : (
          <>
            <p className="text-[11px] text-gray-400">Choose a coin pack to unlock premium audio episodes instantly:</p>
            
            <div className="grid grid-cols-2 gap-2.5">
              {coinPacks.map((pack, idx) => (
                <div 
                  key={idx}
                  onClick={() => setSelectedPack(pack)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all text-center ${selectedPack?.coins === pack.coins ? 'bg-orange-500/20 border-orange-500 shadow-md' : 'bg-[#121017] border-gray-800 hover:border-gray-700'}`}
                >
                  <div className="text-yellow-400 text-sm font-black">🟡 {pack.coins} Coins</div>
                  <div className="text-xs font-bold text-white mt-1">₹{pack.price}</div>
                </div>
              ))}
            </div>

            {selectedPack && (
              <div className="pt-2 space-y-2">
                <div className="bg-[#121017] p-2.5 rounded-xl border border-gray-800 text-[10px] text-gray-300 flex justify-between items-center">
                  <span>Pay via UPI / PhonePe / GPay</span>
                  <span className="text-orange-400 font-bold">₹{selectedPack.price}</span>
                </div>
                <button 
                  onClick={handlePayment}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-bold py-2.5 rounded-xl text-xs shadow-lg cursor-pointer"
                >
                  Pay Now & Get {selectedPack.coins} Coins
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
