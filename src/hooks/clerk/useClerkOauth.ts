'use client'
import { useClerk, useSession } from "@clerk/nextjs";
import { useSignIn } from "@clerk/nextjs/legacy";


export function useOAuthSignIn(){

    const {signIn} = useSignIn();
    const {signOut , user } = useClerk();
    const {session} = useSession();
    
    const signInWith = async ( redirectUrl :string) => {
    if (!signIn) return

    try {
      await signIn.authenticateWithRedirect({
        strategy :'oauth_google',
        redirectUrl: '/oauth-callback',
        redirectUrlComplete:  redirectUrl,
      })
    } catch (err: any) {
      console.error('OAuth Sign-In Error:', err)
    //   toast({
    //     title: 'Sign-In Failed',
    //     description: err.errors?.[0]?.message || 'An error occurred',
    //     variant: 'destructive',
    //   })

     window.alert("sign in failed")
    }
  }

  return { signInWith, signOut, user, session }


}