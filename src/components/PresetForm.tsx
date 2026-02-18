import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Save, Loader2, Upload, Play, Square } from 'lucide-react';
import Draggable from 'react-draggable';
import axios from 'axios';

interface VbeeVoice {
  code: string;
  name: string;
  gender: string;
  language_code: string;
  demo: string;
}

interface PresetFormProps {
  initialData?: any;
  onSave: () => void;
  onCancel: () => void;
}

const PresetForm: React.FC<PresetFormProps> = ({ initialData, onSave, onCancel }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [isDefault, setIsDefault] = useState(initialData?.isDefault || false);
  const [resizeMode, setResizeMode] = useState<'9:16' | '16:9'>(initialData?.config?.resize_mode || '9:16');
  
  // Subtitle settings
  const [subtitleColor, setSubtitleColor] = useState(initialData?.config?.subtitle?.color || '#FFFFFF');
  const [subtitleBgColor, setSubtitleBgColor] = useState(initialData?.config?.subtitle?.bg_color || 'transparent');
  const [subtitleFontSize, setSubtitleFontSize] = useState(initialData?.config?.subtitle?.font_size || 21);
  const [subtitleWidth, setSubtitleWidth] = useState(initialData?.config?.subtitle?.width || 300);
  const [language, setLanguage] = useState(initialData?.config?.language || 'vietnamese');
  const [voiceCode, setVoiceCode] = useState(initialData?.config?.voice_code || '');
  const [voices, setVoices] = useState<VbeeVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const audioPreviewRef = useRef<HTMLAudioElement | null>(null);
  
  // Positions (percentages)
  const [subtitlePos, setSubtitlePos] = useState({ x: 0, y: 0 }); // We'll convert to % on save
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 }); // We'll convert to % on save

  // Logo settings
  const [logoFile, setLogoFile] = useState<File | null>(null);
  
  const getInitialLogoKey = () => {
      if (!initialData?.config?.logo) return '';
      // Handle both old string format and new object format
      return typeof initialData.config.logo === 'string' 
          ? initialData.config.logo 
          : initialData.config.logo.file_key || '';
  };

  const initialLogoKey = getInitialLogoKey();

  const [logoPreview, setLogoPreview] = useState<string | null>(
    initialLogoKey ? `${import.meta.env.VITE_API_URL}/files/${initialLogoKey}` : null
  );
  const [logoFileKey, setLogoFileKey] = useState<string>(initialLogoKey);
  
  const getInitialLogoScale = () => {
      if (initialData?.config?.logo?.scale) return initialData.config.logo.scale;
      if (initialData?.config?.logo_scale) return initialData.config.logo_scale;
      return 1;
  };

  const [logoScale, setLogoScale] = useState(getInitialLogoScale());

  const [isLoading, setIsLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);

  // Initialize positions from existing config (if any)
  useEffect(() => {
    if (containerRef.current && initialData?.config) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        
        if (initialData.config.subtitle) {
            const sx = (initialData.config.subtitle.position_x / 100) * width;
            const sy = (initialData.config.subtitle.position_y / 100) * height;
            setSubtitlePos({ x: sx || 0, y: sy || 0 });
        }

        if (initialData.config.logo) {
             let lx = 0;
             let ly = 0;
             
             if (typeof initialData.config.logo === 'object' && initialData.config.logo.position_x !== undefined) {
                 lx = (initialData.config.logo.position_x / 100) * width;
                 ly = (initialData.config.logo.position_y / 100) * height;
             } else if (initialData.config.logo_x !== undefined) {
                 // Fallback for flat structure
                 lx = (initialData.config.logo_x / 100) * width;
                 ly = (initialData.config.logo_y / 100) * height;
             }
             
             setLogoPos({ x: lx || 0, y: ly || 0 });
        }
    }
  }, [initialData, resizeMode]);

  // Fetch voices when language changes
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      setVoiceCode('');
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/videos/voices?language=${language}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVoices(res.data || []);
        if (res.data?.length > 0) {
          setVoiceCode(initialData?.config?.subtitle?.voice_code || res.data[0].code);
        }
      } catch (err) {
        console.error('Failed to fetch voices:', err);
        setVoices([]);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, [language]);

  const handlePlayDemo = (code: string) => {
    const voice = voices.find(v => v.code === code);
    if (!voice?.demo) return;
    if (playingDemo === code && audioPreviewRef.current) {
      audioPreviewRef.current.pause();
      audioPreviewRef.current = null;
      setPlayingDemo(null);
      return;
    }
    if (audioPreviewRef.current) audioPreviewRef.current.pause();
    const audio = new Audio(voice.demo);
    audioPreviewRef.current = audio;
    setPlayingDemo(code);
    audio.play();
    audio.onended = () => { setPlayingDemo(null); audioPreviewRef.current = null; };
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLogoFile(file);
    setLogoPreview(URL.createObjectURL(file));
  };
  
    const calculatePercentages = () => {
    if (containerRef.current) {
      const { width, height } = containerRef.current.getBoundingClientRect();
      
      const subX = (subtitlePos.x / width) * 100;
      const subY = (subtitlePos.y / height) * 100;
      
      const logoX = (logoPos.x / width) * 100;
      const logoY = (logoPos.y / height) * 100;

      return { subX, subY, logoX, logoY };
    }
    return { subX: 0, subY: 80, logoX: 5, logoY: 5 }; // Defaults
  };

  const handleResizeChange = (mode: '9:16' | '16:9') => {
    setResizeMode(mode);
    // Reset positions and scales
    setSubtitlePos({ x: 0, y: 0 });
    setLogoPos({ x: 0, y: 0 });
    setSubtitleWidth(300);
    setLogoScale(1);
  };

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Vui lòng nhập tên template');
      return;
    }
    
    setIsLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      
      // Upload logo if new file selected
      let finalLogoKey = logoFileKey;
      if (logoFile) {
          try {
            const formData = new FormData();
            formData.append('file', logoFile);
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/files/upload`, formData, {
              headers: { 
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
              }
            });
            finalLogoKey = res.data.key;
            setLogoFileKey(finalLogoKey);
          } catch (err) {
            console.error('Failed to upload logo:', err);
            toast.error('Failed to upload logo image');
            setIsLoading(false);
            return;
          }
      }
      
      const { subX, subY, logoX, logoY } = calculatePercentages();

      const config = {
        logo: finalLogoKey ? {
          file_key: finalLogoKey,
          position_x: logoX,
          position_y: logoY,
          scale: logoScale,
          x: logoPos.x,
          y: logoPos.y,
          width: logoRef.current?.getBoundingClientRect().width || 0,
          height: logoRef.current?.getBoundingClientRect().height || 0
        } : undefined,
        subtitle: {
          color: subtitleColor,
          bg_color: subtitleBgColor,
          position: 'bottom',
          position_x: subX,
          position_y: subY,
          x: subtitlePos.x,
          y: subtitlePos.y,
          font_size: subtitleFontSize,
          width: subtitleWidth,
          height: subtitleRef.current?.offsetHeight || 0,
        },
        language: language,
        voice_code: voiceCode,
        resize_mode: resizeMode
      };

      const payload = { name, config, isDefault };

      if (initialData?._id) {
        await axios.patch(`${import.meta.env.VITE_API_URL}/edit-presets/${initialData._id}`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post(`${import.meta.env.VITE_API_URL}/edit-presets`, payload, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      
      onSave();
    } catch (error) {
      console.error('Failed to save preset:', error);
      toast.error('Failed to save preset');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-[#1a1a1a] border border-gray-800 rounded-2xl w-full max-w-6xl h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-[#111]">
          <div className="flex items-center gap-4">
             <input 
              type="text" 
              value={name} 
              onChange={e => setName(e.target.value)}
              className="bg-transparent text-xl font-bold text-white border-b border-transparent hover:border-gray-700 focus:border-blue-500 outline-none px-2 py-1 transition-all"
              placeholder="Điền Tên template"
              autoFocus
            />
             <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-gray-800/50 border border-gray-700">
                <input 
                  type="checkbox" 
                  id="isDefault" 
                  checked={isDefault} 
                  onChange={e => setIsDefault(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-500"
                />
                <label htmlFor="isDefault" className="text-xs text-gray-300 font-medium cursor-pointer">Default Preset</label>
             </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={onCancel} className="p-2 hover:bg-gray-800 rounded-full text-gray-400 hover:text-white transition-colors">
                <X size={24} />
             </button>
          </div>
        </div>
        
        <div className="flex-1 flex overflow-hidden">
            {/* Left: Preview Canvas */}
            <div className="flex-1 bg-[#0f0f0f] flex items-center justify-center p-8 relative overflow-hidden">
                 {/* Background Pattern */}
                 <div className="absolute inset-0 opacity-10 pointer-events-none" 
                      style={{ backgroundImage: 'radial-gradient(#333 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
                 </div>
                 
                 <div 
                    ref={containerRef}
                    className="relative bg-black shadow-2xl overflow-hidden ring-1 ring-white/10 group transition-all duration-300"
                    style={{ 
                        width: resizeMode === '9:16' ? '360px' : '640px', 
                        height: resizeMode === '9:16' ? '640px' : '360px',
                        backgroundImage: 'linear-gradient(45deg, #1a1a1a 25%, #262626 25%, #262626 50%, #1a1a1a 50%, #1a1a1a 75%, #262626 75%, #262626 100%)',
                        backgroundSize: '40px 40px'
                    }}
                 >
                    {/* Placeholder Text in Background */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
                        <span className="text-4xl font-bold text-white/20 -rotate-12">VIDEO PREVIEW</span>
                    </div>

                    {/* Draggable Logo */}
                    {logoPreview && (
                        <Draggable
                            nodeRef={logoRef}
                            bounds="parent"
                            position={logoPos}
                            onDrag={(_e, data) => setLogoPos({ x: data.x, y: data.y })}
                        >
                            <div ref={logoRef} className="absolute cursor-move z-20 group/logo">
                                <img 
                                    src={logoPreview} 
                                    alt="Logo" 
                                    className="object-contain"
                                    style={{ height: `${60 * logoScale}px` }} 
                                />
                                <div className="absolute -inset-2 border-2 border-blue-500 opacity-0 group-hover/logo:opacity-100 rounded-lg pointer-events-none transition-opacity" />
                            </div>
                        </Draggable>
                    )}

                    {/* Draggable Subtitle */}
                    <Draggable
                        nodeRef={subtitleRef}
                        bounds="parent"
                        position={subtitlePos}
                        onDrag={(_e, data) => setSubtitlePos({ x: data.x, y: data.y })}
                    >
                         <div
                            ref={subtitleRef}
                            className="absolute cursor-move z-20 hover:ring-2 hover:ring-green-500 rounded p-2 transition-all group/sub"
                            style={{
                                width: `${subtitleWidth}px`,
                                padding: '8px 16px',
                                borderRadius: '4px',
                                color: subtitleColor, 
                                fontSize: `${subtitleFontSize}px`,
                                backgroundColor: subtitleBgColor,
                                fontWeight: 'bold',
                                textAlign: 'center',
                            }}
                         >
                            <div className="absolute inset-0 border-2 border-dashed border-green-500 opacity-0 group-hover/sub:opacity-100 transition-opacity rounded pointer-events-none" />
                            <span className="pointer-events-none select-none">Sample Subtitle Text</span>
                            
                            {/* Resize Handle */}
                            <div 
                                className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover/sub:opacity-100 cursor-se-resize z-50"
                                style={{ transform: 'translate(50%, -50%)' }}
                                onMouseDown={(e) => {
                                    e.stopPropagation();
                                    const startX = e.clientX;
                                    const startWidth = subtitleWidth;
                                    
                                    const handleMouseMove = (moveEvent: MouseEvent) => {
                                        const deltaX = moveEvent.clientX - startX;
                                        const newWidth = Math.max(100, Math.min(600, startWidth + deltaX));
                                        setSubtitleWidth(newWidth);
                                    };
                                    
                                    const handleMouseUp = () => {
                                        document.removeEventListener('mousemove', handleMouseMove);
                                        document.removeEventListener('mouseup', handleMouseUp);
                                    };
                                    
                                    document.addEventListener('mousemove', handleMouseMove);
                                    document.addEventListener('mouseup', handleMouseUp);
                                }}
                            />
                         </div>
                    </Draggable>
                 </div>
                 
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-black/60 backdrop-blur px-4 py-2 rounded-full text-xs text-gray-400 shadow-lg border border-white/10">
                    Preview Mode: {resizeMode}
                 </div>
            </div>

            {/* Right: Controls Sidebar */}
            <div className="w-80 bg-[#161616] border-l border-gray-800 p-6 overflow-y-auto custom-scrollbar flex flex-col gap-6">
                 
                 {/* Logo Settings (Moved to Top) */}
                 <div>
                    <div className="flex items-center gap-2 text-gray-300 pb-2 mb-2 border-b border-gray-800">
                        <h3 className="text-sm font-bold">Upload Logo</h3>
                    </div>
                    
                    <label htmlFor="logo-upload" className="flex items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/50 transition-all group relative">
                        {logoPreview ? (
                             <div className="w-full h-full flex items-center justify-center overflow-hidden relative p-2">
                                <img src={logoPreview} alt="Logo" className="max-w-full max-h-full object-contain" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <span className="text-xs text-white bg-black/50 px-2 py-1 rounded">Click to Change</span>
                                </div>
                             </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-8 h-8 mb-2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                                <p className="text-sm text-gray-500 group-hover:text-gray-300">Click to upload</p>
                            </div>
                        )}
                        <input type="file" id="logo-upload" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    </label>
                    
                    {logoPreview && (
                        <div className="mt-2 space-y-2">
                            <button
                                type="button"
                                onClick={() => { setLogoPreview(null); setLogoFile(null); setLogoFileKey(''); }}
                                className="w-full py-2 px-4 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-xs"
                            >
                                <X size={14} />
                                Remove Logo
                            </button>
                             <div>
                                <label htmlFor="logo-scale" className="text-xs text-gray-500 mb-1 block">Scale ({logoScale.toFixed(1)}x)</label>
                                <input type="range" id="logo-scale" min="0.5" max="2" step="0.1" value={logoScale} onChange={e => setLogoScale(Number(e.target.value))} className="w-full accent-blue-500" />
                            </div>
                        </div>
                    )}
                 </div>

                 {/* Aspect Ratio */}
                 <div>
                    <span className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</span>
                    <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleResizeChange('9:16')} className={`py-2 px-4 rounded-lg font-medium transition-all text-sm ${resizeMode === '9:16' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            9:16 Short
                        </button>
                        <button onClick={() => handleResizeChange('16:9')} className={`py-2 px-4 rounded-lg font-medium transition-all text-sm ${resizeMode === '16:9' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}>
                            16:9 Landscape
                        </button>
                    </div>
                 </div>

                 {/* Colors */}
                 <div className="grid grid-cols-2 gap-3">
                     <div>
                        <label htmlFor="preset-text-color" className="block text-sm font-medium text-gray-400 mb-2">Text Color</label>
                        <div className="h-10 bg-gray-800 rounded-lg border border-gray-700 flex items-center px-1 cursor-pointer relative overflow-hidden">
                             <input type="color" id="preset-text-color" value={subtitleColor} onChange={e => setSubtitleColor(e.target.value)} className="w-full h-full opacity-0 absolute inset-0 cursor-pointer" />
                             <div className="w-full h-8 rounded border border-gray-600 shadow-sm" style={{ backgroundColor: subtitleColor }} />
                        </div>
                     </div>
                     <div>
                        <label htmlFor="preset-bg-color" className="block text-sm font-medium text-gray-400 mb-2">Background</label>
                        <div className="h-10 bg-gray-800 rounded-lg border border-gray-700 flex items-center px-1 cursor-pointer relative overflow-hidden">
                             <input type="color" id="preset-bg-color" value={subtitleBgColor} onChange={e => setSubtitleBgColor(e.target.value)} className="w-full h-full opacity-0 absolute inset-0 cursor-pointer" />
                             <div className="w-full h-8 rounded border border-gray-600 shadow-sm" style={{ backgroundColor: subtitleBgColor === 'transparent' ? 'transparent' : subtitleBgColor }} />
                        </div>
                     </div>
                 </div>

                 {/* Font Size */}
                 <div>
                    <label htmlFor="font-size" className="block text-sm font-medium text-gray-400 mb-2">Font Size</label>
                    <input type="range" id="font-size" min="16" max="48" value={subtitleFontSize} onChange={e => setSubtitleFontSize(Number(e.target.value))} className="w-full accent-blue-500" />
                    <div className="text-xs text-gray-500 mt-1 text-center">{subtitleFontSize}px</div>
                 </div>

                 {/* Language */}
                 <div>
                    <label htmlFor="language-select" className="block text-sm font-medium text-gray-400 mb-2">Language</label>
                    <select 
                        id="language-select"
                        value={language} 
                        onChange={(e) => setLanguage(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="vietnamese">Vietnamese</option>
                        <option value="english">English</option>
                        <option value="japanese">Japanese</option>
                        <option value="korean">Korean</option>
                        <option value="chinese">Chinese</option>
                        <option value="thai">Thai</option>
                    </select>
                 </div>

                 {/* Voice Selector */}
                 <div>
                    <label htmlFor="voice-select" className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
                    {loadingVoices ? (
                        <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                            <Loader2 className="animate-spin" size={14} />
                            Loading voices...
                        </div>
                    ) : (
                        <div className="space-y-2">
                            <select
                                id="voice-select"
                                value={voiceCode}
                                onChange={(e) => setVoiceCode(e.target.value)}
                                className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                            >
                                {voices.map((v) => (
                                    <option key={v.code} value={v.code}>
                                        {v.name} ({v.gender})
                                    </option>
                                ))}
                            </select>
                            {voiceCode && (
                                <button
                                    type="button"
                                    onClick={() => handlePlayDemo(voiceCode)}
                                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                                        playingDemo === voiceCode
                                            ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                            : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    {playingDemo === voiceCode ? (
                                        <><Square size={12} /> Stop Preview</>
                                    ) : (
                                        <><Play size={12} /> Preview Voice</>
                                    )}
                                </button>
                            )}
                        </div>
                    )}
                 </div>

                 <div className="flex-1" /> {/* Spacer */}

                 {/* Main Save Button (Moved to Bottom) */}
                 <div className="pt-4 border-t border-gray-800">
                     <button 
                        onClick={handleSubmit} 
                        disabled={isLoading}
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Preset
                     </button>
                 </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default PresetForm;
