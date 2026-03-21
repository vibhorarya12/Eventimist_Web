import { useEffect } from 'react';
// Note: Assuming useUserAuth store exists - create if needed
// import { useUserAuth } from '../../../store/eventimist/user/auth/AuthState';

export const useSyncUserAuthCookie = () => {
  // const { setAccessToken } = useUserAuth();

  useEffect(() => {
    // Sync cookie to store on mount
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('user_token='))
      ?.split('=')[1];

    if (token) {
      // setAccessToken(token);
      console.log('User token found:', token);
    }
  }, []);
};