
"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ShieldCheck, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast";
import { handlePasswordReset, createUserAccount } from "./actions";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Name is too short"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [isSigningUp, setIsSigningUp] = useState(false);

  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [isSignupDialogOpen, setIsSignupDialogOpen] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Firebase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // AuthProvider will handle redirection based on role.
    } catch (error: any) {
      console.error("Authentication error:", error);
      let errorMessage = "An unexpected error occurred.";
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Please enter a valid email address.';
      } else if (error.code === 'auth/disabled') {
        errorMessage = 'Your account is pending approval by an administrator.';
      }
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Firebase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    const validation = signupSchema.safeParse({ name: signupName, email: signupEmail, password: signupPassword });
    if (!validation.success) {
      toast({
        variant: "destructive",
        title: "Invalid data",
        description: validation.error.errors[0].message,
      });
      return;
    }

    setIsSigningUp(true);
    const result = await createUserAccount({ name: signupName, email: signupEmail, password: signupPassword });

    if (result.success) {
      toast({
        title: "Account Created!",
        description: "Your account has been created and is awaiting admin approval.",
      });
      setIsSignupDialogOpen(false);
      setSignupName('');
      setSignupEmail('');
      setSignupPassword('');
    } else {
      toast({
        variant: "destructive",
        title: "Signup Failed",
        description: result.error,
      });
    }
    setIsSigningUp(false);
  };

  const handleDemoLogin = async (email: string) => {
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Firebase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, 'password');
    } catch (error) {
      console.error("Demo login failed:", error);
      toast({
        variant: "destructive",
        title: "Demo Login Failed",
        description: `Could not log in. Please create a user for '${email}' in your Firebase project with the password 'password' and assign them a role.`,
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const onPasswordReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!auth) {
      toast({
        variant: "destructive",
        title: "Firebase Not Configured",
        description: "Firebase is not properly configured. Please check your environment variables.",
      });
      return;
    }
    setIsResetting(true);
    const result = await handlePasswordReset(resetEmail);
    if (result.success) {
      toast({
        title: "Password Reset Email Sent",
        description: "Please check your inbox to reset your password.",
      });
      setIsResetDialogOpen(false);
    } else {
      toast({
        variant: "destructive",
        title: "Error",
        description: result.error,
      });
    }
    setIsResetting(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary">
              <ShieldCheck className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-3xl font-bold">RegPlus</CardTitle>
            <CardDescription>
              Condominium Security & Management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="m@example.com" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
                    <DialogTrigger asChild>
                       <button type="button" className="text-sm font-medium text-primary hover:underline">
                        Forgot password?
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Reset Password</DialogTitle>
                        <DialogDescription>
                          Enter your email address and we will send you a link to reset your password.
                        </DialogDescription>
                      </DialogHeader>
                      <form onSubmit={onPasswordReset} className="space-y-4">
                        <Input
                          id="reset-email"
                          type="email"
                          placeholder="m@example.com"
                          required
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                        />
                        <Button type="submit" className="w-full" disabled={isResetting}>
                          {isResetting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Send Reset Link
                        </Button>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Login
              </Button>
            </form>

            <div className="mt-4 text-center text-sm">
                <p>
                    Don't have an account?{' '}
                    <Dialog open={isSignupDialogOpen} onOpenChange={setIsSignupDialogOpen}>
                        <DialogTrigger asChild>
                            <button className="font-medium text-primary hover:underline">Sign up</button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>Create an Account</DialogTitle>
                                <DialogDescription>
                                    After registration, your account must be approved by an administrator before you can log in.
                                </DialogDescription>
                            </DialogHeader>
                            <form onSubmit={handleSignup} className="space-y-4">
                                <Input placeholder="Full Name" value={signupName} onChange={e => setSignupName(e.target.value)} required disabled={isSigningUp} />
                                <Input type="email" placeholder="Email" value={signupEmail} onChange={e => setSignupEmail(e.target.value)} required disabled={isSigningUp} />
                                <Input type="password" placeholder="Password" value={signupPassword} onChange={e => setSignupPassword(e.target.value)} required disabled={isSigningUp} />
                                <Button type="submit" className="w-full" disabled={isSigningUp}>
                                    {isSigningUp && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Create Account
                                </Button>
                            </form>
                        </DialogContent>
                    </Dialog>
                </p>
            </div>
            
            <div className="mt-4 text-center text-sm">
              <p className="text-muted-foreground">Or continue for demo:</p>
               <Button onClick={() => handleDemoLogin('guard@regplus.com')} variant="outline" className="mt-2 w-full" disabled={isLoading}>
                Login as Guard
              </Button>
               <Button onClick={() => handleDemoLogin('admin@regplus.com')} variant="outline" className="mt-2 w-full" disabled={isLoading}>
                Login as Admin
              </Button>
               <Button onClick={() => handleDemoLogin('resident@regplus.com')} variant="outline" className="mt-2 w-full" disabled={isLoading}>
                Login as Resident
              </Button>
              <Button onClick={() => handleDemoLogin('titular@regplus.com')} variant="outline" className="mt-2 w-full" disabled={isLoading}>
                Login as Titular Condo
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

    