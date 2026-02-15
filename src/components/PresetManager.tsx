import React, { useState, useEffect } from 'react';
import { Settings, Plus, Edit2, Trash2, X, Star } from 'lucide-react';
import axios from 'axios';
import PresetForm from './PresetForm';

interface PresetManagerProps {
  onClose: () => void;
}

const PresetManager: React.FC<PresetManagerProps> = ({ onClose }) => {
  const [presets, setPresets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);

  const fetchPresets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('access_token');
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/edit-presets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPresets(response.data);
    } catch (error) {
      console.error('Failed to fetch presets:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresets();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this preset?')) return;
    try {
      const token = localStorage.getItem('access_token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/edit-presets/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPresets();
    } catch (error) {
      console.error('Failed to delete preset:', error);
    }
  };

  const handleSetDefault = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('access_token');
      await axios.post(`${import.meta.env.VITE_API_URL}/edit-presets/${id}/set-default`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchPresets();
    } catch (error) {
      console.error('Failed to set default:', error);
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-gray-900 border border-gray-800 rounded-2xl w-full max-w-4xl h-[80vh] flex flex-col shadow-2xl">
        <div className="p-6 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
              <Settings size={20} />
            </div>
            <h2 className="text-xl font-bold text-white">Manage Presets</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white"><X size={24} /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center text-gray-500 py-10">Loading presets...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Create New Card */}
              <button 
                onClick={() => { setEditingPreset(null); setShowForm(true); }}
                className="flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed border-gray-800 hover:border-blue-500 hover:bg-gray-800/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-gray-800 group-hover:bg-blue-500/20 flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                  <Plus size={24} />
                </div>
                <span className="font-medium text-gray-400 group-hover:text-white">Create New Preset</span>
              </button>

              {/* Preset Cards */}
              {presets.map(preset => (
                <div key={preset._id} className="relative group bg-gray-800/50 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-all">
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="font-bold text-white text-lg">{preset.name}</h3>
                    {preset.isDefault && (
                      <span className="px-2 py-1 rounded-md bg-yellow-500/10 text-yellow-500 text-xs font-medium border border-yellow-500/20 flex items-center gap-1">
                        <Star size={10} fill="currentColor" /> Default
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-2 text-sm text-gray-400 mb-6">
                    <div className="flex justify-between">
                      <span>Ratio:</span>
                      <span className="text-white">{preset.config.resize_mode}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Subtitle:</span>
                      <span className="text-white capitalize">{preset.config.subtitle.position}</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setEditingPreset(preset); setShowForm(true); }}
                      className="flex-1 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Edit2 size={14} /> Edit
                    </button>
                    {!preset.isDefault && (
                      <button 
                        onClick={(e) => handleSetDefault(preset._id, e)}
                        className="px-3 py-2 bg-gray-800 hover:bg-yellow-500/10 text-gray-400 hover:text-yellow-500 rounded-lg transition-colors"
                        title="Set as default"
                      >
                        <Star size={16} />
                      </button>
                    )}
                    <button 
                      onClick={() => handleDelete(preset._id)}
                      className="px-3 py-2 bg-gray-800 hover:bg-red-500/10 text-gray-400 hover:text-red-500 rounded-lg transition-colors"
                      title="Delete"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <PresetForm 
          initialData={editingPreset}
          onSave={() => { setShowForm(false); fetchPresets(); }}
          onCancel={() => setShowForm(false)}
        />
      )}
    </div>
  );
};

export default PresetManager;
