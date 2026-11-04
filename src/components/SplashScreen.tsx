import React from 'react';

export const SplashScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 bg-[#0f0d13] flex flex-col items-center justify-center z-50 select-none animate-fadeIn">
      <div className="relative text-center space-y-3 px-4">
        <div className="absolute -inset-4 bg-orange-500/20 rounded-full blur-2xl animate-pulse"></div>
        
        <h1 className="relative text-4xl sm:text-5xl font-black tracking-widest text-orange-500 drop-shadow-[0_0_25px_rgba(249,115,22,0.6)] animate-bounce">
          STORYVOID
        </h1>
        <p className="relative text-xs uppercase tracking-[0.3em] text-gray-400 font-bold">
          ⚡ Serialized Audio Universe ⚡
        </p>

        <div className="w-32 h-1 bg-gray-800 mx-auto rounded-full overflow-hidden mt-6">
          <div className="w-full h-full bg-orange-500 animate-[pulse_1s_infinite]"></div>
        </div>
      </div>
    </div>
  );
};
