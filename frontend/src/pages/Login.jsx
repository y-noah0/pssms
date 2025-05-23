import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import FormInput from '../components/FormInput';
import Button from '../components/Button';
import Card from '../components/Card';
import { FaLock, FaUserPlus, FaSignInAlt } from 'react-icons/fa';

const Login = () => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    if (isLoginMode) {
      try {
        const result = await login(username, password);
        
        if (result.success) {
          toast.success('Login successful');
          navigate('/');
        } else {
          toast.error(result.message || 'Login failed');
        }
      } catch (error) {
        toast.error(error.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    } else {
      // Registration mode
      try {
        if (password !== confirmPassword) {
          toast.error('Passwords do not match');
          setLoading(false);
          return;
        }
        
        const result = await register(username, password);
        
        if (result.success) {
          toast.success('Registration successful! You can now login.');
          setIsLoginMode(true);
          setPassword('');
          setConfirmPassword('');
        } else {
          toast.error(result.message || 'Registration failed');
        }
      } catch (error) {
        toast.error(error.message || 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900">
            Parking Space Sales Management System
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {isLoginMode ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <Card className="mx-auto">
          <div className="flex border-b mb-6">
            <button
              type="button"
              className={`flex-1 py-3 text-center font-medium ${
                isLoginMode 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLoginMode(true)}
            >
              <FaSignInAlt className="inline mr-2" /> Login
            </button>
            <button
              type="button"
              className={`flex-1 py-3 text-center font-medium ${
                !isLoginMode 
                  ? 'text-primary-600 border-b-2 border-primary-600' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
              onClick={() => setIsLoginMode(false)}
            >
              <FaUserPlus className="inline mr-2" /> Register
            </button>
          </div>
          <form className="space-y-6" onSubmit={handleSubmit}>
            <FormInput
              label="Username"
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              placeholder="Enter your username"
            />            <FormInput
              label="Password"
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
            />
            
            {!isLoginMode && (
              <FormInput
                label="Confirm Password"
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Confirm your password"
              />
            )}

            <Button 
              type="submit" 
              variant="primary" 
              fullWidth 
              disabled={loading}
              className="flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="animate-spin">⌛</span>
                  {isLoginMode ? 'Signing in...' : 'Registering...'}
                </>
              ) : (
                <>
                  {isLoginMode ? (
                    <>
                      <FaLock />
                      Sign in
                    </>
                  ) : (
                    <>
                      <FaUserPlus />
                      Register
                    </>
                  )}
                </>
              )}
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
