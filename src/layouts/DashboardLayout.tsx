
import { type ReactNode, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogOut, Home, Info, Shield, FileText, Menu, X, Mail, Clock, CreditCard } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface DashboardLayoutProps {
  children: ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();

  const navItems = [
    { icon: Home, label: 'Bảng điều khiển', path: '/dashboard' },
    { icon: CreditCard, label: 'Nạp tiền', path: '/deposit' },
    { icon: Info, label: 'Về chúng tôi', path: '/about' },
    { icon: Shield, label: 'Chính sách bảo mật', path: '/privacy' },
    { icon: FileText, label: 'Điều khoản dịch vụ', path: '/terms' },
  ];

  const formatTime = (ms: number = 0) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50 w-64 bg-gray-900 border-r border-gray-800 
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="p-6 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-4 group">
            {/* <img 
              src="/logo.png" 
              alt="Z-Video Logo" 
              className="w-24 h-24 object-contain group-hover:scale-105 transition-transform duration-300" 
            /> */}
            <h1 className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
              Z-Video
            </h1>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map((item) => {
             const isActive = location.pathname === item.path;
             return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive 
                    ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 border border-blue-500/30' 
                    : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                }`}
              >
                <item.icon size={20} />
                <span className="font-medium">{item.label}</span>
              </Link>
             );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-800">
           <div className="flex flex-col gap-3 px-4 py-3">
              <div className="flex items-center gap-3 text-gray-400">
                <div className="w-10 h-10 shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold overflow-hidden">
                    {user?.avatar ? (
                        <img src={user.avatar} alt={user.nickname} className="w-full h-full object-cover" />
                    ) : (
                        user?.nickname?.[0] || user?.username?.[0] || 'U'
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user?.nickname || user?.username}</p>
                    <p className="text-xs truncate flex items-center gap-1">
                      <span className={`w-1.5 h-1.5 rounded-full ${user?.vip ? 'bg-yellow-400' : 'bg-gray-500'}`}></span>
                      {user?.vip ? 'VIP Member' : 'Standard Plan'}
                    </p>
                </div>
              </div>
              
              <div className="space-y-2 mt-1">
                <div className="flex items-center gap-2 text-xs text-gray-400 truncate">
                  <Mail size={12} className="shrink-0" />
                  <span className="truncate">{user?.mail || 'No email'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={12} />
                    <span>Time Left</span>
                  </div>
                  <span className="text-blue-400 font-medium font-mono">{formatTime(user?.remaining_time_ms)}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-gray-400">
                    <CreditCard size={12} />
                    <span>Balance</span>
                  </div>
                  <span className="text-purple-400 font-medium">${user?.balance?.toFixed(2) || '0.00'}</span>
                </div>
              </div>
           </div>
           <button 
             onClick={() => {
               logout();
               toast.success('Logged out successfully');
             }}
             className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold text-red-400 hover:text-white bg-red-500/5 hover:bg-red-500 rounded-xl transition-all border border-red-500/20 hover:border-red-500 shadow-lg shadow-red-500/5 hover:shadow-red-500/20 active:scale-95"
           >
             <LogOut size={16} />
             Sign Out
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen relative overflow-hidden">
         {/* Top Bar Mobile */}
         <header className="lg:hidden h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-4">
             <button onClick={() => setIsSidebarOpen(true)} className="text-gray-400 hover:text-white">
                <Menu size={24} />
             </button>
             <div className="flex items-center gap-3">
                <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain" />
                <span className="text-2xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Z-Video</span>
             </div>
             <div className="w-6" /> {/* Spacer */}
         </header>

         {/* Background Gradients */}
         <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[100px]" />
             <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[100px]" />
         </div>

        <main className="flex-1 overflow-auto p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
