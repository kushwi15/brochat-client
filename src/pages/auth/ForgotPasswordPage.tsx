import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link } from 'react-router-dom';
import { ArrowLeft, MailCheck } from 'lucide-react';
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

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordValues) => {
    try {
      await api.post('/auth/forgot-password', data);
      setIsSubmitted(true);
      toast.success('Reset link sent to your email');
    } catch (error: any) {
      toast.error('Something went wrong. Please try again.');
    }
  };

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
              <MailCheck className="w-6 h-6 text-primary" />
            </div>
            <CardTitle className="text-3xl font-bold tracking-tight">Forgot Password?</CardTitle>
            <CardDescription className="text-base">
              Enter your email and we'll send you a link to reset your password.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isSubmitted ? (
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: any) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <Input placeholder="m@example.com" className="bg-background/50" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={form.formState.isSubmitting}>
                    {form.formState.isSubmitting ? 'Sending link...' : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
            ) : (
              <div className="text-center py-4 space-y-4">
                <p className="text-muted-foreground text-sm leading-relaxed">
                  We've sent a password reset link to your email. Please check your inbox and spam folder.
                </p>
                <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
                  Resend Email
                </Button>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center pb-8">
            <Link to="/login" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  );
}
