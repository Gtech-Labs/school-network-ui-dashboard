import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { GraduationCap, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { useTranslation } from 'react-i18next';

export default function Login() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [schoolDomain, setSchoolDomain] = useState('');
  const [schoolStep, setSchoolStep] = useState<'domain' | 'login'>('domain');
  const [schoolInfo, setSchoolInfo] = useState<{ name: string; domain: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleSchoolDomain = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!schoolDomain.trim()) {
      toast.error(t('auth.enterSchoolDomain'));
      return;
    }

    const mockSchools: Record<string, { name: string; domain: string }> = {
      'greenwood': { name: 'Greenwood Academy', domain: 'greenwood' },
      'riverside': { name: 'Riverside High School', domain: 'riverside' },
      'oakmont': { name: 'Oakmont International', domain: 'oakmont' },
    };

    const school = mockSchools[schoolDomain.toLowerCase()];
    
    if (school) {
      setSchoolInfo(school);
      setSchoolStep('login');
      toast.success(`${t('auth.welcomeTo')} ${school.name}`);
    } else {
      toast.error(t('auth.schoolNotFound'));
    }
  };

  const handleLogin = (e: React.FormEvent, role: 'admin' | 'school') => {
    e.preventDefault();
    
    if (loginData.email && loginData.password) {
      toast.success(`${t('auth.login')} ${role}`);
      navigate(role === 'admin' ? '/admin' : '/school');
    } else {
      toast.error(t('auth.fillAllFields'));
    }
  };

  const handleBackToDomain = () => {
    setSchoolStep('domain');
    setSchoolInfo(null);
    setLoginData({ email: '', password: '' });
  };

  return (
    <div className="flex min-h-screen bg-muted/30">
      {/* Left Side - Form */}
      <div className="flex flex-1 flex-col justify-between p-6 lg:p-10 xl:p-16">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
            <GraduationCap className="h-5 w-5 text-primary" />
            <span className="font-semibold text-foreground">{t('dashboard.schoolNetwork')}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        {/* Form Content */}
        <div className="mx-auto w-full max-w-md space-y-8 animate-fade-in">
          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight">{t('auth.welcomeBack')}</h1>
            <p className="text-muted-foreground">{t('auth.enterCredentials')}</p>
          </div>

          <Tabs defaultValue="school" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6 bg-muted/50 p-1 rounded-xl">
              <TabsTrigger 
                value="school" 
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {t('auth.schoolAdmin')}
              </TabsTrigger>
              <TabsTrigger 
                value="admin"
                className="rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {t('auth.platformAdmin')}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="school" className="space-y-6">
              {schoolStep === 'domain' ? (
                <form onSubmit={handleSchoolDomain} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="school-domain" className="text-sm text-muted-foreground">
                      {t('auth.schoolDomain')}
                    </Label>
                    <Input
                      id="school-domain"
                      type="text"
                      placeholder={t('auth.schoolDomainPlaceholder')}
                      value={schoolDomain}
                      onChange={(e) => setSchoolDomain(e.target.value)}
                      className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 focus:border-primary focus:bg-card"
                      autoFocus
                    />
                    <p className="text-xs text-muted-foreground">
                      {t('auth.schoolDomainHint')}
                    </p>
                  </div>
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {t('common.continue')}
                  </Button>
                </form>
              ) : (
                <form onSubmit={(e) => handleLogin(e, 'school')} className="space-y-5">
                  <div className="flex items-center gap-2 rounded-xl bg-primary/10 p-3 mb-2">
                    <button
                      type="button"
                      onClick={handleBackToDomain}
                      className="p-1 rounded-lg hover:bg-primary/20 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4 text-primary" />
                    </button>
                    <div>
                      <p className="text-sm text-primary font-medium">
                        {schoolInfo?.name}
                      </p>
                      <p className="text-xs text-primary/70">
                        {t('auth.notYourSchool')}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school-email" className="text-sm text-muted-foreground">
                      {t('common.email')}
                    </Label>
                    <Input
                      id="school-email"
                      type="email"
                      placeholder="admin@school.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 focus:border-primary focus:bg-card"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="school-password" className="text-sm text-muted-foreground">
                      {t('auth.password')}
                    </Label>
                    <div className="relative">
                      <Input
                        id="school-password"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••••••••••"
                        value={loginData.password}
                        onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                        className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 pr-12 focus:border-primary focus:bg-card"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                  
                  <Button 
                    type="submit" 
                    className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
                  >
                    {t('auth.loginToSchoolDashboard')}
                  </Button>
                </form>
              )}
            </TabsContent>

            <TabsContent value="admin" className="space-y-5">
              <form onSubmit={(e) => handleLogin(e, 'admin')} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="admin-email" className="text-sm text-muted-foreground">
                    {t('common.email')}
                  </Label>
                  <Input
                    id="admin-email"
                    type="email"
                    placeholder="admin@platform.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
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
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-12 rounded-xl border-border/60 bg-muted/30 px-4 pr-12 focus:border-primary focus:bg-card"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-medium shadow-md hover:shadow-lg transition-all"
                >
                  {t('auth.loginToAdminPanel')}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          {/* Social Login */}
          <div className="space-y-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/60"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-muted/30 px-3 text-muted-foreground">or continue with</span>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="h-12 rounded-xl border-border/60 bg-card hover:bg-muted/50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.477 2 2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.879V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.989C18.343 21.129 22 16.99 22 12c0-5.523-4.477-10-10-10z"/>
                </svg>
                Apple
              </Button>
              <Button 
                variant="outline" 
                className="h-12 rounded-xl border-border/60 bg-card hover:bg-muted/50"
              >
                <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-sm">
          <p className="text-muted-foreground">
            Have an account? <a href="#" className="text-foreground hover:underline font-medium">Sign in</a>
          </p>
          <a href="#" className="text-foreground hover:underline font-medium">
            Terms & Conditions
          </a>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden rounded-[15px] m-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-accent/20" />
        <img
          src="https://images.unsplash.com/photo-1589156280159-27698a70f29e?w=1200&h=1600&fit=crop"
          alt="African professional"
          className="h-full w-full object-cover"
        />
        
        {/* Floating Cards */}
        <div className="absolute top-8 left-8 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/40 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            <div>
              <p className="font-semibold text-sm">Task Review With Team</p>
              <p className="text-xs text-muted-foreground">09:30am-10:00am</p>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-32 right-8 bg-card/95 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-border/40 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-warning" />
              <p className="font-semibold text-sm">Daily Meeting</p>
            </div>
            <p className="text-xs text-muted-foreground">12:00pm-01:00pm</p>
            <div className="flex -space-x-2 mt-2">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=32&h=32&fit=crop&crop=face" className="h-6 w-6 rounded-full ring-2 ring-card" alt="" />
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face" className="h-6 w-6 rounded-full ring-2 ring-card" alt="" />
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face" className="h-6 w-6 rounded-full ring-2 ring-card" alt="" />
              <div className="h-6 w-6 rounded-full bg-muted ring-2 ring-card flex items-center justify-center text-xs font-medium">+3</div>
            </div>
          </div>
        </div>
        
        <div className="absolute bottom-8 left-8 bg-card/95 backdrop-blur-sm rounded-2xl px-6 py-3 shadow-lg border border-border/40 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <div className="flex gap-4 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, i) => (
              <div key={day} className={`${i === 3 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                <p className="text-xs">{day}</p>
                <p className="text-sm font-medium mt-1">{22 + i}</p>
              </div>
            ))}
          </div>
        </div>
        
        {/* Floating Avatars */}
        <div className="absolute top-1/3 right-16 flex flex-col gap-2 animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=48&h=48&fit=crop&crop=face" className="h-10 w-10 rounded-full ring-2 ring-card shadow-lg" alt="" />
          <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=48&h=48&fit=crop&crop=face" className="h-10 w-10 rounded-full ring-2 ring-card shadow-lg ml-4" alt="" />
        </div>
      </div>
    </div>
  );
}
