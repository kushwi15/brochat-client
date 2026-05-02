import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, Eye, EyeOff } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { api } from '../../services/api';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const resetPasswordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [showPassword, setShowPassword] = useState(false);

  const form = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordValues) => {
    if (!token) {
      toast.error('Invalid reset token');
      return;
    }

    try {
      await api.post('/auth/reset-password', {
        token,
        newPassword: data.password
      });
      toast.success('Password reset successful! Please log in.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    }
  };

  if (!token) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background p-4 text-center">
        <div className="max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Invalid Reset Link</h1>
          <p className="text-muted-foreground">This password reset link is invalid or has expired.</p>
          <Button onClick={() => navigate('/forgot-password')}>Request New Link</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background relative overflow-hidden">
      <div className="absolute top-0 -left-4 w-72 h-72 bg-primary/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-orange-500/10 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md mx-4 z-10"
      >
        <Card className="border-none shadow-2xl bg-card/80 backdrop-blur-xl">
          <CardHeader className="space-y-1 pb-6 text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
              <ShieldCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Set New Password</CardTitle>
            <CardDescription className="text-base">
              Choose a strong password to protect your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
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
                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="confirmPassword"
                  render={({ field }: any) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type={showPassword ? 'text' : 'password'} className="bg-background/50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
