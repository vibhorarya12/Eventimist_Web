'use client'

import { useCallback } from 'react'
import { useClerk, useSession } from '@clerk/nextjs'
import { useSignIn } from '@clerk/nextjs/legacy'

type OAuthStrategy = 'oauth_google' // extend later if needed

interface UseOAuthSignInReturn {
  signInWith: (redirectUrl: string) => Promise<void>
  signOut: (options?: { redirectUrl?: string }) => Promise<void>
  user: ReturnType<typeof useClerk>['user']
  session: ReturnType<typeof useSession>['session']
  isLoaded: boolean
}

export function useOAuthSignIn(): UseOAuthSignInReturn {
  const { signIn, isLoaded } = useSignIn()
  const { signOut, user } = useClerk()
  const { session } = useSession()

  const signInWith = useCallback(
    async (redirectUrl: string) => {
      if (!isLoaded || !signIn) {
        console.warn('Clerk not loaded yet')
        return
      }

      try {
        await signIn.authenticateWithRedirect({
          strategy: 'oauth_google' as OAuthStrategy,
          redirectUrl: '/oauth-callback',
          redirectUrlComplete: redirectUrl,
        })
      } catch (error: unknown) {
        console.error('OAuth Sign-In Error:', error)

        // safer error handling
        if (typeof error === 'object' && error !== null && 'errors' in error) {
          const clerkError = error as {
            errors?: { message?: string }[]
          }

          const message =
            clerkError.errors?.[0]?.message ?? 'Sign-in failed'

          window.alert(message)
        } else {
          window.alert('Unexpected error during sign-in')
        }
      }
    },
    [isLoaded, signIn]
  )

  return {
    signInWith,
    signOut,
    user,
    session,
    isLoaded,
  }
}