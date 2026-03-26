import React from 'react';
import { useAuthStore } from '../stores/auth.store';

const AuthDebug: React.FC = () => {
  const { user, initialized, loading, error } = useAuthStore();

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-80 text-white p-4 rounded-lg text-xs max-w-sm">
      <div className="font-bold mb-2">Auth Debug</div>
      <div>Initialized: {initialized ? '' : ''}</div>
      <div>Loading: {loading ? '⏳' : ''}</div>
      <div>User: {user ? `${user.username} (${user.roles?.join(', ')})` : ''}</div>
      <div>Error: {error || ''}</div>
      <div>Session Hint: {localStorage.getItem('itms_has_session_hint') || ''}</div>
    </div>
  );
};

export default AuthDebug;