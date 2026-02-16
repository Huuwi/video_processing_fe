import { useState, useEffect, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import VideoItem from '../components/VideoItem';
import VideoEditor from '../components/VideoEditor';
import { useAuth } from '../contexts/AuthContext';
import DashboardLayout from '../layouts/DashboardLayout';
import { Plus, Link as LinkIcon, Settings, Wand2, Search, ChevronLeft, ChevronRight, X } from 'lucide-react';
import axiosClient from '../api/axiosClient';
import AutoEditModal from '../components/AutoEditModal';
import PresetManager from '../components/PresetManager';

function DashboardPage() {
  const [videos, setVideos] = useState<any[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<any | null>(null);
  const [inputUrls, setInputUrls] = useState('');
  const { user, refreshUser } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVideos, setSelectedVideos] = useState<string[]>([]);
  const [isAutoEditModalOpen, setIsAutoEditModalOpen] = useState(false);
  const [isPresetManagerOpen, setIsPresetManagerOpen] = useState(false);

  // Pagination & Filters
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(9); // Default limit
  const [totalPages, setTotalPages] = useState(1);
  const [totalVideos, setTotalVideos] = useState(0);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [stageFilter, setStageFilter] = useState<string>('');

  // Debounce search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchVideos = async () => {
    try {
      const fields = '_id,title,status,stage,url,download_link,createdAt,original_duration_ms,errorMsg';
      const params = new URLSearchParams({
        fields,
        page: page.toString(),
        limit: limit.toString(),
      });

      if (debouncedSearch) params.append('search', debouncedSearch);
      if (statusFilter) params.append('status', statusFilter);
      if (stageFilter) params.append('stage', stageFilter);

      const res: any = await axiosClient.get(`/videos?${params.toString()}`);
      
      // Handle both old array response and new paginated response
      if (res.data && Array.isArray(res.data)) {
          setVideos(res.data);
          setTotalPages(res.totalPages || 1);
          setTotalVideos(res.total || res.data.length);
      } else if (Array.isArray(res)) {
          // Fallback for old API format if needed (though backend is updated)
          setVideos(res);
      }
    } catch (err) {
      console.error("Failed to fetch videos", err);
    }
  };

  useEffect(() => {
    fetchVideos();
    const interval = setInterval(() => {
      fetchVideos();
      refreshUser();
    }, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, [page, debouncedSearch, statusFilter, stageFilter, limit, refreshUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputUrls) return;
    setIsLoading(true);
    
    const urls = inputUrls.split(/[\n,]+/).map(u => u.trim()).filter(Boolean);
    
    try {
      await axiosClient.post('/videos/submit', {
        urls,
        userId: user?._id 
      });
      setInputUrls('');
      fetchVideos();
      refreshUser();
    } catch (err) {
      console.error(err);
      toast.error('Failed to submit');
    } finally {
        setIsLoading(false);
    }
  };

  const handleEdit = (video: any) => {
      setSelectedVideo(video);
  };

  const handleSaveEdit = () => {
      setSelectedVideo(null);
      fetchVideos();
  };

    const handleRetry = async (video: any) => {
        try {
            await axiosClient.post(`/videos/${video._id}/retry`);
            fetchVideos();
        } catch (err) {
            console.error(err);
            alert('Failed to retry');
        }
    };

  const handleToggleVideo = (videoId: string) => {
    setSelectedVideos(prev => 
      prev.includes(videoId) 
        ? prev.filter(id => id !== videoId)
        : [...prev, videoId]
    );
  };

  const handleSelectAll = () => {
    const editableVideos = videos.filter(v => v.stage === 'user_editing' || v.stage === 'download').map(v => v._id);
    if (selectedVideos.length === editableVideos.length) {
      setSelectedVideos([]);
    } else {
      setSelectedVideos(editableVideos);
    }
  };

  const renderEditor = () => (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
        <button 
            onClick={() => setSelectedVideo(null)}
            className="mb-6 text-gray-400 hover:text-white flex items-center gap-2 transition-colors group"
        >
            <span className="group-hover:-translate-x-1 transition-transform">&larr;</span> 
            Back to Dashboard
        </button>
        <VideoEditor video={selectedVideo} onSave={handleSaveEdit} />
    </div>
  );

  const renderDashboard = () => (
    <div className="space-y-8">
         {/* Retention Warning */}
         <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 flex items-start gap-3">
            <div className="text-yellow-500 shrink-0 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
            </div>
            <div>
                <h4 className="text-yellow-500 font-medium text-sm">Lưu ý quan trọng</h4>
                <p className="text-yellow-500/80 text-sm mt-0.5">
                    Hệ thống sẽ tự động xóa các video và tệp tin liên quan sau <span className="font-bold text-yellow-400">3 ngày</span> kể từ khi tạo.Vui lòng tải xuống kết quả của bạn sớm nhất có thể.
                </p>
            </div>
         </div>

         {/* Header Section */}
        <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Video của bạn</h2>
                    <p className="text-gray-400 text-sm">{totalVideos} Tổng video</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => setIsPresetManagerOpen(true)}
                        className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-gray-700"
                    >
                        <Settings size={16} />
                        Quản lý template
                    </button>
                    {videos.filter(v => v.stage === 'user_editing' || v.stage === 'download').length > 0 && (
                        <div className="flex items-center gap-3">
                            <button
                                onClick={handleSelectAll}
                                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors text-sm"
                            >
                                {selectedVideos.length > 0 ? 'Bỏ chọn tất cả' : 'Chọn tất cả video có thể edit'}
                            </button>
                            {selectedVideos.length > 0 && (
                                <button
                                    onClick={() => setIsAutoEditModalOpen(true)}
                                    className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-medium transition-all shadow-lg shadow-purple-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-right-3"
                                >
                                    <Wand2 size={18} />
                                    Auto Edit ({selectedVideos.length})
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Filters Bar */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-gray-900/50 p-4 rounded-xl border border-gray-800">
                <div className="relative md:col-span-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search videos..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {search && (
                        <button 
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>
                <div>
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="">All Statuses</option>
                        <option value="pending">Pending</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="failed">Failed</option>
                    </select>
                </div>
                <div>
                    <select
                        value={stageFilter}
                        onChange={(e) => { setStageFilter(e.target.value); setPage(1); }}
                        className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none"
                    >
                        <option value="">All Stages</option>
                        <option value="download">Download</option>
                        <option value="user_editing">User Editing</option>
                        <option value="ai_process">AI Process</option>
                        <option value="edit_process">Edit Process</option>
                    </select>
                </div>
            </div>
            
            <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                Search video
            </div>
        </div>

        {/* Submit Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-1">
            <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus className="text-blue-500" />
                    Thêm videos
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="relative">
                        <div className="absolute top-3 left-3 text-gray-500 pointer-events-none">
                            <LinkIcon size={18} />
                        </div>
                        <textarea
                            className="w-full bg-black/40 border border-gray-700 text-white rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-600 transition-all min-h-[100px] resize-y"
                            placeholder="Dán link video từ douyin hoặc bilibili vào đây(mỗi dòng là 1 video)"
                            value={inputUrls}
                            onChange={(e) => setInputUrls(e.target.value)}
                            disabled={isLoading}
                        />
                    </div>
                    <div className="mt-4 flex justify-end">
                        <button 
                            type="submit" 
                            disabled={isLoading || !inputUrls}
                            className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-2.5 rounded-xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isLoading ? 'Đang thực thi...' : 'Bắt đầu thực thi'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

        {/* Content Grid */}
        <div>
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">Recent Videos</h3>
                <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-400">Page {page} of {totalPages}</span>
                </div>
            </div>
            
            {videos.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-900/50 border border-gray-800 border-dashed rounded-3xl">
                    <div className="w-16 h-16 bg-gray-800 rounded-full flex items-center justify-center text-gray-600 mb-4">
                        <Plus size={32} />
                    </div>
                    <p className="text-gray-400 font-medium">No videos found</p>
                    <p className="text-sm text-gray-600">Try adjusting your filters or submit a new URL</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {videos.map((v: any) => (
                        <VideoItem 
                            key={v._id} 
                            video={v} 
                            onEdit={handleEdit}
                            onRetry={handleRetry}
                            isSelected={selectedVideos.includes(v._id)}
                            onToggleSelect={handleToggleVideo}
                            onUpdate={(videoId, newTitle) => {
                                setVideos(prev => prev.map(item => item._id === videoId ? { ...item, title: newTitle } : item));
                            }}
                        />
                    ))}
                    </div>

                    {/* Pagination Controls */}
                    <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-gray-800 pt-6">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>Rows per page:</span>
                            <select
                                value={limit}
                                onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
                                className="bg-gray-800 border border-gray-700 text-white rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            >
                                <option value={9}>9</option>
                                <option value={18}>18</option>
                                <option value={27}>27</option>
                                <option value={45}>45</option>
                                <option value={90}>90</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                <ChevronLeft size={16} />
                                Back
                            </button>
                            
                            <div className="flex items-center gap-1 mx-2">
                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                    // Show pages around current page
                                    let p = page;
                                    if (totalPages <= 5) p = i + 1;
                                    else if (page <= 3) p = i + 1;
                                    else if (page >= totalPages - 2) p = totalPages - 4 + i;
                                    else p = page - 2 + i;
                                    
                                    return (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                                                page === p 
                                                    ? 'bg-blue-600 text-white' 
                                                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                                            }`}
                                        >
                                            {p}
                                        </button>
                                    );
                                })}
                            </div>

                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-3 py-1.5 bg-gray-800 border border-gray-700 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                            >
                                Next
                                <ChevronRight size={16} />
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    </div>
  );

  return (
    <DashboardLayout>
       <div className="max-w-7xl mx-auto">
            {selectedVideo ? renderEditor() : renderDashboard()}
       </div>
       
       <AutoEditModal
        isOpen={isAutoEditModalOpen}
        onClose={() => setIsAutoEditModalOpen(false)}
        selectedVideoIds={selectedVideos}
        onSuccess={() => {
          setSelectedVideos([]);
          fetchVideos();
          toast.success(`Successfully queued ${selectedVideos.length} video(s) for editing!`);
        }}
      />
      
      {isPresetManagerOpen && (
        <PresetManager onClose={() => setIsPresetManagerOpen(false)} />
      )}
    </DashboardLayout>
  );
}

export default DashboardPage;
