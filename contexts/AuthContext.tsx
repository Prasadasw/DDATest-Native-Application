import React, { createContext, useContext, useState, ReactNode } from 'react';

// For testing purposes, let's create a simple JWT token manually
const createTestToken = () => {
  // This creates a simple JWT-like token for testing
  // In production, you should get this from your login API
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'HS256' }));
  const payload = btoa(JSON.stringify({ 
    id: 1, 
    mobile: '1234567890',
    exp: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60) // 30 days
  }));
  const signature = 'test-signature'; // This won't be valid, but we'll handle it
  
  return `${header}.${payload}.${signature}`;
};

interface AuthContextType {
  token: string | null;
  studentId: number | null;
  isAuthenticated: boolean;
  login: (token: string, studentId: number) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // For demo purposes, we'll use mock authentication
  // In production, integrate with your actual authentication system
  const [token, setToken] = useState<string | null>(null);
  const [studentId, setStudentId] = useState<number | null>(null);

  // Auto-login for testing purposes
  React.useEffect(() => {
    autoLogin();
  }, []);

  // Debug logging for token changes
  React.useEffect(() => {
    console.log('🔑 Token changed:', token ? 'Present' : 'Missing');
  }, [token]);

  // Debug logging for studentId changes
  React.useEffect(() => {
    console.log('👤 Student ID changed:', studentId);
  }, [studentId]);

  const autoLogin = async () => {
    try {
      console.log('🔄 Checking for existing authentication...');
      
      // Check AsyncStorage for existing user session
      const AsyncStorage = await import('@react-native-async-storage/async-storage');
      const storedToken = await AsyncStorage.default.getItem('userToken');
      const storedUserData = await AsyncStorage.default.getItem('userData');
      
      console.log('📱 Stored token:', storedToken ? 'Present' : 'Missing');
      console.log('👤 Stored user data:', storedUserData ? 'Present' : 'Missing');
      
      if (storedToken && storedUserData) {
        console.log('✅ Found existing session in AsyncStorage');
        const userData = JSON.parse(storedUserData);
        console.log('👤 Parsed user data:', userData);
        setToken(storedToken);
        setStudentId(userData.id);
        console.log('✅ Restored session for user:', userData.first_name, userData.last_name);
        console.log('🎯 Set token and studentId in context');
        return;
      }
      
      console.log('ℹ️ No existing session found');
      setToken(null);
      setStudentId(null);
      
    } catch (error) {
      console.error('💥 Auto-login error:', error);
      setToken(null);
      setStudentId(null);
    }
  };

  const isAuthenticated = !!token;

  const login = (newToken: string, newStudentId: number) => {
    setToken(newToken);
    setStudentId(newStudentId);
  };

  const logout = () => {
    setToken(null);
    setStudentId(null);
  };

  const value: AuthContextType = {
    token,
    studentId,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
