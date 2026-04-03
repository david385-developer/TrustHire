import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { subscribeToPush, getNotificationPermission } from '../utils/pushNotifications';

interface User {
  _id: string;
  name: string;
  email: string;
  role: 'candidate' | 'recruiter';
  isVerified?: boolean;
  avatar?: string;
  phone?: string;
  location?: string;
  bio?: string;
  resume?: string;
  skills?: string[];
  experience?: number;
  dateOfBirth?: string;
  qualification?: string;
  stream?: string;
  graduationStatus?: string;
  passedOutYear?: number;
  summary?: string;
  createdAt?: string;
  // Recruiter fields
  company?: string;
  companyName?: string;
  companyDescription?: string;
  companyWebsite?: string;
  companyLocation?: string;
  industry?: string;
  companySize?: string;
  foundedIn?: string;
  companyEmail?: string;
  companyPhone?: string;
  designation?: string;
  profileCompleted?: boolean;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
  updateUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: 'LOGIN'; payload: { token: string; user: User } }
  | { type: 'LOGOUT' }
  | { type: 'UPDATE_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false
      };
    case 'LOGOUT':
      return {
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload
      };
    case 'SET_LOADING':
      return {
        ...state,
        loading: action.payload
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    loading: true,
    isAuthenticated: false
  });

  useEffect(() => {
    try {
      const token = localStorage.getItem('trusthire_token');
      const userStr = localStorage.getItem('trusthire_user');

      if (token && userStr) {
        const user = JSON.parse(userStr);
        if (user && user._id && user.email && user.role) {
          // If user is somehow stored without verification, don't authenticate
          if (user.isVerified === false) {
            localStorage.removeItem('trusthire_token');
            localStorage.removeItem('trusthire_user');
            dispatch({ type: 'SET_LOADING', payload: false });
            return;
          }
          dispatch({ type: 'LOGIN', payload: { token, user } });
          
          // HANDLE PUSH SUBSCRIPTION ON REFRESH
          const permission = getNotificationPermission();
          if (permission !== 'denied') {
            subscribeToPush().catch(err => console.error('Silent subscribe failed:', err));
          }
          return;
        }
      }
      
      // If we got here, something wasn't right with the payload, so clean up
      if (token || userStr) {
        localStorage.removeItem('trusthire_token');
        localStorage.removeItem('trusthire_user');
      }
      dispatch({ type: 'SET_LOADING', payload: false });
      
    } catch {
      // Corrupted localStorage
      localStorage.removeItem('trusthire_token');
      localStorage.removeItem('trusthire_user');
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('trusthire_token', token);
    localStorage.setItem('trusthire_user', JSON.stringify(user));
    dispatch({ type: 'LOGIN', payload: { token, user } });

    // Handle push notifications (fire and forget)
    const permission = getNotificationPermission();
    if (permission === 'default' || permission === 'granted') {
      subscribeToPush().catch(err => console.error('Auto-subscribe failed:', err));
    }
  };

  const logout = () => {
    localStorage.removeItem('trusthire_token');
    localStorage.removeItem('trusthire_user');
    dispatch({ type: 'LOGOUT' });
  };

  const updateUser = (user: User) => {
    localStorage.setItem('trusthire_user', JSON.stringify(user));
    dispatch({ type: 'UPDATE_USER', payload: user });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
