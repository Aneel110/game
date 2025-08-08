
'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";
import { useState } from "react";

export function SignupForm() {
    const { toast } = useToast();
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);

        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const username = (form.elements.namedItem("username") as HTMLInputElement).value;

        if (!email || !password || !username) {
            toast({
                title: "All fields are required.",
                variant: "destructive",
            });
            setIsSubmitting(false);
            return;
        }


        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Send verification email
            await sendEmailVerification(user);

            // Update user profile
            await updateProfile(user, { displayName: username });

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: username,
                email: user.email,
                role: 'user', // Default role
                createdAt: new Date(),
                bio: "",
            });
            
            // Sign out the user so they have to verify their email
            await signOut(auth);

            toast({
                title: "Account Created! Please Verify Your Email",
                description: "A verification link has been sent to your inbox. Please check your email and click the link to activate your account before logging in.",
                duration: 10000,
            });

            // Redirect user to the login page
            router.replace('/login');

        } catch (error: any) {
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Max" required disabled={isSubmitting}/>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                    disabled={isSubmitting}
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required disabled={isSubmitting}/>
            </div>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? 'Creating Account...' : 'Create an account'}
            </Button>
            <Button variant="outline" className="w-full" disabled={isSubmitting}>
                Sign up with Google
            </Button>
        </form>
    )
}
