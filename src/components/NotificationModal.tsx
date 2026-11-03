import React from 'react';

interface NotificationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  onClose: () => void;
  isSuccess?: boolean;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  title,
  message,
  onClose,
  isSuccess = true,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-[#1a1721] border border-orange-500/50 rounded-2xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto text-xl font-bold ${isSuccess ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
          {isSuccess ? '✨' : '❌'}
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h3>
          <p className="text-xs text-gray-300 mt-1 leading-relaxed">{message}</p>
        </div>
        <button 
          onClick={onClose}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold py-2.5 rounded-xl shadow-lg cursor-pointer transition-all"
        >
          OK, Got it
        </button>
      </div>
    </div>
  );
};
