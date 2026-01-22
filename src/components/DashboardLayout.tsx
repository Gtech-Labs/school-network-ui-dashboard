import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  LayoutDashboard,
  School,
  Users,
  CreditCard,
  Bell,
  LogOut,
  Menu,
  X,
  GraduationCap,
  UserCircle,
  Banknote,
  BookOpen,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  ClipboardList,
  Settings,
  BarChart3,
  Shield,
  Globe,
  MessageSquare,
  HelpCircle,
  Database,
  Zap,
  Building2,
  FileBarChart,
  Wallet,
  Lock,
  Mail,
  Megaphone,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/ThemeToggle';
import { LanguageToggle } from '@/components/LanguageToggle';
import { getSchoolFeatures, getCurrentSchoolId } from '@/lib/schoolFeatures';

interface NavItem {
  labelKey: string;
  path: string;
  icon: React.ElementType;
  section?: string;
}

interface DashboardLayoutProps {
  role: 'admin' | 'school';
}

const adminNavItems: NavItem[] = [
  // Main
  { labelKey: 'nav.overview', path: '/admin', icon: LayoutDashboard, section: 'main' },
  { labelKey: 'nav.analytics', path: '/admin/analytics', icon: BarChart3, section: 'main' },
  
  // Management
  { labelKey: 'nav.schools', path: '/admin/schools', icon: School, section: 'management' },
  { labelKey: 'nav.users', path: '/admin/users', icon: Users, section: 'management' },
  // { labelKey: 'nav.subscriptions', path: '/admin/subscriptions', icon: Building2, section: 'management' },
  
  // Financial
  { labelKey: 'nav.billing', path: '/admin/billing', icon: CreditCard, section: 'financial' },
  { labelKey: 'nav.invoices', path: '/admin/invoices', icon: FileBarChart, section: 'financial' },
  // { labelKey: 'nav.revenue', path: '/admin/revenue', icon: Wallet, section: 'financial' },
  
  // Communication
  { labelKey: 'nav.notifications', path: '/admin/notifications', icon: Bell, section: 'communication' },
  { labelKey: 'nav.announcements', path: '/admin/announcements', icon: Megaphone, section: 'communication' },
  // { labelKey: 'nav.messages', path: '/admin/messages', icon: MessageSquare, section: 'communication' },
  // { labelKey: 'nav.emailTemplates', path: '/admin/email-templates', icon: Mail, section: 'communication' },
  
  // System
  { labelKey: 'nav.activityLog', path: '/admin/activity-log', icon: Activity, section: 'system' },
  // { labelKey: 'nav.security', path: '/admin/security', icon: Shield, section: 'system' },
  // { labelKey: 'nav.permissions', path: '/admin/permissions', icon: Lock, section: 'system' },
  // { labelKey: 'nav.integrations', path: '/admin/integrations', icon: Zap, section: 'system' },
  // { labelKey: 'nav.database', path: '/admin/database', icon: Database, section: 'system' },
  
  // Settings
  // { labelKey: 'nav.settings', path: '/admin/settings', icon: Settings, section: 'settings' },
  // { labelKey: 'nav.localization', path: '/admin/localization', icon: Globe, section: 'settings' },
  // { labelKey: 'nav.support', path: '/admin/support', icon: HelpCircle, section: 'settings' },
];

const allSchoolNavItems: NavItem[] = [
  { labelKey: 'nav.overview', path: '/school', icon: LayoutDashboard },
  { labelKey: 'nav.students', path: '/school/students', icon: GraduationCap },
  { labelKey: 'nav.teachers', path: '/school/teachers', icon: UserCircle },
  { labelKey: 'nav.parents', path: '/school/parents', icon: Users },
  { labelKey: 'nav.applications', path: '/school/applications', icon: FileText },
  { labelKey: 'nav.payments', path: '/school/payments', icon: Banknote },
  { labelKey: 'nav.academicProgress', path: '/school/academic-progress', icon: TrendingUp },
  { labelKey: 'nav.attendance', path: '/school/attendance', icon: ClipboardList },
  { labelKey: 'nav.announcements', path: '/school/announcements', icon: Bell },
  { labelKey: 'nav.timetable', path: '/school/timetable', icon: Calendar },
  { labelKey: 'nav.calendar', path: '/school/calendar', icon: BookOpen },
  { labelKey: 'nav.activityLog', path: '/school/activity-log', icon: Activity },
];

