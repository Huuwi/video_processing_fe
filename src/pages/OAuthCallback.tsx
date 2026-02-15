import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axiosClient from '../api/axiosClient';
import { Loader2 } from 'lucide-react';

const OAuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login } = useAuth();
    const token = searchParams.get('token');

    useEffect(() => {
        const handleCallback = async () => {
            if (token) {
                try {
                    // Fetch user info with the token
                    const response: any = await axiosClient.get('/users/profile', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    login(token, response);
                    navigate('/');
                } catch (error) {
                    console.error('OAuth callback error:', error);
                    navigate('/login');
                }
            } else {
                navigate('/login');
            }
        };

        handleCallback();
    }, [token, login, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <p className="text-gray-600 font-medium">Authenticating...</p>
            </div>
        </div>
    );
};

export default OAuthCallback;
