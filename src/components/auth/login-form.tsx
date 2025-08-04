
'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, sendPasswordResetEmail, sendEmailVerification, signOut, User } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import React, { useState } from "react";

function ResendVerificationButton({ user }: { user: User }) {
    const { toast } = useToast();
    const [isSending, setIsSending] = useState(false);

    const handleResend = async () => {
        setIsSending(true);
        try {
            await sendEmailVerification(user);
            toast({
                title: 'Verification Email Sent',
                description: 'A new verification link has been sent to your email address.',
            });
        } catch (error: any) {
            toast({
                title: 'Error',
                description: 'Failed to resend verification email. Please try again later.',
                variant: 'destructive',
            });
        } finally {
            setIsSending(false);
        }
    };

    return (
        <Button onClick={handleResend} disabled={isSending} variant="link" className="p-0 h-auto">
            {isSending ? 'Sending...' : 'Resend verification email'}
        </Button>
    );
}


export function LoginForm() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const emailRef = React.useRef<HTMLInputElement>(null);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const form = e.currentTarget;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;
    const password = (form.elements.namedItem("password") as HTMLInputElement).value;
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
          await signOut(auth);
          toast({
              title: "Email Not Verified",
              description: (
                  <div className="flex flex-col gap-2">
                      <span>Please verify your email before logging in. A verification link was sent to your email.</span>
                      <ResendVerificationButton user={user} />
                  </div>
              ),
              variant: "destructive",
              duration: 10000,
          });
          setIsSubmitting(false);
          return;
      }
      
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
    } finally {
        setIsSubmitting(false);
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
    setIsSubmitting(true);
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
    } finally {
        setIsSubmitting(false);
    }
  };


  return (
    <form onSubmit={handleLogin} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input ref={emailRef} id="email" type="email" placeholder="m@example.com" required disabled={isSubmitting} />
      </div>
      <div className="grid gap-2">
        <div className="flex items-center">
          <Label htmlFor="password">Password</Label>
          <Button
            type="button"
            variant="link"
            onClick={handlePasswordReset}
            disabled={isSubmitting}
            className="ml-auto inline-block h-auto p-0 text-sm underline"
          >
            Forgot your password?
          </Button>
        </div>
        <Input id="password" type="password" required disabled={isSubmitting} />
      </div>
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Login'}
      </Button>
      <Button variant="outline" className="w-full" disabled={isSubmitting}>
        Login with Google
      </Button>
    </form>
  )
}
