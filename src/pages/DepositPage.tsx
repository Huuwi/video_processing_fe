import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreditCard, Clock, ShieldCheck, Check, Gift, Sparkles, Timer, ArrowLeft } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface Package {
  id: string;
  price: number;
  minutes: number;
  bonusMinutes: number;
  isPopular?: boolean;
}

const PACKAGES: Package[] = [
  { id: '30k', price: 30000, minutes: 10, bonusMinutes: 0 },
  { id: '50k', price: 50000, minutes: 16.6, bonusMinutes: 2, isPopular: true },
  { id: '100k', price: 100000, minutes: 33.3, bonusMinutes: 5 },
  { id: '500k', price: 500000, minutes: 166.6, bonusMinutes: 30,isPopular: true },
];

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const DepositPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hour in seconds

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const status = searchParams.get('status');
      const code = searchParams.get('code');
      const cancel = searchParams.get('cancel');
      const orderCode = searchParams.get('orderCode');

      if (orderCode && (status === 'success' || status === 'PAID' || code === '00')) {
         try {
            setIsLoading(true);
            const token = localStorage.getItem('access_token');
            // Try to verify with backend
            const response = await axios.post(`${API_URL}/payment/verify`, {
                orderCode: Number(orderCode)
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            
            if (response.data.success) {
                toast.success('Thanh toán thành công! Thời gian đã được cộng vào tài khoản.');
                setTimeout(() => navigate('/dashboard'), 2000); // Redirect back to dashboard
            } else {
               toast.error('Thanh toán chưa hoàn tất hoặc bị lỗi.');
            }
         } catch (error) {
             console.error('Verify error:', error);
             toast.error('Không thể xác minh thanh toán. Vui lòng liên hệ hỗ trợ.');
         } finally {
             setIsLoading(false);
         }
      } else if (cancel === 'true' || status === 'CANCELLED') {
          toast.error('Bạn đã hủy thanh toán.');
      }
    };

    checkPaymentStatus();
  }, [searchParams, navigate]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) return 3600; // Reset to 1 hour
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleDeposit = async (pkg: Package) => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('access_token');
      
      const response = await axios.post(
        `${API_URL}/payment/create-link`,
        { 
          amount: pkg.price,
          redirectUrl: window.location.href
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.data && response.data.checkoutUrl) {
        window.location.href = response.data.checkoutUrl;
      }
    } catch (error) {
      console.error('Payment creation failed:', error);
      alert('Có lỗi xảy ra khi tạo thanh toán. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-blue-900/20 p-4 md:p-8 flex flex-col justify-center relative">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/dashboard')}
        className="absolute top-4 left-4 md:top-8 md:left-8 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-gray-300 hover:text-white transition-all duration-300 group z-50 backdrop-blur-md"
      >
        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="font-medium">Quay lại Dashboard</span>
      </button>

      <div className="max-w-7xl mx-auto space-y-12 w-full">
        {/* Header & Flash Sale Banner */}
        <div className="text-center space-y-8 animate-fade-in-down">
          <div className="inline-flex items-center gap-3 bg-red-600/20 border border-red-500/50 rounded-full px-8 py-3 text-red-500 font-bold animate-pulse shadow-[0_0_20px_rgba(239,68,68,0.4)] backdrop-blur-md">
            <Timer size={24} className="animate-spin-slow" />
            <span className="tracking-wide">ƯU ĐÃI KẾT THÚC SAU: <span className="font-mono text-2xl ml-2 text-white">{formatTime(timeLeft)}</span></span>
          </div>

          <div className="space-y-4">
             <h1 className="text-5xl md:text-6xl font-black text-white drop-shadow-[0_0_30px_rgba(59,130,246,0.6)] tracking-tight">
              Nạp Time <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-pink-500 animate-gradient-x">Sáng Tạo Vô Hạn</span>
            </h1>
            <p className="text-gray-300 text-xl max-w-3xl mx-auto leading-relaxed">
              Flash Sale giảm giá cực sốc! Giá gốc <span className="line-through text-gray-500 decoration-2 decoration-red-500 mx-2">5,000đ/phút</span> chỉ còn <span className="text-green-400 font-bold text-2xl bg-green-400/10 px-2 py-1 rounded-lg border border-green-400/20">3,000đ/phút</span>
            </p>
          </div>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {PACKAGES.map((pkg) => (
            <div 
              key={pkg.id}
              onClick={() => setSelectedPackage(pkg.id)}
              className={`
                relative group cursor-pointer
                bg-gray-900/60 backdrop-blur-xl rounded-3xl border-2 transition-all duration-500
                hover:shadow-[0_0_50px_rgba(59,130,246,0.25)] hover:-translate-y-4
                ${selectedPackage === pkg.id 
                  ? 'border-blue-500 shadow-[0_0_40px_rgba(59,130,246,0.4)] transform -translate-y-4 scale-105 z-10' 
                  : 'border-white/5 hover:border-blue-400/50'
                }
              `}
            >
              {/* Active Selection Glow */}
              {selectedPackage === pkg.id && (
                  <div className="absolute inset-0 bg-blue-500/5 animate-pulse rounded-3xl pointer-events-none" />
              )}

              {pkg.isPopular && (
                <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-1.5 bg-gradient-to-r from-orange-500 via-red-500 to-pink-600 rounded-full text-sm font-bold text-white shadow-xl z-20 flex items-center gap-2 whitespace-nowrap border border-white/20 animate-bounce-slow">
                  <Sparkles size={14} className="text-yellow-200 animate-pulse" />
                  HOT NHẤT HÔM NAY
                </div>
              )}

              <div className="p-8 space-y-8 relative z-0 flex flex-col h-full">
                {/* Package Price */}
                <div className="text-center pb-8 border-b border-gray-800 space-y-2">
                  <div className="text-blue-400 font-bold text-sm tracking-[0.2em] uppercase group-hover:text-blue-300 transition-colors">GÓI {pkg.id.toUpperCase()}</div>
                  <div className="text-5xl font-black text-white tracking-tighter group-hover:scale-110 transition-transform duration-300">
                    {Math.round(pkg.price / 1000)}<span className="text-3xl">.000</span>
                    <span className="text-2xl text-gray-400 font-normal align-top ml-1">đ</span>
                  </div>
                </div>

                {/* Benefits List */}
                <div className="space-y-5 flex-1">
                  <div className="flex items-center gap-4 group/icon">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0 group-hover/icon:bg-blue-500 group-hover/icon:text-white transition-all duration-300">
                      <Clock size={24} />
                    </div>
                    <div>
                      <div className="text-white font-bold text-xl group-hover:text-blue-300 transition-colors">{Math.floor(pkg.minutes)} phút</div>
                      <div className="text-sm text-gray-500">Thời gian sử dụng</div>
                    </div>
                  </div>

                  {pkg.bonusMinutes > 0 ? (
                    <div className="flex items-center gap-4 bg-gradient-to-r from-emerald-500/20 to-transparent p-3 rounded-2xl -mx-3 border-l-4 border-emerald-500 group/gift">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0 animate-bounce-slow group-hover/gift:rotate-12 transition-transform">
                        <Gift size={24} />
                      </div>
                      <div className="min-w-0">
                        <div className="text-emerald-300 font-black text-lg truncate">Tặng +{pkg.bonusMinutes} phút</div>
                        <div className="text-xs text-emerald-400/80 font-bold uppercase tracking-wide">Quà tặng đặc biệt</div>
                      </div>
                    </div>
                  ) : (
                      <div className="flex items-center gap-4 opacity-40 grayscale hover:grayscale-0 transition-all duration-500">
                           <div className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center text-gray-400 shrink-0">
                              <Gift size={24} />
                          </div>
                          <div className="text-base text-gray-500 font-medium">Không có quà tặng</div>
                      </div>
                  )}
                  
                   <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center text-purple-400 shrink-0">
                      <ShieldCheck size={24} />
                    </div>
                     <div className="text-base text-gray-400 font-medium">Bảo mật tuyệt đối</div>
                  </div>
                </div>

                {/* Action Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeposit(pkg);
                  }}
                  disabled={isLoading}
                  className={`
                    w-full py-4 rounded-xl font-black text-lg transition-all duration-300 flex items-center justify-center gap-3 group/btn relative overflow-hidden shadow-lg
                    ${selectedPackage === pkg.id
                      ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 bg-[length:200%_100%] animate-shimmer text-white shadow-blue-500/40 transform scale-105'
                      : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white hover:shadow-white/5'
                    }
                  `}
                >
                  {isLoading && selectedPackage === pkg.id ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CreditCard size={20} className="group-hover/btn:rotate-12 transition-transform duration-300" />
                      Thanh toán ngay
                    </>
                  )}
                </button>
              </div>
              
               {/* Selected Icon */}
               {selectedPackage === pkg.id && (
                  <div className="absolute -top-3 -right-3 w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full text-white shadow-lg flex items-center justify-center z-30 animate-scale-in">
                      <Check size={24} strokeWidth={4} />
                  </div>
               )}
            </div>
          ))}
        </div>
        
         {/* Footer Note */}
         <div className="text-center text-gray-500 text-sm flex flex-col items-center gap-3 pb-8">
           <div className="flex items-center gap-2 bg-black/30 px-6 py-2 rounded-full border border-white/5 backdrop-blur-sm">
              <ShieldCheck size={14} className="text-green-400" />
              <p>Thanh toán được xử lý an toàn 100% bởi <span className="text-white font-bold tracking-wider">PayOS</span></p>
           </div>
           <p className="text-xs opacity-50">Hệ thống tự động cộng tiền sau 3-5 giây kể từ khi giao dịch thành công</p>
         </div>
      </div>
    </div>
  );
};

export default DepositPage;
