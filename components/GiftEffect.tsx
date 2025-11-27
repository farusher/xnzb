import React from 'react';
import { motion } from 'framer-motion';
import { User } from '../types';

interface GiftEffectProps {
  gift: { name: string; icon: string; value: number };
  user: User;
}

export const GiftEffect: React.FC<GiftEffectProps> = ({ gift, user }) => {
  return (
    <div className="absolute top-0 left-0 right-0 bottom-0 pointer-events-none flex items-center justify-center z-50">
       <motion.div 
         initial={{ opacity: 0, scale: 0.5 }}
         animate={{ opacity: 1, scale: 1 }}
         exit={{ opacity: 0, scale: 1.5, filter: "blur(20px)" }}
         transition={{ type: "spring", damping: 12, stiffness: 200 }}
         className="relative flex flex-col items-center"
       >
         {/* Rotating Starburst Background */}
         <motion.div 
           animate={{ rotate: 360 }}
           transition={{ duration: 10, ease: "linear", repeat: Infinity }}
           className="absolute -z-10 w-[500px] h-[500px] opacity-60"
           style={{
             background: 'conic-gradient(from 0deg, transparent 0deg, rgba(255, 200, 0, 0.4) 20deg, transparent 40deg, transparent 180deg, rgba(255, 200, 0, 0.4) 200deg, transparent 220deg)',
             filter: 'blur(30px)'
           }}
         />

         {/* Particle Explosion */}
         {Array.from({ length: 16 }).map((_, i) => (
            <motion.div
               key={i}
               initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
               animate={{ 
                  x: (Math.random() - 0.5) * 500,
                  y: (Math.random() - 0.5) * 500,
                  opacity: 0,
                  scale: Math.random() + 0.5
               }}
               transition={{ duration: 0.8, ease: "easeOut" }}
               className="absolute rounded-full shadow-[0_0_10px_white]"
               style={{
                  backgroundColor: ['#FFD700', '#FF2C55', '#FFFFFF', '#4DEEEA'][i % 4],
                  width: Math.random() * 8 + 4,
                  height: Math.random() * 8 + 4,
               }}
            />
         ))}

         {/* Main Gift Icon */}
         <motion.div
            animate={{ 
              y: [0, -10, 0], 
              rotate: [0, -5, 5, 0],
              scale: [1, 1.1, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="text-9xl drop-shadow-[0_0_35px_rgba(255,200,0,0.8)] z-10 filter"
         >
            {gift.icon}
         </motion.div>

         {/* Gift Banner */}
         <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring" }}
            className="mt-8 bg-gradient-to-r from-[#FE2C55] to-[#FF0055] p-[3px] rounded-full shadow-[0_10px_30px_rgba(254,44,85,0.4)]"
         >
            <div className="bg-black/80 backdrop-blur-md rounded-full px-8 py-2 flex items-center gap-4">
               <img src={user.avatar} className="w-12 h-12 rounded-full border-2 border-[#FFD700]" alt="user"/>
               <div className="flex flex-col">
                  <span className="text-xs text-yellow-400 font-bold tracking-wider">{user.name}</span>
                  <span className="text-white text-base font-bold">送出 {gift.name}</span>
               </div>
               <div className="flex flex-col items-center leading-none ml-2">
                 <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Combo</span>
                 <span className="text-4xl font-black italic text-[#FFD700] drop-shadow-[0_2px_0_rgba(0,0,0,0.5)]">
                   x1
                 </span>
               </div>
            </div>
         </motion.div>
       </motion.div>
    </div>
  );
};
