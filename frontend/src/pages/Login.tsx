
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Button,
  Input,
  Label,
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from '@/components/ui';
import { toast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

const loginSchema = z.object({
  email: z.string().nonempty({ message: "يرجى إدخال البريد الإلكتروني" }),
  password: z.string().min(6, { message: "الكلمة السرية يجب ان تكون اكثر من 6 ارقام" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await fetch('https://thesheep.top/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error('Invalid credentials');
      }

      const result = await response.json();
      localStorage.setItem('token', result.token); // ✅ Store token
      localStorage.setItem('user', JSON.stringify(result.user)); // ✅ Store user info

      toast({
        title: 'Login Successful',
        description: 'Welcome back to FlockWatch!',
      });

      navigate('/');
    } catch (error) {
      toast({
        title: 'فشل تسجيل الدخول',
        description: 'رجاء قم بفحص معلومات الدخول والمحاولة مرة اخرى.',
        variant: 'destructive',
      });
    }
  };
  return (
    <div className="min-h-screen flex items-center justify-center bg-farm-green-100/30 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-farm-green-700">FlockWatch</h1>
          <p className="text-farm-green-600 mt-1">Sheep Management System</p>
        </div>
        
        <Card className="border-farm-green-200">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Welcome Back</CardTitle>
            <CardDescription className="text-center">
              Sign in to your account to continue
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="email" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input placeholder="yourname" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={form.control} name="password" render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full bg-farm-green-600 hover:bg-farm-green-700" disabled={isLoading}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
            </Form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            {/*<div className="text-sm text-center text-muted-foreground">*/}
            {/*  Demo access: admin@farm.com / password123*/}
            {/*</div>*/}
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
