
'use client';

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import { doc, setDoc } from "firebase/firestore";

export function SignupForm() {
    const { toast } = useToast();
    const router = useRouter();

    const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        const password = (form.elements.namedItem("password") as HTMLInputElement).value;
        const username = (form.elements.namedItem("username") as HTMLInputElement).value;

        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update user profile
            await updateProfile(user, { displayName: username });

            // Send verification email
            await sendEmailVerification(user);

            // Create user document in Firestore
            await setDoc(doc(db, "users", user.uid), {
                uid: user.uid,
                displayName: username,
                email: user.email,
                role: 'user', // Default role
                createdAt: new Date(),
            });

            toast({
                title: "Account Created",
                description: "A verification email has been sent. Please check your inbox to complete the signup.",
            });

            // Redirect user to the login page to wait for verification
            router.push('/login');

        } catch (error: any) {
            toast({
                title: "Signup Failed",
                description: error.message,
                variant: "destructive",
            });
        }
    };

    return (
        <form onSubmit={handleSignup} className="grid gap-4">
            <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Max" required />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    required
                />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full">
                Create an account
            </Button>
            <Button variant="outline" className="w-full">
                Sign up with Google
            </Button>
        </form>
    )
}
