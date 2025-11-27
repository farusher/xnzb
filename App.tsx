import React, { useState, useRef, useCallback } from 'react';
import { SetupPanel } from './components/SetupPanel';
import { DanmakuList } from './components/DanmakuList';
import { FloatingHearts } from './components/FloatingHearts';
import { GiftEffect } from './components/GiftEffect';
import { User, Comment, StreamSettings } from './types';
import { DEFAULT_COMMENTS, GIFT_TYPES } from './constants';
import { generateFakeUsers } from './services/geminiService';
import { X, Heart, Gift, MoreHorizontal, Smile, Link as LinkIcon, Trophy, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

export default function App() {
  // App Mode
  const [hasStarted, setHasStarted] = useState(false);
  
  // Data State
  const [settings, setSettings] = useState<StreamSettings>({
    viewerCount: 4272,
    likeCount: 107000,
    hostName: "小喵悦读",
    hostAvatar: "https://picsum.photos/seed/catreader/200/200",
    filterType: 'soft',
  });
  
  const [fakeUsers, setFakeUsers] = useState<User[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [customComments, setCustomComments] = useState<string[]>(DEFAULT_COMMENTS);
  const [likeTrigger, setLikeTrigger] = useState(0);
  const [currentGift, setCurrentGift] = useState<{user: User, gift: any} | null>(null);

  // Clean Screen Mode State
  const [isCleanMode, setIsCleanMode] = useState(false);
  
  // Interaction Refs
  const longPressTimerRef = useRef<number | null>(null);
  const isLongPressRef = useRef(false);

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const intervalRef = useRef<number | null>(null);
  const giftTimerRef = useRef<number | null>(null);

  // Initialize Camera
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user', width: 1280, height: 720 }, 
        audio: false 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      streamRef.current = stream;
    } catch (err) {
      console.error("Camera access denied:", err);
    }
  };

  // Start Simulation
  const onStart = async () => {
    setHasStarted(true);
    await startCamera();
    
    // Generate some fake users for the session
    const users = await generateFakeUsers(20);
    setFakeUsers(users);

    // Start Loops
    startSimulationLoops(users);
  };

  // Simulation Logic (Comments, Likes, Gifts)
  const startSimulationLoops = (users: User[]) => {
    intervalRef.current = window.setInterval(() => {
      const rand = Math.random();
      
      // 1. Add Like
      if (rand < 0.4) {
        setSettings(s => ({ ...s, likeCount: s.likeCount + Math.floor(Math.random() * 5) }));
        if (Math.random() < 0.3) setLikeTrigger(t => t + 1);
      }

      // 2. Add Comment (Chat)
      if (rand < 0.2) {
        const user = users[Math.floor(Math.random() * users.length)];
        const content = customComments[Math.floor(Math.random() * customComments.length)];
        const newComment: Comment = {
          id: `c_${Date.now()}`,
          user,
          content,
          type: 'chat'
        };
        setComments(prev => [...prev.slice(-49), newComment]);
      }

      // 3. Join Message
      if (rand > 0.95) {
         const user = users[Math.floor(Math.random() * users.length)];
         setComments(prev => [...prev.slice(-49), {
           id: `j_${Date.now()}`,
           user,
           content: '',
           type: 'join'
         }]);
         setSettings(s => ({...s, viewerCount: s.viewerCount + 1}));
      }

      // 4. Gift
      if (rand > 0.985) {
        const user = users[Math.floor(Math.random() * users.length)];
        const gift = GIFT_TYPES[Math.floor(Math.random() * GIFT_TYPES.length)];
        
        // Clear existing timer if a new gift comes in to prevent early dismissal
        if (giftTimerRef.current) {
          window.clearTimeout(giftTimerRef.current);
        }

        setCurrentGift({ user, gift });
        
        // Clear gift display after 3s
        giftTimerRef.current = window.setTimeout(() => {
          setCurrentGift(null);
          giftTimerRef.current = null;
        }, 3000);
        
        setComments(prev => [...prev.slice(-49), {
           id: `g_${Date.now()}`,
           user,
           content: '',
           type: 'gift',
           giftName: gift.name,
           giftIcon: gift.icon
        }]);
      }

      // 5. Viewer Count Fluctuation (+/- 5)
      if (Math.random() < 0.5) {
         setSettings(s => {
             const fluctuation = Math.floor(Math.random() * 11) - 5; // -5 to +5
             return {
                 ...s,
                 viewerCount: Math.max(0, s.viewerCount + fluctuation)
             };
         });
      }

    }, 800); // Tick every 800ms
  };

  // --- Interaction Handlers ---

  const handleManualLike = () => {
    setLikeTrigger(t => t + 1);
    setSettings(s => ({ ...s, likeCount: s.likeCount + 1 }));
  };

  const handlePointerDown = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = window.setTimeout(() => {
      isLongPressRef.current = true;
      setIsCleanMode(prev => !prev); // Toggle clean mode on long press
    }, 600); // 600ms long press
  };

  const handlePointerUp = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = () => {
    // If it was a long press, do nothing (handled in timeout)
    if (isLongPressRef.current) return;

    // If in clean mode, a tap brings back the UI
    if (isCleanMode) {
      setIsCleanMode(false);
    }
  };

  // Record Function (Screen Share)
  const toggleRecording = async () => {
    if (isRecording) {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      }
      return;
    }

    try {
      const displayStream = await navigator.mediaDevices.getDisplayMedia({ 
        video: { displaySurface: 'browser' } as any, 
        audio: true 
      });
      
      const recorder = new MediaRecorder(displayStream);
      const chunks: Blob[] = [];
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `simulive_${Date.now()}.webm`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        displayStream.getTracks().forEach(track => track.stop());
        setIsRecording(false);
        mediaRecorderRef.current = null;
      };

      displayStream.getVideoTracks()[0].onended = () => {
         if (recorder.state !== 'inactive') {
             recorder.stop();
         }
      };
      
      recorder.start();
      mediaRecorderRef.current = recorder;
      setIsRecording(true);
    } catch (e) {
      console.error("Failed to start recording:", e);
      setIsRecording(false);
    }
  };

  if (!hasStarted) {
    return (
      <SetupPanel 
        settings={settings} 
        setSettings={setSettings} 
        onStart={onStart}
        customComments={customComments}
        setCustomComments={setCustomComments}
      />
    );
  }

  // Filter Styles
  const filterStyles = {
    none: 'none',
    soft: 'contrast(0.9) brightness(1.1) saturate(1.1) sepia(0.1)',
    warm: 'sepia(0.3) saturate(1.2) contrast(1.1)',
    cool: 'saturate(0.9) brightness(1.1) hue-rotate(10deg)',
    bw: 'grayscale(1)'
  };

  // Format numbers like "10.7万"
  const formatCount = (num: number) => {
      if (num >= 10000) return (num / 10000).toFixed(1) + '万';
      return num;
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black select-none font-sans text-white">
      
      {/* 1. Video Layer & Interaction Area */}
      <div 
        className="absolute inset-0 z-0"
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onClick={handleClick}
        onDoubleClick={handleManualLike}
      >
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted 
          className="w-full h-full object-cover"
          style={{ filter: filterStyles[settings.filterType] }}
        />
        {/* Bottom Gradient for Text Readability - Only show if NOT in clean mode */}
        <div className={`absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent transition-opacity duration-300 pointer-events-none ${isCleanMode ? 'opacity-0' : 'opacity-100'}`} />
      </div>

      {/* 2. UI Overlay Container (Hides in Clean Mode) */}
      <div className={`transition-opacity duration-300 ${isCleanMode ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        {/* Top Header Area */}
        <div className="absolute top-0 left-0 right-0 p-3 pt-4 z-20 flex justify-between items-start">
          
          {/* Left: Host Info Pill */}
          <div className="flex flex-col gap-2">
              <div className="flex items-center bg-black/40 backdrop-blur-md rounded-full p-[3px] pr-4 border border-white/10">
                <div className="relative">
                  <img src={settings.hostAvatar} className="w-9 h-9 rounded-full border border-white/20" alt="host"/>
                  <div className="absolute -bottom-1 -right-1 bg-[#FE2C55] rounded-full p-[2px]">
                     <span className="block w-2 h-2 bg-white rounded-full"></span>
                  </div>
                </div>
                <div className="ml-2 flex flex-col justify-center">
                  <div className="text-[14px] font-bold text-white max-w-[100px] truncate leading-tight shadow-sm">
                      {settings.hostName}
                  </div>
                  <div className="text-[10px] text-white/80 leading-tight shadow-sm">
                      {formatCount(settings.likeCount)}本场点赞
                  </div>
                </div>
                {/* Follow Button */}
                <button className="ml-3 bg-[#FE2C55] text-white text-[11px] px-3 py-1.5 rounded-full font-bold shadow-md active:scale-95 transition-transform">
                   关注
                </button>
              </div>
              
              {/* Rank/Badge Pill */}
              <div className="flex items-center gap-2 px-1">
                  <div className="bg-[#FFD700]/90 text-black/80 text-[10px] px-2 py-0.5 rounded flex items-center gap-1 font-bold shadow-sm backdrop-blur-sm">
                     <Trophy size={10} fill="currentColor" />
                     人气榜 Top 1
                  </div>
              </div>
          </div>

          {/* Right: Viewers & Close */}
          <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                 {/* Viewer Avatars */}
                 <div className="flex -space-x-2 overflow-hidden items-center">
                    {fakeUsers.slice(0, 3).map(u => (
                      <img key={u.id} src={u.avatar} className="w-8 h-8 rounded-full border border-white/20" alt="viewer"/>
                    ))}
                 </div>
                 
                 {/* Count Pill */}
                 <div className="bg-black/40 backdrop-blur-md rounded-full px-3 py-1.5 text-[12px] font-bold text-white/90 border border-white/10">
                   {settings.viewerCount}
                 </div>

                 {/* Close Button */}
                 <button className="bg-black/20 backdrop-blur-sm p-2 rounded-full active:bg-black/40" onClick={() => window.location.reload()}>
                   <X size={18} className="text-white" strokeWidth={2.5} />
                 </button>
              </div>

              {/* More Live Channels Button */}
               <div className="bg-white/10 backdrop-blur-md rounded-full px-2 py-1 text-[10px] flex items-center gap-1 text-white/90 font-medium border border-white/5">
                  <div className="w-2 h-2 rounded-full bg-[#FE2C55] animate-pulse"></div>
                  更多直播
                  <ChevronRight size={10} />
               </div>
          </div>
        </div>

        {/* ID Watermark */}
        <div className="absolute top-[130px] right-4 z-10 text-[10px] text-white/30 font-mono tracking-widest drop-shadow-md text-right">
          ID: 88484399<br/>SIMULIVE
        </div>

        {/* Danmaku List (Chat) */}
        <DanmakuList comments={comments} />

        {/* Bottom Interaction Bar */}
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-4 pt-2 z-30 flex items-center gap-3">
          
          {/* Chat Input */}
          <div className="flex-[0.5] bg-black/40 backdrop-blur-[4px] h-10 rounded-full flex items-center px-4 text-white/60 text-[14px] border border-white/10">
            说点什么...
          </div>
          
          {/* Icons Row */}
          <div className="flex-1 flex items-center justify-between pl-2">
              
              {/* Recording Toggle */}
              <button onClick={toggleRecording} className="active:scale-90 transition-transform">
                  {isRecording ? (
                       <div className="w-9 h-9 rounded-full bg-red-500/80 flex items-center justify-center animate-pulse border border-white/20">
                          <div className="w-3 h-3 bg-white rounded-[2px]" />
                       </div>
                  ) : (
                      <Smile size={32} className="text-white drop-shadow-lg opacity-90" strokeWidth={1.5} />
                  )}
              </button>

              {/* Link / Interact */}
               <button className="active:scale-90 transition-transform">
                  <LinkIcon size={32} className="text-white drop-shadow-lg opacity-90" strokeWidth={1.5} />
               </button>

              {/* Gift (Pink Box) */}
              <button className="active:scale-90 transition-transform relative">
                  <Gift size={32} className="text-[#FE2C55] drop-shadow-lg" strokeWidth={1.5} fill="rgba(254, 44, 85, 0.2)" />
              </button>
              
              {/* Heart / Fan Club */}
              <button onClick={handleManualLike} className="active:scale-90 transition-transform flex items-center justify-center">
                  <div className="relative">
                      <Heart size={32} className="text-[#FE2C55] drop-shadow-lg" strokeWidth={1.5} fill="#FE2C55" />
                  </div>
              </button>

               {/* More (...) */}
               <button className="active:scale-90 transition-transform">
                  <MoreHorizontal size={32} className="text-white drop-shadow-lg opacity-90" strokeWidth={1.5} />
               </button>
          </div>
        </div>

        {/* Gift Animation Overlay */}
        <AnimatePresence>
          {currentGift && (
             <GiftEffect key={currentGift.gift.name + currentGift.user.id + Date.now()} gift={currentGift.gift} user={currentGift.user} />
          )}
        </AnimatePresence>

        {/* Floating Hearts Layer */}
        <FloatingHearts trigger={likeTrigger} />
      </div>
      
      {/* Clean Mode Hint (Fade in/out logic handled by parent opacity, but maybe we want a separate toast?) */}
      {/* Optional: Add a small toast if we wanted to say "Entered Clean Mode", but typically the visual change is enough. */}

    </div>
  );
}