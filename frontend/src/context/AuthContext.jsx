import { createContext, useContext, useState, useEffect } from 'react';
import AuthService from '../services/authService';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const user = AuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    }
    setLoading(false);
  }, []);

  const login = async (username, password) => {
    try {
      const data = await AuthService.login(username, password);
      if (data.success) {
        setCurrentUser(data.user);
        return { success: true };
      }
      return { success: false, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Login failed' };
    }
  };

  const logout = () => {
    AuthService.logout();
    setCurrentUser(null);
    navigate('/login');
  };

  const register = async (username, password) => {
    try {
      const data = await AuthService.register(username, password);
      return { success: data.success, message: data.message };
    } catch (error) {
      return { success: false, message: error.message || 'Registration failed' };
    }
  };

  const value = {
    currentUser,
    login,
    logout,
    register,
    isAuthenticated: AuthService.isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
