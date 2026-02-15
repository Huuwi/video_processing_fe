
import React, { useState, useRef, useEffect } from 'react';
import Draggable from 'react-draggable';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Save, Upload, RotateCcw, MonitorPlay, Loader2, Video as VideoIcon, BookmarkPlus, Play, Square } from 'lucide-react';
import PresetForm from './PresetForm';

interface VbeeVoice {
  code: string;
  name: string;
  gender: string;
  language_code: string;
  demo: string;
}

interface VideoEditorProps {
  video: any;
  onSave: () => void;
}

const VideoEditor: React.FC<VideoEditorProps> = ({ video, onSave }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const draggableNodeRef = useRef<HTMLDivElement>(null);
  const subtitleNodeRef = useRef<HTMLDivElement>(null);
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 });
  const [subtitlePos, setSubtitlePos] = useState({ x: 0, y: 0 });
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoFileKey, setLogoFileKey] = useState<string>('');
  const [aspectRatio, setAspectRatio] = useState<'9:16' | '16:9'>('9:16');
  const [scale] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [sampleVideoUrl, setSampleVideoUrl] = useState<string>('');
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [showSavePresetModal, setShowSavePresetModal] = useState(false);

  // Subtitle customization
  const [subtitleColor, setSubtitleColor] = useState<string>('#FFFFFF');
  const [subtitleBgColor, setSubtitleBgColor] = useState<string>('#000000');
  const [subtitlePosition, setSubtitlePosition] = useState<'top' | 'middle' | 'bottom'>('bottom');
  const [subtitleFontSize, setSubtitleFontSize] = useState<number>(21);
  const [subtitleLanguage, setSubtitleLanguage] = useState<string>('vietnamese');
  const [subtitleVoiceCode, setSubtitleVoiceCode] = useState<string>('');
  const [voices, setVoices] = useState<VbeeVoice[]>([]);
  const [loadingVoices, setLoadingVoices] = useState(false);
  const [playingDemo, setPlayingDemo] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [subtitleWidth, setSubtitleWidth] = useState<number>(300);
  
  // Title editing state
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [videoTitle, setVideoTitle] = useState(video?.title || 'Untitled Video');

  // Batch edit mode detection
  const isBatchEdit = (video as any)?.isBatchEdit || false;
  const batchVideoIds = (video as any)?.batchVideoIds || []; // percentage of container width

  // Update title when video changes
  useEffect(() => {
    setVideoTitle(video?.title || 'Untitled Video');
  }, [video?.title]);

  useEffect(() => {
    const fetchSampleVideo = async () => {
      // Skip fetching sample video in batch edit mode
      if (!video?._id || isBatchEdit) return;
      setLoadingVideo(true);
      try {
        const token = localStorage.getItem('access_token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/videos/${video._id}/sample-presigned-url`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSampleVideoUrl(response.data.url);
      } catch (err) {
        console.error('Failed to fetch presigned URL:', err);
      } finally {
        setLoadingVideo(false);
      }
    };
    fetchSampleVideo();
  }, [video?._id, isBatchEdit]);

  // Fetch voices when language changes
  useEffect(() => {
    const fetchVoices = async () => {
      setLoadingVoices(true);
      setSubtitleVoiceCode('');
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.get(
          `${import.meta.env.VITE_API_URL}/videos/voices?language=${subtitleLanguage}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setVoices(res.data || []);
        if (res.data?.length > 0) {
          setSubtitleVoiceCode(res.data[0].code);
        }
      } catch (err) {
        console.error('Failed to fetch voices:', err);
        setVoices([]);
      } finally {
        setLoadingVoices(false);
      }
    };
    fetchVoices();
  }, [subtitleLanguage]);

  const handlePlayDemo = (voiceCode: string) => {
    const voice = voices.find(v => v.code === voiceCode);
    if (!voice?.demo) return;

    if (playingDemo === voiceCode && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlayingDemo(null);
      return;
    }

    if (audioRef.current) {
      audioRef.current.pause();
    }

    const audio = new Audio(voice.demo);
    audioRef.current = audio;
    setPlayingDemo(voiceCode);
    audio.play();
    audio.onended = () => {
      setPlayingDemo(null);
      audioRef.current = null;
    };
  };

  // Reset subtitle and logo when aspect ratio changes
  useEffect(() => {
    // Reset subtitle
    setSubtitlePos({ x: 0, y: 0 });
    setSubtitleColor('#FFFFFF');
    setSubtitleBgColor('#000000');
    setSubtitlePosition('bottom');
    setSubtitleFontSize(21);
    setSubtitleWidth(300);
    
    // Reset logo
    setLogoUrl(null);
    setLogoFile(null);
    setLogoFileKey('');
    setLogoPos({ x: 0, y: 0 });
  }, [aspectRatio]);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Store file for later upload
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoUrl(objectUrl);
  };

  const handleDeleteLogo = () => {
    setLogoUrl(null);
    setLogoFile(null);
    setLogoFileKey('');
    setLogoPos({ x: 0, y: 0 });
  };

  const calculatePercentages = () => {
    if (containerRef.current) {
      console.log("containerRef.current", containerRef.current);
      
      const { width, height } = containerRef.current.getBoundingClientRect();
      const logoXPercent = (logoPos.x / width) * 100;
      const logoYPercent = (logoPos.y / height) * 100;
      const subtitleXPercent = (subtitlePos.x / width) * 100;
      const subtitleYPercent = (subtitlePos.y / height) * 100;
      return { logoXPercent, logoYPercent, subtitleXPercent, subtitleYPercent };
    }
    return { logoXPercent: 0, logoYPercent: 0, subtitleXPercent: 0, subtitleYPercent: 0 };
  };

  const handleSave = async () => {
    setIsSaving(true);
    const { logoXPercent, logoYPercent, subtitleXPercent, subtitleYPercent } = calculatePercentages();
    
    try {
      if (!video || (!video._id && !isBatchEdit)) return;

      // Upload logo to MinIO if exists
      let uploadedLogoKey = logoFileKey;
      if (logoFile && !logoFileKey) {
        try {
          const formData = new FormData();
          formData.append('logo', logoFile);
          const token = localStorage.getItem('access_token');
          const response = await axios.post(
            `${import.meta.env.VITE_API_URL}/videos/${video._id}/upload-logo`,
            formData,
            { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' } }
          );
          uploadedLogoKey = response.data.fileKey;
          setLogoFileKey(uploadedLogoKey);
        } catch (err) {
          console.error('Failed to upload logo:', err);
          toast.error('Failed to upload logo');
          setIsSaving(false);
          return;
        }
      }

      const token = localStorage.getItem('access_token');
      
      // Batch edit mode: save to all selected videos
      if (isBatchEdit) {
        const editConfig = {
          logo: uploadedLogoKey ? { 
            file_key: uploadedLogoKey, 
            position_x: logoXPercent, 
            position_y: logoYPercent, 
            scale: scale,
            x: logoPos.x,
            y: logoPos.y,
            width: draggableNodeRef.current?.getBoundingClientRect().width || 0,
            height: draggableNodeRef.current?.getBoundingClientRect().height || 0
          } : undefined,
          subtitle: {
            color: subtitleColor,
            bg_color: subtitleBgColor,
            position: subtitlePosition,
            position_x: subtitleXPercent,
            position_y: subtitleYPercent,
            x: subtitlePos.x,
            y: subtitlePos.y,
            width: subtitleWidth,
            height: subtitleNodeRef.current?.offsetHeight || 0,
            font_size: subtitleFontSize,
          },
          language: subtitleLanguage,
          voice_code: subtitleVoiceCode,
          resize_mode: aspectRatio
        };

        await axios.post(
          `${import.meta.env.VITE_API_URL}/videos/batch-edit`,
          { videoIds: batchVideoIds, editConfig },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        toast.success(`Successfully applied edits to ${batchVideoIds.length} videos!`);
        onSave();
        return;
      }
      console.log({
          logo:  {
            file_key: uploadedLogoKey,
            scale: scale,
            x: logoPos.x,
            y: logoPos.y,
            width: draggableNodeRef.current?.getBoundingClientRect().width || 0,
            height: draggableNodeRef.current?.getBoundingClientRect().height || 0
          } ,
          subtitle: {
            color: subtitleColor,
            bg_color: subtitleBgColor,
            x: subtitlePos.x,
            y: subtitlePos.y,
            width: subtitleWidth,
            height: subtitleNodeRef.current?.offsetHeight || 0,
            font_size: subtitleFontSize,
          },
          language: subtitleLanguage,
          voice_code: subtitleVoiceCode,
          resize_mode: aspectRatio
        },);
      

      // Normal single video edit
      await axios.post(
        `${import.meta.env.VITE_API_URL}/videos/${video._id}/save-edit`,
        {
          logo: uploadedLogoKey ? {
            file_key: uploadedLogoKey,
            position_x: logoXPercent,
            position_y: logoYPercent,
            scale: scale,
            x: logoPos.x,
            y: logoPos.y,
            width: draggableNodeRef.current?.getBoundingClientRect().width || 0,
            height: draggableNodeRef.current?.getBoundingClientRect().height || 0
          } : undefined,
          subtitle: {
            color: subtitleColor,
            bg_color: subtitleBgColor,
            position: subtitlePosition,
            position_x: subtitleXPercent,
            position_y: subtitleYPercent,
            x: subtitlePos.x,
            y: subtitlePos.y,
            width: subtitleWidth,
            height: subtitleNodeRef.current?.offsetHeight || 0,
            font_size: subtitleFontSize,
          },
          language: subtitleLanguage,
          voice_code: subtitleVoiceCode,
          resize_mode: aspectRatio
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Simulate delay
      await new Promise(r => setTimeout(r, 1000));
      toast.success('Edit Saved! Processing started.');
      onSave();
    } catch (err) {
      console.error(err);
      toast.error('Failed to save');
    } finally {
        setIsSaving(false);
    }
  };

  const handleTitleUpdate = async () => {
    if (!video || (!video._id && !isBatchEdit)) return;
    if (isBatchEdit) return; // Don't update title in batch mode
    
    try {
      const token = localStorage.getItem('access_token');
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/videos/${video._id}`,
        { title: videoTitle },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setIsEditingTitle(false);
    } catch (err) {
      console.error('Failed to update title:', err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header with Editable Title */}
        <div className="mb-6 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center justify-between">
            {isEditingTitle ? (
              <input
                type="text"
                value={videoTitle}
                onChange={(e) => setVideoTitle(e.target.value)}
                onBlur={handleTitleUpdate}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleTitleUpdate();
                  if (e.key === 'Escape') {
                    setVideoTitle(video?.title || 'Untitled Video');
                    setIsEditingTitle(false);
                  }
                }}
                autoFocus
                className="text-2xl font-bold text-white bg-gray-800 border border-blue-500 rounded px-3 py-1 outline-none focus:ring-2 focus:ring-blue-500 flex-1"
              />
            ) : (
              <h2 
                className="text-2xl font-bold text-white cursor-pointer hover:text-blue-400 transition-colors group flex items-center gap-2"
                onClick={() => !isBatchEdit && setIsEditingTitle(true)}
                title={isBatchEdit ? "" : "Click to edit title"}
              >
                {videoTitle}
                {!isBatchEdit && (
                  <span className="opacity-0 group-hover:opacity-100 text-sm text-gray-500">✏️</span>
                )}
              </h2>
            )}
            <button 
              onClick={onSave} 
              className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-lg"
            >
              ✕
            </button>
          </div>
        </div>

    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Canvas Area */}
      <div className="flex-1 w-full flex justify-center bg-gray-900/50 rounded-2xl border border-gray-800 p-8 shadow-inner">
        <div 
            ref={containerRef}
            className="relative bg-black shadow-2xl overflow-hidden rounded-lg ring-1 ring-white/10"
            style={{ 
              width: aspectRatio === '9:16' ? '360px' : '640px', 
              height: aspectRatio === '9:16' ? '640px' : '360px' 
            }}
        >
             {/* Grid Overlay for alignment help */}
            <div className="absolute inset-0 pointer-events-none z-10 opacity-20" 
                 style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}>
            </div>

            {loadingVideo ? (
                <div className="w-full h-full flex items-center justify-center text-white">
                    <Loader2 className="animate-spin" size={48} />
                </div>
            ) : sampleVideoUrl ? (
                <video 
                    src={sampleVideoUrl}
                    className="w-full h-full object-cover opacity-80"
                    controls
                    muted
                    loop
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                    <VideoIcon size={64} />
                </div>
            )}
            
            {/* Logo overlay layer - z-30 */}
            <div className="absolute inset-0 z-30 pointer-events-none">
                {logoUrl && (
                    <Draggable
                        nodeRef={draggableNodeRef}
                        bounds="parent"
                        position={logoPos}
                        onDrag={(_e: any, data: any) => setLogoPos({ x: data.x, y: data.y })}
                    >
                        <div ref={draggableNodeRef} className="cursor-move inline-block group relative pointer-events-auto" style={{ transform: `scale(${scale})` }}>
                            <div className="absolute inset-0 border-2 border-dashed border-blue-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg pointer-events-none" />
                            <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" draggable={false} />
                        </div>
                    </Draggable>
                )}
            </div>
                
            {/* Subtitle overlay layer - z-20 */}
            <div className="absolute inset-0 z-20 pointer-events-none">
                <Draggable
                    nodeRef={subtitleNodeRef}
                    bounds="parent"
                    position={subtitlePos}
                    onDrag={(_e: any, data: any) => setSubtitlePos({ x: data.x, y: data.y })}
                >
                    <div 
                        ref={subtitleNodeRef} 
                        className="cursor-move group relative pointer-events-auto"
                        style={{
                            width: `${subtitleWidth}px`,
                            padding: '8px 16px',
                            borderRadius: '4px',
                            fontSize: `${subtitleFontSize}px`,
                            color: subtitleColor,
                            backgroundColor: subtitleBgColor,
                            fontWeight: 'bold',
                            textAlign: 'center',
                            position: 'relative'
                        }}
                    >
                        <div className="absolute inset-0 border-2 border-dashed border-green-500 opacity-0 group-hover:opacity-100 transition-opacity rounded pointer-events-none" />
                        Sample subtitle text
                        
                        {/* Resize Handles */}
                        <div 
                            className="absolute top-0 right-0 w-4 h-4 bg-green-500 rounded-full opacity-0 group-hover:opacity-100 cursor-se-resize"
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
        </div>
      </div>

      {/* Controls Area */}
      <div className="w-full lg:w-80 bg-gray-900 border border-gray-800 rounded-xl p-6 shadow-xl">
          <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-800">
              <MonitorPlay className="text-blue-500" />
              <div>
                  <h3 className="font-bold text-white">Editor Controls</h3>
                  <p className="text-xs text-gray-500">Customize your video output</p>
              </div>
          </div>

          <div className="space-y-6">
              <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Upload Logo</label>
                  <label htmlFor="video-logo-upload" className="flex items-center justify-center w-full h-32 border-2 border-gray-700 border-dashed rounded-lg cursor-pointer hover:border-blue-500/50 hover:bg-gray-800/50 transition-all group">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Upload className="w-8 h-8 mb-2 text-gray-500 group-hover:text-blue-400 transition-colors" />
                          <p className="text-sm text-gray-500 group-hover:text-gray-300">Click to upload</p>
                      </div>
                      <input type="file" id="video-logo-upload" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                  {logoUrl && (
                      <button
                          type="button"
                          onClick={handleDeleteLogo}
                          className="mt-2 w-full py-2 px-4 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                          <RotateCcw size={16} />
                          Remove Logo
                      </button>
                  )}
              </div>

              <div>
                  <label className="block text-sm font-medium text-gray-400 mb-2">Aspect Ratio</label>
                  <div className="grid grid-cols-2 gap-2">
                      <button
                          onClick={() => setAspectRatio('9:16')}
                          className={`py-2 px-4 rounded-lg font-medium transition-all ${
                              aspectRatio === '9:16'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                          9:16 Short
                      </button>
                      <button
                          onClick={() => setAspectRatio('16:9')}
                          className={`py-2 px-4 rounded-lg font-medium transition-all ${
                              aspectRatio === '16:9'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                          }`}
                      >
                          16:9 Landscape
                      </button>
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                  <div>
                      <label htmlFor="video-text-color" className="block text-sm font-medium text-gray-400 mb-2">Text Color</label>
                      <input
                          type="color"
                          id="video-text-color"
                          value={subtitleColor}
                          onChange={(e) => setSubtitleColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                  </div>
                  <div>
                      <label htmlFor="video-bg-color" className="block text-sm font-medium text-gray-400 mb-2">Background</label>
                      <input
                          type="color"
                          id="video-bg-color"
                          value={subtitleBgColor}
                          onChange={(e) => setSubtitleBgColor(e.target.value)}
                          className="w-full h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700"
                      />
                  </div>
              </div>

              <div>
                  <label htmlFor="video-font-size" className="block text-sm font-medium text-gray-400 mb-2">Font Size</label>
                  <input
                          type="range"
                          id="video-font-size"
                          min="16"
                          max="48"
                          value={subtitleFontSize}
                          onChange={(e) => setSubtitleFontSize(Number(e.target.value))}
                          className="w-full"
                      />
                  <div className="text-xs text-gray-500 mt-1 text-center">{subtitleFontSize}px</div>
              </div>

              <div>
                  <label htmlFor="video-language" className="block text-sm font-medium text-gray-400 mb-2">Subtitle Language</label>
                  <select
                      id="video-language"
                      value={subtitleLanguage}
                      onChange={(e) => setSubtitleLanguage(e.target.value)}
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

              <div>
                  <label htmlFor="video-voice" className="block text-sm font-medium text-gray-400 mb-2">Voice</label>
                  {loadingVoices ? (
                      <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                          <Loader2 className="animate-spin" size={14} />
                          Loading voices...
                      </div>
                  ) : (
                      <div className="space-y-2">
                          <select
                              id="video-voice"
                              value={subtitleVoiceCode}
                              onChange={(e) => setSubtitleVoiceCode(e.target.value)}
                              className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:ring-2 focus:ring-blue-500 outline-none"
                          >
                              {voices.map((v) => (
                                  <option key={v.code} value={v.code}>
                                      {v.name} ({v.gender})
                                  </option>
                              ))}
                          </select>
                          {subtitleVoiceCode && (
                              <button
                                  type="button"
                                  onClick={() => handlePlayDemo(subtitleVoiceCode)}
                                  className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
                                      playingDemo === subtitleVoiceCode
                                          ? 'bg-red-600/20 text-red-400 border border-red-500/30'
                                          : 'bg-gray-800 text-gray-300 border border-gray-700 hover:bg-gray-700 hover:text-white'
                                  }`}
                              >
                                  {playingDemo === subtitleVoiceCode ? (
                                      <><Square size={12} /> Stop Preview</>
                                  ) : (
                                      <><Play size={12} /> Preview Voice</>
                                  )}
                              </button>
                          )}
                      </div>
                  )}
              </div>

              <div className="pt-4 border-t border-gray-800">
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-blue-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      {isSaving ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                      {isSaving ? 'Processing...' : 'Save Changes'}
                  </button>
                  <button 
                    onClick={() => setShowSavePresetModal(true)}
                    className="w-full mt-3 flex items-center justify-center gap-2 text-blue-400 hover:text-blue-300 py-2 text-sm transition-colors border border-blue-500/30 rounded-lg hover:bg-blue-500/10"
                  >
                      <BookmarkPlus size={16} />
                      Save as Preset
                  </button>
                  <button onClick={() => setLogoUrl(null)} className="w-full mt-2 flex items-center justify-center gap-2 text-gray-400 hover:text-white py-2 text-sm transition-colors">
                      <RotateCcw size={14} />
                      Reset Editor
                  </button>
              </div>
          </div>
      </div>
      </div>
      </div>
      
      {showSavePresetModal && (
        <PresetForm
          initialData={{
            name: '',
            config: {
               logo: logoFileKey, // Note: This might be empty if new logo uploaded but not saved yet. 
                                  // Ideally we should warn user or handle logo upload first if they want it in preset.
                                  // But for now we pass what we have.
               subtitle: {
                 color: subtitleColor,
                 bg_color: subtitleBgColor,
                 position: subtitlePosition,
                 font_size: subtitleFontSize,
                 width_percent: subtitleWidth,
               },
               language: subtitleLanguage,
               voice_code: subtitleVoiceCode,
               resize_mode: aspectRatio
            }
          }}
          onSave={() => {
            setShowSavePresetModal(false);
            toast.success('Preset saved successfully!');
          }}
          onCancel={() => setShowSavePresetModal(false)}
        />
      )}
    </div>
  );
};

export default VideoEditor;
