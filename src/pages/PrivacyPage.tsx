
import DashboardLayout from '../layouts/DashboardLayout';
import { Shield } from 'lucide-react';

const PrivacyPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400">
            <Shield size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Chính sách bảo mật (Privacy Policy)</h1>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 space-y-6 text-gray-300 leading-relaxed shadow-xl backdrop-blur-sm">
          <p>
            Tại <span className="text-purple-400 font-bold">Z-video</span>, chúng tôi coi trọng sự riêng tư và bảo mật dữ liệu của bạn.
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8">1. Thu thập thông tin</h2>
          <p>
            Chúng tôi thu thập thông tin cơ bản từ tài khoản Google của bạn (Tên, Email, Ảnh đại diện) khi bạn đăng nhập để định danh và cung cấp dịch vụ cá nhân hóa.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Sử dụng dữ liệu video</h2>
          <p>
            Các video bạn tải xuống và xử lý trên nền tảng của chúng tôi được lưu trữ an toàn trong hệ thống và chỉ dành riêng cho tài khoản của bạn. Chúng tôi không chia sẻ nội dung video của bạn cho bên thứ ba.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Bảo mật thông tin</h2>
          <p>
            Hệ thống của chúng tôi được thắt chặt bảo mật bằng các lớp tường lửa và proxy để ngăn chặn các truy cập trái phép vào cơ sở dữ liệu và kho lưu trữ của bạn.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Thay đổi chính sách</h2>
          <p>
            Chúng tôi có quyền cập nhật chính sách bảo mật này bất cứ lúc nào. Mọi thay đổi sẽ được thông báo trực tiếp trên giao diện ứng dụng.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default PrivacyPage;
