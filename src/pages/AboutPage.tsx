
import DashboardLayout from '../layouts/DashboardLayout';
import { Info } from 'lucide-react';

const AboutPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-400">
            <Info size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Về chúng tôi (About Us)</h1>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 space-y-6 text-gray-300 leading-relaxed shadow-xl backdrop-blur-sm">
          <p>
            Chào mừng bạn đến với <span className="text-blue-400 font-bold">Z-video</span> - Nền tảng xử lý video tự động hàng đầu dành cho các nhà sáng tạo nội dung.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8">Sứ mệnh của chúng tôi</h2>
          <p>
            Z-video được sinh ra với sứ mệnh tối ưu hóa thời gian và quy trình sản xuất video cho người dùng. Chúng tôi mong muốn giúp bạn biến những video thô từ Douyin, TikTok trở thành những tác phẩm hoàn thiện một cách nhanh chóng nhất.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">Tính năng cốt lõi</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Tải video chất lượng cao từ các nền tảng mạng xã hội.</li>
            <li>Xử lý âm thanh, tách nhạc nền và lồng tiếng tự động.</li>
            <li>Tạo phụ đề AI nhanh chóng và chính xác.</li>
            <li>Tùy chỉnh template theo phong cách riêng của bạn.</li>
          </ul>

          <h2 className="text-xl font-semibold text-white mt-8">Liên hệ</h2>
          <p>
            Mọi thắc mắc hoặc yêu cầu hỗ trợ, vui lòng truy cập group zalo của chúng tôi: <span className="text-blue-400 font-medium">https://zalo.me/g/lcairy656</span>
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AboutPage;
