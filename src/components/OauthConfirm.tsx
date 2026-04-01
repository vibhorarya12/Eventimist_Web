"use client"

import { useOrganizerOAuth } from '@/hooks/eventimist/organizer/auth/useOrganizerOAuth';
import { useClerk } from '@clerk/nextjs';




export default function OauthConfirm() {

 const {user , signOut , session} = useClerk();
  
 const {completeOAuthLogin , isLoading , error , clearError} = useOrganizerOAuth();

 const email  = user?.emailAddresses[0].emailAddress;
 const clerkSessionID = session?.id;
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-8 text-center">
            <h2 className="text-2xl font-bold text-white mb-2">
              Confirm Your Account
            </h2>
            <p className="text-blue-100 text-sm">
              Please verify this is the account you want to use
            </p>
          </div>

          {/* Content */}
          <div className="px-6 py-8">
            {/* Error Message */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start justify-between">
                <p className="text-red-800 text-sm">{error}</p>
                <button
                  onClick={clearError}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}

            {/* Avatar */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                <img
                  src={user?.imageUrl}
                  alt="User avatar"
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-white"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>

            {/* Email */}
            <div className="text-center mb-8">
              
              <p className="text-gray-900 font-semibold text-lg">{user?.emailAddresses[0].emailAddress}</p>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <button
                onClick={()=>completeOAuthLogin(email!,clerkSessionID!)}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] hover:cursor-pointer shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-3 border-t-white border-gray-300 rounded-full animate-spin mr-2"></div>
                  </div>
                ) : (
                  "Continue with this account"
                )}
              </button>

              <button
                 onClick={async () => await signOut({ redirectUrl: '/organizer/auth' })}
                 disabled={isLoading}
                className="w-full bg-gray-100 hover:bg-gray-200 hover:cursor-pointer text-gray-700 font-medium py-3 px-4 rounded-xl transition-all duration-200 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                No, use a different account
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-500 text-sm">
            By continuing, you agree to our{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Terms of Service
            </a>{' '}
            and{' '}
            <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
