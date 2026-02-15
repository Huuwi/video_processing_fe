import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Wand2, Loader2 } from 'lucide-react';
import axios from 'axios';

interface AutoEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedVideoIds: string[];
  onSuccess: () => void;
}

const AutoEditModal: React.FC<AutoEditModalProps> = ({ isOpen, onClose, selectedVideoIds, onSuccess }) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [selectedPresetId, setSelectedPresetId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchPresets();
    }
  }, [isOpen]);

  const fetchPresets = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/edit-presets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPresets(response.data);
      
      // Select default preset if exists
      const defaultPreset = response.data.find((p: any) => p.isDefault);
      if (defaultPreset) {
        setSelectedPresetId(defaultPreset._id);
      } else if (response.data.length > 0) {
        setSelectedPresetId(response.data[0]._id);
      }
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!selectedPresetId) return;
    
    setProcessing(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/videos/apply-preset`,
        { videoIds: selectedVideoIds, presetId: selectedPresetId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to apply preset:', error);
      toast.error('Failed to apply preset. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  const selectedPreset = presets.find(p => p._id === selectedPresetId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-800/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400">
              <Wand2 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Auto Edit Videos</h2>
              <p className="text-sm text-gray-400">{selectedVideoIds.length} video{selectedVideoIds.length !== 1 ? 's' : ''} selected</p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {loading && (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-purple-500" size={32} />
            </div>
          )}
          
          {!loading && presets.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-400 mb-4">No presets found. Create a preset to get started.</p>
            </div>
          )}
          
          {!loading && presets.length > 0 && (
            <div className="space-y-4">
              <div>
                <label id="preset-select-label" className="block text-sm font-medium text-gray-400 mb-2">Select Preset</label>
                <div aria-labelledby="preset-select-label" role="listbox" className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {presets.map(preset => (
                    <div 
                      key={preset._id}
                      onClick={() => setSelectedPresetId(preset._id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          setSelectedPresetId(preset._id);
                          e.preventDefault();
                        }
                      }}
                      role="option"
                      aria-selected={selectedPresetId === preset._id}
                      tabIndex={0}
                      className={`p-4 rounded-xl border cursor-pointer transition-all outline-none focus:ring-2 focus:ring-purple-500 ${
                        selectedPresetId === preset._id 
                          ? 'bg-purple-600/10 border-purple-500 ring-1 ring-purple-500' 
                          : 'bg-gray-800 border-gray-700 hover:border-gray-600'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h3 className={`font-semibold ${selectedPresetId === preset._id ? 'text-purple-400' : 'text-white'}`}>
                          {preset.name}
                        </h3>
                        {preset.isDefault && <span className="text-xs bg-gray-700 text-gray-300 px-2 py-0.5 rounded">Default</span>}
                      </div>
                      <p className="text-xs text-gray-400 flex gap-3">
                        <span>{preset.config.resize_mode}</span>
                        <span>•</span>
                        <span className="capitalize">{preset.config.subtitle.position} Subtitles</span>
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button 
              onClick={onClose} 
              className="flex-1 py-3 bg-gray-800 text-white rounded-xl hover:bg-gray-700 transition-colors font-medium"
            >
              Cancel
            </button>
            <button 
              onClick={handleApply} 
              disabled={processing || !selectedPresetId}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl transition-all shadow-lg shadow-purple-900/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed font-bold flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="animate-spin" size={20} /> : <Wand2 size={20} />}
              {processing ? 'Applying...' : 'Apply Preset'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutoEditModal;
