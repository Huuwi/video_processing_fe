
import { useState, type FormEvent } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, Link } from 'react-router-dom';
import axiosClient from '../api/axiosClient';
import AuthLayout from '../layouts/AuthLayout';
import { ArrowRight, Loader2 } from 'lucide-react';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: '',
    mail: '',
    phone: '',
    nickname: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    setError('');

    try {
      await axiosClient.post('/users/register', {
        username: formData.username,
        password: formData.password,
        mail: formData.mail,
        phone: formData.phone,
        nickname: formData.nickname
      });
      toast.success('Registration successful! Please login.');
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <AuthLayout title="Create Account" subtitle="Join for free today">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
            <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <div className="w-1.5 h-1.5 rounded-full bg-red-600" />
                {error}
            </div>
        )}

        {/* 2 Cols for Compactness */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-bold ml-1">Username</label>
                <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                    placeholder="Choose username"
                    required
                />
            </div>
             <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-bold ml-1">Nickname</label>
                <input
                    type="text"
                    name="nickname"
                    value={formData.nickname}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                    placeholder="Display name"
                    required
                />
            </div>
        </div>

        <div className="space-y-1.5">
            <label className="text-gray-700 text-sm font-bold ml-1">Email Address</label>
            <input
                type="email"
                name="mail"
                value={formData.mail}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                placeholder="name@example.com"
                required
            />
        </div>

        <div className="space-y-1.5">
            <label className="text-gray-700 text-sm font-bold ml-1">Phone Number</label>
            <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                placeholder="+84 123 456 789"
            />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-bold ml-1">Password</label>
                <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                    placeholder="Create password"
                    required
                />
            </div>
             <div className="space-y-1.5">
                <label className="text-gray-700 text-sm font-bold ml-1">Confirm</label>
                <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6] placeholder-gray-400 transition-all font-medium text-sm"
                    placeholder="Repeat password"
                    required
                />
            </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#8B5CF6] hover:bg-[#7c4dff] text-white font-bold py-3.5 rounded-xl shadow-lg shadow-purple-500/30 transform transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-4"
        >
          {isLoading ? (
               <Loader2 className="animate-spin w-5 h-5" />
          ) : (
              <>
                Create Account
                <ArrowRight className="w-5 h-5" />
              </>
          )}
        </button>

        <p className="text-center text-gray-500 text-sm mt-6 font-medium">
          Already have an account?{' '}
          <Link to="/login" className="text-[#8B5CF6] hover:text-[#7c4dff] font-bold hover:underline">
            Log in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};

export default RegisterPage;
