// Note: Assuming useUserAuth store exists - create if needed
// import { useUserAuth } from '../../../store/eventimist/user/auth/AuthState';

export const useUserLogout = () => {
  // const { clearAuth } = useUserAuth();

  const logout = () => {
    // clearAuth();
    // Clear cookie
    document.cookie = 'user_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  };

  return { logout };
};