
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  LinkIcon,
  Video, 
  Zap, 
  Globe, 
  Mic2, 
  Clock, 
  CircleDollarSign, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight,
  Play
} from 'lucide-react';

const LandingPage = () => {
  const { isAuthenticated } = useAuth();

  const handleGoogleLogin = () => {
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3001';
    globalThis.location.href = `${apiUrl}/users/auth/google`;
  };

  const features = [
    {
      icon: <LinkIcon className="w-6 h-6 text-indigo-400" />,
      title: "Đầu Vào Cực Tiện",
      description: "Chỉ cần dán link video từ Douyin hoặc Bilibili. Hệ thống tự động xử lý lấy dữ liệu gốc chất lượng cao."
    },
    {
      icon: <Zap className="w-6 h-6 text-yellow-400" />,
      title: "Tạo Video Hàng Loạt",
      description: "Xử lý hàng trăm video cùng lúc mà không tốn thời gian chờ đợi. Hiệu suất tối đa cho content creator."
    },
    {
      icon: <TrendingUp className="w-6 h-6 text-green-400" />,
      title: "Làm Affiliate Cực Nhàn",
      description: "Tự động hóa quy trình làm video review sản phẩm. Kiếm hoa hồng thụ động không tốn công sức."
    },
    {
      icon: <Video className="w-6 h-6 text-blue-400" />,
      title: "Cày View YouTube",
      description: "Hỗ trợ xây dựng kênh YouTube Shorts, TikTok, Reels cực nhẹ nhàng. Thu hút triệu view mỗi ngày."
    },
    {
      icon: <Globe className="w-6 h-6 text-purple-400" />,
      title: "Dịch Thuật Đa Ngôn Ngữ",
      description: "Hỗ trợ Tiếng Việt, Hàn, Nhật, Anh, Thái, Trung... Mở rộng thị trường ra toàn cầu chỉ trong nháy mắt."
    },
    {
      icon: <Mic2 className="w-6 h-6 text-pink-400" />,
      title: "100+ Voices Đọc",
      description: "Kho giọng đọc AI đa dạng, truyền cảm, phù hợp với mọi loại nội dung từ tin tức đến giải trí."
    },
    {
      icon: <Clock className="w-6 h-6 text-orange-400" />,
      title: "Thời Lượng 30 Phút",
      description: "Không chỉ video ngắn, chúng tôi hỗ trợ render video dài đến 30 phút với chất lượng cao nhất."
    },
    {
      icon: <CircleDollarSign className="w-6 h-6 text-cyan-400" />,
      title: "Giá Rẻ Bất Ngờ",
      description: "Chi phí tối ưu, chưa đến 3.000 VNĐ cho một video short hoàn chỉnh. Tiết kiệm 90% chi phí sản xuất."
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Zap className="text-white fill-white w-6 h-6" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Z-Video
            </span>
          </div>

          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2"
              >
                Dashboard
                <ArrowRight size={18} />
              </Link>
            ) : (
              <button
                onClick={handleGoogleLogin}
                className="px-6 py-2.5 bg-white text-black font-bold rounded-full hover:bg-gray-200 transition-all flex items-center gap-2 cursor-pointer"
              >
                Login
                <ArrowRight size={18} />
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[100px] -z-10" />

        <div className="max-w-5xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-medium mb-8 animate-fade-in">
            <CheckCircle2 size={16} />
            <span>AI-Powered Video Automation</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-gray-500">
            Tạo Video Hàng Loạt <br className="hidden md:block" />
            <span className="text-blue-500">Zero Waiting Time</span>
          </h1>

          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-12 leading-relaxed">
            Hệ thống tự động hóa video đỉnh cao. Giúp bạn cày view, làm affiliate và dịch thuật đa ngôn ngữ chỉ với vài cú click chuột. 
            Nhanh nhất - Rẻ nhất - Hiệu quả nhất.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {isAuthenticated ? (
                <Link
                to="/dashboard"
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Go to Dashboard
                <ArrowRight size={20} />
                </Link>
            ) : (
                <button
                onClick={handleGoogleLogin}
                className="w-full sm:w-auto px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-3 relative overflow-hidden group cursor-pointer"
                >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                Bắt đầu ngay
                <ArrowRight size={20} />
                </button>
            )}
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl font-bold transition-all flex items-center justify-center gap-3">
              <Play size={20} className="fill-white" />
              Xem Demo
            </button>
          </div>
        </div>

        {/* Browser Mockup */}
        <div className="mt-20 max-w-6xl mx-auto relative group">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-500/10 to-transparent blur-3xl -z-10 group-hover:from-blue-500/20 transition-all duration-700" />
          <div className="bg-gray-900 border border-white/10 rounded-3xl p-3 shadow-2xl">
            <div className="bg-black rounded-2xl aspect-video overflow-hidden relative">
                <img 
                    src="https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=2070&auto=format&fit=crop" 
                    alt="App Preview" 
                    className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 hover:scale-110 transition-transform cursor-pointer group/play">
                        <Play size={32} className="fill-white translate-x-1" />
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-bold mb-4">Mọi thứ bạn cần để làm Video</h2>
          <p className="text-gray-400">Công cụ tối ưu dành riêng cho các nhà sáng tạo nội dung thời đại AI</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="p-8 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/[0.08] hover:border-blue-500/30 transition-all group"
            >
              <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-gray-400 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
          
          {/* CTA Card */}
          <div className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl shadow-blue-500/10">
            <h3 className="text-2xl font-bold mb-4">Bắt đầu ngay hôm nay?</h3>
            <p className="text-white/80 mb-8 max-w-xs">Tham gia cùng hàng nghìn creator đang tối ưu hóa thời gian với Z-Video.</p>
            {isAuthenticated ? (
                <Link
                to="/dashboard"
                className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg"
                >
                Vào Dashboard
                </Link>
            ) : (
                <button
                onClick={handleGoogleLogin}
                className="px-8 py-3 bg-white text-black font-bold rounded-2xl hover:scale-105 transition-all shadow-lg cursor-pointer"
                >
                Đăng ký dùng thử
                </button>
            )}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div>
            <div className="text-4xl font-black mb-2 uppercase tracking-tight">1M+</div>
            <div className="text-gray-400 text-sm">Video Rendered</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 uppercase tracking-tight">5000+</div>
            <div className="text-gray-400 text-sm">Active Users</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 uppercase tracking-tight">99.9%</div>
            <div className="text-gray-400 text-sm">Uptime</div>
          </div>
          <div>
            <div className="text-4xl font-black mb-2 uppercase tracking-tight">&lt; 3K</div>
            <div className="text-gray-400 text-sm">VND Per Video</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 border-t border-white/5 flex flex-col items-center">
        <div className="flex items-center gap-2 mb-8 opacity-50">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
            <Zap className="text-black fill-black w-5 h-5" />
          </div>
          <span className="text-lg font-bold">Z-Video</span>
        </div>
        <p className="text-gray-500 text-sm mb-4">Built for high-performance content creation.</p>
        <div className="flex gap-8 text-gray-500 text-xs mb-8">
          <a href="#" className="hover:text-white transition-colors">Documentation</a>
          <a href="#" className="hover:text-white transition-colors">API Reference</a>
          <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
        </div>
        <p className="text-gray-600 text-[10px] tracking-widest uppercase font-mono">
          &copy; {new Date().getFullYear()} Z-Video VIDEO SYSTEM. ALL RIGHTS RESERVED.
        </p>
      </footer>
    </div>
  );
};

export default LandingPage;
