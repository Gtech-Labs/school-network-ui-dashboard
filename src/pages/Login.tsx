'use client'

import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Button} from '@/components/ui/button.tsx';
import {Input} from '@/components/ui/input.tsx';
import {Label} from '@/components/ui/label.tsx';
import {Tabs, TabsContent, TabsList, TabsTrigger} from '@/components/ui/tabs.tsx';
import {GraduationCap, Eye, EyeOff, ArrowLeft} from 'lucide-react';
import {toast} from 'sonner';
import {ThemeToggle} from '@/components/ThemeToggle.tsx';
import {LanguageToggle} from '@/components/LanguageToggle.tsx';
import {useTranslation} from 'react-i18next';
import * as React from "react";
import {useSignInMutation} from '@/hooks/auth/use-auth-mutation.ts';
import {useApiQuery} from "@/hooks/use-api-query.ts";
import { useAuth } from '@/context/AuthContext';
import {SignInRequest} from '@/types/auth';

export default function Login() {
    const {mutate, isPending, error} = useSignInMutation();
    const { login } = useAuth();

    const navigate = useNavigate();
    const {t} = useTranslation();
    const [showPassword, setShowPassword] = useState(false);

    // check if the school ID of the user exists in the db

    const {data: schools, isLoading, isError} = useApiQuery<never[]>(
        ['schools'],
        '/schools',
        {
            staleTime: 1000 * 60 // 1 minute
        }
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const formData = new FormData(e.currentTarget);
        const data = {
            email: formData.get('email') as string,
            password: formData.get('password') as string,
        }
        mutate(data, {
            onSuccess: (data) => {
                login(data.accessToken);
                toast.success("Login successful");
                const tenantId = data?.user?.tenant_id;
                // check if the tenant ID exists in our DB

                const isExisting = (!isLoading && !isError && schools && schools.length > 0) && schools.some(school => school.tenant_id === tenantId);

                localStorage.setItem('token', data.accessToken);
                if(tenantId && tenantId === 'sn_network'){
                    console.log('Redirecting to admin dashboard');
                    navigate('/admin');
                }else if(isExisting){
                    navigate('/school', {replace: true});
                }else{
                    // Redirect them to a page telling them that their school is not yet configured.
                    navigate('/', {replace: true});
                }
            },
            onError: (error) => {
                // Handle errors (like wrong password)
                toast.error(error.message || t('auth.loginFailed'));
            }
        });
    };

    return (
        <div className="flex min-h-screen bg-muted/30 overflow-hidden w-full h-full">
            {/* Left Side - Form */}
            <div className="flex flex-1 flex-col justify-between p-6 lg:p-10 xl:p-16">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div
                        className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
                        <GraduationCap className="h-5 w-5 text-primary"/>
                        <span className="font-semibold text-foreground">{t('dashboard.schoolNetwork')}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LanguageToggle/>
                        <ThemeToggle/>
                    </div>
                </div>

                {/* Form Content */}
                <div className="mx-auto w-full max-w-md space-y-8 animate-fade-in">
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
                        <p className="text-muted-foreground">{t('auth.enterCredentials')}</p>
                    </div>

                    <Tabs defaultValue="school" className="w-full">
                        <div className="space-y-5">
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email" className="text-sm text-muted-foreground">
                                        {t('common.email')}
                                    </Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        placeholder="admin@platform.com"
                                        name="email"
                                        className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 focus:border-primary focus:bg-card"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin-password" className="text-sm text-muted-foreground">
                                        {t('auth.password')}
                                    </Label>
                                    <div className="relative">
                                        <Input
                                            id="admin-password"
                                            type={showPassword ? 'text' : 'password'}
                                            placeholder="••••••••••••••••"
                                            name="password"
                                            className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 pr-12 focus:border-primary focus:bg-card"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="h-5 w-5"/> : <Eye className="h-5 w-5"/>}
                                        </button>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
                                >
                                    {isPending ? "Signing..." : t('auth.loginToAdminPanel')}
                                </Button>
                            </form>
                        </div>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                    <a href="#" className="text-foreground hover:underline font-medium">
                        Terms & Conditions
                    </a>
                </div>
            </div>

            {/* Right Side - Image */}
            <div className="hidden lg:flex lg:flex-1 relative overflow-hidden rounded-[15px]">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20"/>
                <img
                    src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=1200&h=1600&fit=crop"
                    alt="African professional"
                    style={{height: '100vh', width: '100%'}}
                />

                {/* Floating Cards */}
                <div
                    className="absolute top-8 left-8 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/40 animate-fade-in">
                    <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-pulse"/>
                        <div>
                            <p className="font-semibold text-sm">The School Operating System</p>
                            <p className="text-xs text-muted-foreground">The system every serious school runs on</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
