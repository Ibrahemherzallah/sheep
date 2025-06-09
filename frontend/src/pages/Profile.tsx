import {useEffect, useState} from "react";
import {Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {Form, FormControl, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {toast} from "@/hooks/use-toast.ts";



const passwordFormSchema = z.object({
  currentPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  newPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  confirmPassword: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords don't match.",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export default function Profile() {
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState(JSON.parse(localStorage.getItem("user") || "{}"));
    const [token, setToken] = useState(localStorage.getItem("token") || "");

  // Profile form
  const profileForm = useForm({
    defaultValues: {
      name: "",
    },
  });

  // Password form
  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });


  const onProfileSubmit = async (data) => {
      console.log("data : " , data);
        setIsLoading(true);
        try {
            const response = await fetch("https://thesheep.top/api/auth/update", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ name: data.name }),
            });

            if (!response.ok) throw new Error("Update failed");

            const result = await response.json();

            // Update localStorage user data
            const updatedUser = {
                name: result.user.name,
            };
            localStorage.setItem("user", JSON.stringify(updatedUser));

            toast({
                title: "تم التحديث بنجاح",
                description: "تم حفظ معلوماتك الشخصية.",
            });
        } catch (error) {
            toast({
                title: "فشل التحديث",
                description: "حدث خطأ أثناء حفظ المعلومات.",
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };
  const onPasswordSubmit = async (data: PasswordFormValues) => {
        setIsLoading(true);

        try {
            const token = localStorage.getItem("token"); // your JWT token

            const response = await fetch("https://thesheep.top/api/auth/change-password", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,  // send token in header
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || "Password change failed");
            }

            toast({
                title: "تم تغيير كلمة المرور بنجاح",
                description: "تم تحديث كلمة المرور الخاصة بك.",
            });

            passwordForm.reset();
        } catch (error) {
            toast({
                title: "فشل تغيير كلمة المرور",
                description: error.message,
                variant: "destructive",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        console.log("The userData is : " , userData);
        if (userData?.name) {
            profileForm.reset({
                name: userData.name,
            });
        }
    }, []);



  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-8">حسابي</h1>
      
      <div className="space-y-8" dir={'rtl'}>
        {/* Profile Information Card */}
          <Card>
              <CardHeader>
                  <CardTitle>معلومات الحساب</CardTitle>
                  <CardDescription>عدل معلوماتك الشخصية</CardDescription>
              </CardHeader>
              <CardContent>
                  <Form {...profileForm}>
                      <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                          <FormField control={profileForm.control} name="name" render={({ field }) => (
                                  <FormItem>
                                      <FormLabel>الإسم</FormLabel>
                                      <FormControl>
                                          <Input placeholder="الإسم" {...field} />
                                      </FormControl>
                                      <FormMessage />
                                  </FormItem>
                              )}
                          />
                          <Button type="submit" disabled={isLoading}>
                              {isLoading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
                          </Button>
                      </form>
                  </Form>

              </CardContent>
          </Card>

        {/* Password Card */}
        <Card>
          <CardHeader>
            <CardTitle>تغيير كلمة المرور</CardTitle>
            <CardDescription>
              عدل كلمة المرور الخاصة بك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField control={passwordForm.control} name="currentPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور الحالية</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••" 
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={passwordForm.control} name="newPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>كلمة المرور الجديدة</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••"
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField control={passwordForm.control} name="confirmPassword" render={({ field }) => (
                    <FormItem>
                      <FormLabel>تأكيد كلمة المرور الجديدة</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="••••••••"
                          type="password" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "يتم التغيير..." : "تغيير كلمة المرور"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
