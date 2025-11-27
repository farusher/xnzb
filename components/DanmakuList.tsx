import React, { useEffect, useRef } from 'react';
import { Comment } from '../types';

interface DanmakuListProps {
  comments: Comment[];
}

export const DanmakuList: React.FC<DanmakuListProps> = ({ comments }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [comments]);

  return (
    <div 
      ref={containerRef}
      className="absolute bottom-[60px] left-0 w-[80%] max-h-[35%] overflow-y-auto no-scrollbar px-3 pb-2 z-20 space-y-1.5 font-sans"
      style={{
        maskImage: 'linear-gradient(to bottom, transparent, black 10%)',
        WebkitMaskImage: 'linear-gradient(to bottom, transparent, black 10%)'
      }}
    >
        {/* Welcome / System Message */}
        <div className="bg-[#FF2C55]/20 px-2 py-0.5 rounded-[4px] inline-block mb-2 border-l-2 border-[#FF2C55]">
            <p className="text-[#FF2C55] text-[12px] font-bold shadow-sm">
                系统公告: 严禁未成年人直播打赏。
            </p>
        </div>

        {comments.map((c) => (
          <div key={c.id} className="animate-fade-in-up flex items-start text-shadow-outline leading-5">
            
            {/* 1. Gift Message */}
            {c.type === 'gift' && (
               <div className="bg-gradient-to-r from-[#FE2C55]/80 to-[#FE2C55]/0 px-2.5 py-1 rounded-full flex items-center gap-1.5 mb-0.5">
                 <div className="bg-yellow-500 text-white text-[9px] px-1 rounded-[2px] font-bold border border-white/20">
                    Lv.{c.user.level}
                 </div>
                 <span className="text-white font-bold text-[13px]">{c.user.name}:</span>
                 <span className="text-yellow-300 font-bold text-[13px]">送出 {c.giftName}</span>
                 <span className="text-lg">{c.giftIcon}</span>
               </div>
            )}
            
            {/* 2. Join Message */}
            {c.type === 'join' && (
              <div className="bg-black/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1.5 border border-white/5 backdrop-blur-[1px]">
                <div className="bg-gray-400/80 text-white text-[9px] px-1 rounded-[2px] font-bold">
                    Lv.{c.user.level}
                </div>
                <span className="text-white/80 font-bold text-[13px]">{c.user.name}</span>
                <span className="text-white/80 text-[13px]">来了</span>
              </div>
            )}

            {/* 3. Regular Chat */}
            {c.type === 'chat' && (
              <div className="inline-block px-1.5 py-0.5 rounded-lg bg-black/10 backdrop-blur-[0.5px]">
                {/* Level Badge */}
                <span className="inline-block bg-[#48B5FF] text-white text-[9px] px-[3px] h-[14px] leading-[14px] rounded-[2px] font-bold mr-1.5 align-middle shadow-sm">
                    Lv.{c.user.level}
                </span>
                
                {/* Fan Badge (Randomly stylized) */}
                {c.user.level > 10 && (
                     <span className="inline-block bg-[#FF8855] text-white text-[9px] px-[3px] h-[14px] leading-[14px] rounded-[2px] font-bold mr-1.5 align-middle shadow-sm">
                        粉丝 {Math.floor(c.user.level / 2)}
                    </span>
                )}

                {/* Name */}
                <span className="text-white/70 font-medium text-[13px] mr-1 align-middle">
                    {c.user.name}:
                </span>
                
                {/* Content */}
                <span className="text-white text-[13px] font-normal align-middle drop-shadow-md">
                    {c.content}
                </span>
              </div>
            )}
          </div>
        ))}
    </div>
  );
};