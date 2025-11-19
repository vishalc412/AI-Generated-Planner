import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-toastify';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
const APPLE_CLIENT_ID = import.meta.env.VITE_APPLE_CLIENT_ID || '';

const Login: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    // Initialize Apple Sign In
    if (window.AppleID) {
      window.AppleID.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: 'name email',
        redirectURI: window.location.origin + '/auth/apple/callback',
        usePopup: true,
      });
    }
  }, []);

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      await login(credentialResponse.credential, 'google');
      toast.success('Successfully logged in!');
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (error) {
      toast.error('Failed to login with Google');
      console.error('Google login error:', error);
    }
  };

  const handleGoogleError = () => {
    toast.error('Google login failed');
  };

  const handleAppleLogin = async () => {
    try {
      if (!window.AppleID) {
        toast.error('Apple Sign In not available');
        return;
      }
      const data = await window.AppleID.auth.signIn();
      await login(data.authorization.id_token, 'apple');
      toast.success('Successfully logged in!');
      // Navigation handled by useEffect when isAuthenticated changes
    } catch (error) {
      toast.error('Failed to login with Apple');
      console.error('Apple login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary-600 mb-2">
            TaskPlanner
          </h1>
          <p className="text-gray-600">Manage your daily tasks efficiently</p>
        </div>

        <div className="space-y-4">
          <div className="flex justify-center">
            <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleError}
                useOneTap
                theme="outline"
                size="large"
                text="signin_with"
              />
            </GoogleOAuthProvider>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">OR</span>
            </div>
          </div>

          <button
            onClick={handleAppleLogin}
            className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-black text-white hover:bg-gray-900 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Sign in with Apple
          </button>
        </div>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};

// Declare Apple ID type
declare global {
  interface Window {
    AppleID: any;
  }
}

export default Login;
