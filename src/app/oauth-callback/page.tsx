"use client"
import { useClerk } from "@clerk/nextjs";
import { useEffect } from "react";



export default function SSOCallback(){

    const {handleRedirectCallback} = useClerk();


     useEffect(() => {
    const completeSignIn = async () => {
      try {
        const result = await handleRedirectCallback({});
        console.warn("Google OAuth Success:<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<", result);
     
      } catch (error) {
        console.error("Google OAuth Error:", error);
       
      }
    };

    completeSignIn();
  }, []);

  return<h2>loading.............</h2>;
}