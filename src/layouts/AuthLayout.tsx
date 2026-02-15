
import type { ReactNode } from 'react';

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout = ({ children, title, subtitle }: AuthLayoutProps) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#E5D4C0] p-4 font-sans">
       {/* Main Card */}
       <div className="w-full max-w-5xl bg-[#f8f9fa] rounded-[40px] shadow-2xl overflow-hidden flex flex-col lg:flex-row min-h-[600px]">
           
           {/* Left Side: Form */}
           <div className="w-full lg:w-1/2 p-12 flex flex-col justify-center relative">
               <div className="max-w-md mx-auto w-full">
                   <div className="mb-10 text-center lg:text-left">
                       <h1 className="text-3xl font-bold text-gray-900 mb-3 font-display">{title}</h1>
                       <p className="text-gray-500 font-medium">{subtitle}</p>
                   </div>
                   
                   {children}
                   
                   {/* Footer Links (Common) */}
                   <div className="mt-8 flex justify-center gap-4">
                       {/* Social buttons placeholder managed by pages usually, but branding here */}
                   </div>
               </div>
           </div>

           {/* Right Side: Illustration */}
           <div className="hidden lg:block w-1/2 relative">
               <div className="absolute inset-2 bg-black rounded-[32px] overflow-hidden">
                    <img 
                        src="https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&q=80&w=2000" 
                        alt="Landscape"
                        className="w-full h-full object-cover opacity-90 hover:scale-105 transition-transform duration-[20s]"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex flex-col justify-end p-12">
                         <h2 className="text-white text-2xl font-bold mb-2">Capture the Moment</h2>
                         <p className="text-white/80">Automate your video workflow </p>
                    </div>
               </div>
           </div>

       </div>
    </div>
  );
};

export default AuthLayout;
