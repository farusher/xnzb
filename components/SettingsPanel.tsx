import React, { useState } from 'react';
import { StreamSettings } from '../types';
import { generateHostAvatar } from '../services/geminiService';
import { Settings, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

interface SettingsPanelProps {
  settings: StreamSettings;
  setSettings: React.Dispatch<React.SetStateAction<StreamSettings>>;
  onStart: () => void;
  customComments: string[];
  setCustomComments: React.Dispatch<React.SetStateAction<string[]>>;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({ 
  settings, 
  setSettings, 
  onStart,
  customComments,
  setCustomComments
}) => {
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);

  const handleAvatarGenerate = async () => {
    setIsGeneratingAvatar(true);
    const avatar = await generateHostAvatar(`A high quality profile photo of ${settings.hostName || 'a chinese streamer'}, beauty filter style, bright lighting`);
    if (avatar) {
      setSettings(prev => ({ ...prev, hostAvatar: avatar }));
    }
    setIsGeneratingAvatar(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
        setCustomComments(prev => [...prev, ...lines]);
        alert(`Imported ${lines.length} custom comments!`);
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900 text-white p-6 overflow-y-auto">
      <div className="max-w-md mx-auto space-y-8">
        <h1 className="text-3xl font-bold text-center text-pink-500 mb-8">虚拟直播助手 Setup</h1>
        
        {/* Host Info */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Settings size={20} /> 主播设置
          </h2>
          
          <div className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 bg-gray-700">
               <img src={settings.hostAvatar} alt="Host" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 space-y-2">
              <input 
                type="text" 
                value={settings.hostName}
                onChange={(e) => setSettings(s => ({...s, hostName: e.target.value}))}
                className="w-full bg-gray-700 rounded px-3 py-2"
                placeholder="主播昵称"
              />
              <button 
                onClick={handleAvatarGenerate}
                disabled={isGeneratingAvatar}
                className="text-xs bg-indigo-600 hover:bg-indigo-700 px-3 py-1 rounded flex items-center gap-1 disabled:opacity-50"
              >
                {isGeneratingAvatar ? <RefreshCw className="animate-spin" size={12} /> : <ImageIcon size={12}/>}
                AI生成头像 (Nano Banana)
              </button>
            </div>
          </div>
        </div>

        {/* Live Config */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">直播间配置</h2>
          
          <div>
            <label className="block text-sm text-gray-400 mb-1">初始观看人数</label>
            <input 
              type="number" 
              value={settings.viewerCount}
              onChange={(e) => setSettings(s => ({...s, viewerCount: parseInt(e.target.value)}))}
              className="w-full bg-gray-700 rounded px-3 py-2"
            />
          </div>

          <div>
             <label className="block text-sm text-gray-400 mb-1">画面滤镜</label>
             <select 
               value={settings.filterType}
               onChange={(e) => setSettings(s => ({...s, filterType: e.target.value as any}))}
               className="w-full bg-gray-700 rounded px-3 py-2"
             >
               <option value="none">原相机</option>
               <option value="soft">柔美 (Soft)</option>
               <option value="warm">暖阳 (Warm)</option>
               <option value="cool">冷白皮 (Cool)</option>
               <option value="bw">黑白 (Mono)</option>
             </select>
          </div>
        </div>

        {/* Content Source */}
        <div className="bg-gray-800 p-4 rounded-xl space-y-4">
          <h2 className="text-xl font-semibold">弹幕内容</h2>
          <div className="flex items-center justify-between bg-gray-700 p-3 rounded">
            <span>当前库内弹幕数: {customComments.length}</span>
            <label className="cursor-pointer bg-gray-600 hover:bg-gray-500 px-3 py-1 rounded text-sm flex items-center gap-1">
              <Upload size={14} />
              导入TXT
              <input type="file" accept=".txt" className="hidden" onChange={handleFileUpload} />
            </label>
          </div>
          <p className="text-xs text-gray-400">
             提示：长按屏幕可开启/关闭“清屏模式”。
          </p>
        </div>

        <button 
          onClick={onStart}
          className="w-full bg-gradient-to-r from-pink-500 to-red-500 text-white font-bold py-4 rounded-full text-xl shadow-lg transform active:scale-95 transition-transform"
        >
          开始直播
        </button>

        <div className="text-center text-gray-500 text-xs mt-4">
            Generated by Gemini 2.5 • Developed with React & Tailwind
        </div>
      </div>
    </div>
  );
}