const featureToNavMap: Record<string, string> = {
  students: '/school/students',
  teachers: '/school/teachers',
  parents: '/school/parents',
  applications: '/school/applications',
  payments: '/school/payments',
  academicProgress: '/school/academic-progress',
  attendance: '/school/attendance',
  announcements: '/school/announcements',
  timetable: '/school/timetable',
  calendar: '/school/calendar',
  activityLog: '/school/activity-log',
};

export function DashboardLayout({ role }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();
  const { t } = useTranslation();
  
  // Get filtered nav items based on enabled features for school role
  const navItems = role === 'admin' ? adminNavItems : (() => {
    const schoolId = getCurrentSchoolId();
    const features = getSchoolFeatures(schoolId);
    
    return allSchoolNavItems.filter(item => {
      // Always show Overview
      if (item.path === '/school') return true;
      
      // Check if feature is enabled
      const featureKey = Object.keys(featureToNavMap).find(
        key => featureToNavMap[key] === item.path
      );
      
      if (featureKey) {
        return features[featureKey as keyof typeof features];
      }
      
      return true;
    });
  })();

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleLogout = () => {
    navigate('/');
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Mobile Backdrop */}
      {isMobile && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed z-40 bg-card border border-border/40 shadow-lg text-sidebar-foreground transition-all duration-300 flex flex-col',
          isMobile
            ? sidebarOpen
              ? 'left-0 top-0 h-full w-64 translate-x-0 rounded-none'
              : 'left-0 top-0 h-full w-64 -translate-x-full rounded-none'
            : sidebarOpen
            ? 'left-4 top-4 h-[calc(100vh-2rem)] w-60 rounded-2xl'
            : 'left-4 top-4 h-[calc(100vh-2rem)] w-16 rounded-2xl'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/40 px-4 shrink-0">
          {(sidebarOpen || !isMobile) && (
            <div className="flex items-center gap-2">
              <GraduationCap className="h-7 w-7 text-primary" />
              {sidebarOpen && <span className="text-xl font-bold tracking-tight">{t('dashboard.schoolNetwork')}</span>}
            </div>
          )}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="text-sidebar-foreground hover:bg-accent rounded-lg"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-4 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/admin' || item.path === '/school'}
              onClick={() => isMobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5 shrink-0" />
              {sidebarOpen && <span>{t(item.labelKey)}</span>}
            </NavLink>
          ))}
        </nav>

        {/* User Account & Logout */}
        <div className="shrink-0 mt-auto">
          <div className={cn(
            'flex items-center gap-3 border-t border-border/40 p-4',
            !sidebarOpen && !isMobile && 'justify-center'
          )}>
            <img
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&crop=face"
              alt="User avatar"
              className="h-9 w-9 rounded-full object-cover ring-2 ring-primary/20 shrink-0"
            />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">John Admin</p>
                <p className="text-xs text-muted-foreground truncate">admin@school.com</p>
              </div>
            )}
          </div>

          <div className="border-t border-border/40 p-4">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className={cn(
                'w-full text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-lg',
                sidebarOpen ? 'justify-start' : 'justify-center px-0'
              )}
            >
              <LogOut className={cn('h-5 w-5', sidebarOpen && 'mr-3')} />
              {sidebarOpen && <span>{t('common.logout')}</span>}
            </Button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300 w-full',
          isMobile ? 'ml-0' : sidebarOpen ? 'ml-[17rem]' : 'ml-24'
        )}
      >
        <div className="h-full overflow-auto">
          <div className="mx-4 mt-4 rounded-2xl border border-border/40 bg-card px-4 md:px-6 py-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {isMobile && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleSidebar}
                    className="text-foreground hover:bg-accent rounded-lg"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                )}
                <h1 className="text-lg md:text-2xl font-bold tracking-tight">
                  {role === 'admin' ? t('dashboard.platformAdmin') : t('dashboard.schoolDashboard')}
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <LanguageToggle />
                <ThemeToggle />
                <Button variant="outline" size="icon" className="rounded-lg">
                  <Bell className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>

          <div className="p-4 md:p-6 lg:p-8">
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
