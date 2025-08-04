
'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import React from "react";

export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const emailRef = React.useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      const userDocRef = doc(db, 'users', userCredential.user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      toast({
        title: "Login Successful",
        description: "Welcome back!",
      });

      if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }

    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handlePasswordReset = async () => {
    const email = emailRef.current?.value;
    if (!email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to reset your password.",
        variant: "destructive",
      });
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast({
        title: "Password Reset Email Sent",
        description: "Check your inbox for a link to reset your password.",
      });
    } catch (error: any) {
       toast({
        title: "Password Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    }
  };


  return (
    <form onSubmit={handleLogin} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input ref={emailRef} id="email" type="email" placeholder="m@example.com" required />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Button
            type="button"
            variant="link"
            onClick={handlePasswordReset}
            className="ml-auto inline-block h-auto p-0 text-sm underline"
          >
            Forgot your password?
          </Button>
        </div>
        <Input id="password" type="password" required />
      </div>
      <Button type="submit" className="w-full">
        Login
      </Button>
      <Button variant="outline" className="w-full">
        Login with Google
      </Button>
    </form>
  )
}
