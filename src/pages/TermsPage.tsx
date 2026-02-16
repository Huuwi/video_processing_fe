
import DashboardLayout from '../layouts/DashboardLayout';
import { FileText } from 'lucide-react';

const TermsPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-green-600/20 flex items-center justify-center text-green-400">
            <FileText size={28} />
          </div>
          <h1 className="text-3xl font-bold text-white">Điều khoản dịch vụ (Terms & Conditions)</h1>
        </div>
        
        <div className="bg-gray-900/50 border border-gray-800 rounded-3xl p-8 space-y-6 text-gray-300 leading-relaxed shadow-xl backdrop-blur-sm">
          <p>
            Bằng việc sử dụng dịch vụ của <span className="text-green-400 font-bold">Z-video</span>, bạn đồng ý tuân thủ các điều khoản sau đây:
          </p>
          
          <h2 className="text-xl font-semibold text-white mt-8">1. Quyền sử dụng</h2>
          <p>
            Bạn có quyền sử dụng công cụ của chúng tôi để tải và xử lý video cho mục đích sáng tạo nội dung cá nhân hoặc doanh nghiệp.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">2. Trách nhiệm nội dung</h2>
          <p>
            Bạn chịu hoàn toàn trách nhiệm về bản quyền và tính pháp lý của nội dung video mà bạn tải lên hoặc xử lý thông qua hệ thống của chúng tôi.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">3. Giới hạn dịch vụ</h2>
          <p>
            Chúng tôi cung cấp dịch vụ dựa trên số dư tài khoản và gói thời gian sử dụng. Các hành vi gian lận hoặc cố tình phá hoại hệ thống sẽ dẫn đến việc khóa tài khoản vĩnh viễn.
          </p>

          <h2 className="text-xl font-semibold text-white mt-8">4. Bản quyền phần mềm</h2>
          <p>
            Toàn bộ mã nguồn và thiết kế giao diện của Z-video thuộc bản quyền của đội ngũ phát triển. Mọi hình thức sao chép, đảo ngược mã nguồn đều bị nghiêm cấm.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TermsPage;
