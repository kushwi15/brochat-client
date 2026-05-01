import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { Button } from '../../components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../components/ui/form';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

import { GoogleLogin } from '@react-oauth/google';

export default function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const { setAuth, initializeGuest } = useAuthStore();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await api.post('/auth/login', data);
      const { accessToken, userId, email, name } = response.data;
      
      setAuth(accessToken, { id: userId, email, name });
      toast.success('Logged in successfully');
      navigate('/');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to log in';
      toast.error(message);
    }
  };

  const onGoogleSuccess = async (credentialResponse: any) => {
    try {
      const response = await api.post('/auth/google-login', {
        idToken: credentialResponse.credential
      });
      const { accessToken, userId, email, name } = response.data;
      
      setAuth(accessToken, { id: userId, email, name });
      toast.success('Logged in with Google');
      navigate('/');
    } catch (error: any) {
      toast.error('Google authentication failed');
    }
  };

  const handleGuestLogin = () => {
    initializeGuest();
    toast.success('Continuing as guest (limited usage)');
    navigate('/');
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-purple-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md mx-4 z-10"
      >
        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-3xl font-bold text-center tracking-tight">Welcome Back</CardTitle>
            <CardDescription className="text-center text-base">
              Sign in to your BroChat account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="m@example.com" className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input type={showPassword ? 'text' : 'password'} className="bg-background/50 pr-10" {...field} />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent text-muted-foreground"
                            onClick={() => setShowPassword(!showPassword)}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>
            </Form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
              </div>
            </div>

            <div className="flex flex-col items-center gap-4">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={onGoogleSuccess}
                  onError={() => toast.error('Google login failed')}
                  useOneTap
                  theme="outline"
                  size="large"
                  shape="pill"
                  width="100%"
                />
              </div>

              <Button variant="ghost" className="w-full h-11 text-muted-foreground hover:text-foreground" onClick={handleGuestLogin}>
                Continue as Guest
              </Button>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 text-center pb-8">
            <div className="text-sm text-muted-foreground">
              Don&apos;t have an account?{' '}
              <Link to="/register" className="text-primary font-semibold hover:underline">
                Sign up free
              </Link>
            </div>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
