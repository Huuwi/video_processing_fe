
import React from 'react';
import { CheckCircle, AlertCircle, Loader2, Edit3, Film, Download, RotateCcw, FileText, X } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface VideoProps {
    video: {
        _id: string;
        title?: string;
        status: string;
        stage: string;
        url: string;
        download_link?: string;
        errorMsg?: string;
        auto_edit?: boolean;
    };
    onEdit: (video: any) => void;
    onRetry?: (video: any) => void;
    isSelected?: boolean;
    onToggleSelect?: (videoId: string) => void;
    onUpdate?: (videoId: string, newTitle: string) => void;
}

const VideoItem: React.FC<VideoProps> = ({ video, onEdit, onRetry, isSelected, onToggleSelect, onUpdate }) => {
    const isReadyToEdit = video.stage === 'user_editing';
    const [isEditingTitle, setIsEditingTitle] = React.useState(false);
    const [titleInput, setTitleInput] = React.useState(video.title || '');

    // Sync local state when video prop updates (from polling)
    React.useEffect(() => {
        if (!isEditingTitle) {
            setTitleInput(video.title || 'Untitled Video');
        }
    }, [video.title, isEditingTitle]);

    const handleTitleSave = async () => {
        if (!titleInput.trim()) return;
        
        try {
            await axios.patch(
                `${import.meta.env.VITE_API_URL}/videos/${video._id}`,
                { title: titleInput },
                { headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` } }
            );
            toast.success('Title updated');
            setIsEditingTitle(false);
            if (onUpdate) {
                onUpdate(video._id, titleInput);
            }
        } catch (error) {
            console.error('Failed to update title:', error);
            toast.error('Failed to update title');
        }
    };
    
    const getStatusConfig = () => {
        if (video.status === 'completed') return { color: 'text-green-400', bg: 'bg-green-500/10', border: 'border-green-500/20', icon: CheckCircle };
        if (video.status === 'failed') return { color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: AlertCircle };
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/10', border: 'border-yellow-500/20', icon: Loader2 };
    };

    const statusConfig = getStatusConfig();
    const StatusIcon = statusConfig.icon;

    const handleDownload = async () => {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/videos/${video._id}/download-presigned-url`, {
                headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
            });
            window.open(response.data.url, '_blank');
        } catch (error) {
            console.error('Failed to get download link', error);
        }
    };

    return (
        <div className="group bg-gray-900/50 backdrop-blur-sm border border-gray-800 hover:border-blue-500/30 rounded-2xl p-4 transition-all hover:bg-gray-800/50 hover:shadow-lg hover:shadow-blue-500/5">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                    {/* Retry button for failed videos */}
                    {video.status === 'failed' && onRetry ? (
                        <button 
                            onClick={() => onRetry(video)}
                            className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-lg transition-colors"
                            title="Retry Processing"
                        >
                            <RotateCcw size={20} />
                        </button>
                    ) : (
                        /* Checkbox for batch selection (only if not failed) */
                        (video.stage === 'user_editing' || video.stage === 'download') && onToggleSelect && (
                            <input
                                type="checkbox"
                                checked={isSelected || false}
                                onChange={() => onToggleSelect && onToggleSelect(video._id)}
                                className="w-5 h-5 rounded border-gray-700 bg-gray-800 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-900 cursor-pointer"
                            />
                        )
                    )}
                    <div className="w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                        <Film size={24} />
                    </div>
                    <div className="flex-1 min-w-0">
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={titleInput}
                                    onChange={(e) => setTitleInput(e.target.value)}
                                    className="bg-gray-800 text-white px-2 py-1 rounded border border-gray-700 text-sm focus:outline-none focus:border-blue-500 w-full"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') handleTitleSave();
                                        if (e.key === 'Escape') {
                                            setIsEditingTitle(false);
                                            setTitleInput(video.title || 'Untitled Video');
                                        }
                                    }}
                                    onBlur={() => {
                                        // Optional: save on blur or cancel? 
                                        // Better to keep explicit save for now to avoid accidental saves
                                    }}
                                />
                                <button 
                                    onClick={handleTitleSave}
                                    className="p-1 hover:text-green-400 transition-colors"
                                >
                                    <CheckCircle size={16} />
                                </button>
                                <button 
                                    onClick={() => {
                                        setIsEditingTitle(false);
                                        setTitleInput(video.title || 'Untitled Video');
                                    }}
                                    className="p-1 hover:text-red-400 transition-colors"
                                >
                                    <X size={16} />
                                </button>
                            </div>
                        ) : (
                            <div className="group/title flex items-center gap-2">
                                <h3 
                                    className="font-semibold text-white line-clamp-1 cursor-pointer hover:text-blue-400 transition-colors" 
                                    title="Click to edit title"
                                    onClick={() => setIsEditingTitle(true)}
                                >
                                    {video.title || 'Untitled Video'}
                                </h3>
                                <button 
                                    onClick={() => setIsEditingTitle(true)}
                                    className="opacity-0 group-hover/title:opacity-100 text-gray-500 hover:text-blue-400 transition-opacity"
                                >
                                    <Edit3 size={14} />
                                </button>
                            </div>
                        )}
                         <p className="text-xs text-gray-500 font-mono mt-0.5 max-w-[200px] truncate">{video.url}</p>
                    </div>
                </div>
                
                <div 
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${statusConfig.bg} ${statusConfig.color} ${statusConfig.border} ${video.status === 'failed' ? 'cursor-pointer hover:opacity-80' : ''}`}
                    onClick={() => {
                        if (video.status === 'failed' && video.errorMsg) {
                            toast.error(video.errorMsg);
                        }
                    }}
                    title={video.status === 'failed' ? video.errorMsg : undefined}
                >
                    <StatusIcon size={14} className={video.status === 'pending' ? 'animate-spin' : ''} />
                    <span className="uppercase tracking-wider">{video.status}</span>
                </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-gray-800 pt-4">
                 <div className="flex flex-col">
                     <span className="text-xs text-gray-500 uppercase tracking-widest font-bold">Stage</span>
                     <span className="text-sm text-gray-300 capitalize">{video.stage?.replaceAll('_', ' ') || 'Processing'}</span>
                 </div>

                 <div className="flex items-center gap-3">
                     {isReadyToEdit && (
                        <button 
                            onClick={() => onEdit(video)}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-600/20"
                        >
                            <Edit3 size={16} />
                            Open Editor
                        </button>
                     )}

                     {video.stage === 'download' && video.auto_edit && (
                        <button
                            onClick={async () => {
                                try {
                                    await axios.post(`${import.meta.env.VITE_API_URL}/videos/${video._id}/cancel-auto`, {}, {
                                        headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
                                    });
                                    toast.success('Auto-edit cancelled');
                                    // Optionally trigger a refresh or let the parent handle it
                                    if(onRetry) onRetry(video); // Re-use onRetry to trigger fetch if available, or just rely on polling
                                } catch (error) {
                                    console.error('Failed to cancel auto-edit', error);
                                    toast.error('Failed to cancel auto-edit');
                                }
                            }}
                            className="flex items-center gap-2 px-3 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 text-sm font-medium rounded-lg transition-colors"
                        >
                            <RotateCcw size={16} />
                            Cancel Auto
                        </button>
                     )}
                     
                     {video.status === 'completed' && (
                        <>
                             {video.download_link && (
                                <button 
                                    onClick={handleDownload}
                                    className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-green-600/20"
                                    title="Download Video"
                                >
                                    <Download size={16} />
                                    Video
                                </button>
                             )}
                             <button 
                                onClick={async () => {
                                    try {
                                        const response = await axios.get(`${import.meta.env.VITE_API_URL}/videos/${video._id}/download-srt`, {
                                            headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` },
                                        });
                                        const blob = new Blob([response.data], { type: 'text/plain' });
                                        const url = window.URL.createObjectURL(blob);
                                        const link = document.createElement('a');
                                        link.href = url;
                                        link.setAttribute('download', `${video.title || 'video'}.srt`);
                                        document.body.appendChild(link);
                                        link.click();
                                        link.parentNode?.removeChild(link);
                                    } catch (error) {
                                        console.error('Failed to download SRT', error);
                                        toast.error('Failed to download SRT');
                                    }
                                }}
                                className="flex items-center gap-2 px-3 py-2 bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-purple-600/20"
                                title="Download SRT"
                            >
                                <FileText size={16} />
                                SRT
                            </button>
                        </>
                     )}
                 </div>
            </div>
        </div>
    );
};

export default VideoItem;
