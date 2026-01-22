import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import Login from "./pages/Login";
import { DashboardLayout } from "./components/DashboardLayout";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminSchools from "./pages/admin/AdminSchools";
import AdminSchoolDetail from "./pages/admin/SchoolDetail";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminBilling from "./pages/admin/AdminBilling";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminActivityLog from "./pages/admin/AdminActivityLog";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import AdminRevenue from "./pages/admin/AdminRevenue";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminPermissions from "./pages/admin/AdminPermissions";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminDatabase from "./pages/admin/AdminDatabase";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminLocalization from "./pages/admin/AdminLocalization";
import AdminSupport from "./pages/admin/AdminSupport";
import AdminEmailTemplates from "./pages/admin/AdminEmailTemplates";
import AdminAnnouncements from "./pages/admin/AdminAnnouncements";
import AdminInvoices from "./pages/admin/AdminInvoices";
import SchoolOverview from "./pages/school/SchoolOverview";
import SchoolStudents from "./pages/school/SchoolStudents";
import SchoolTeachers from "./pages/school/SchoolTeachers";
import SchoolParents from "./pages/school/SchoolParents";
import SchoolPayments from "./pages/school/SchoolPayments";
import SchoolAnnouncements from "./pages/school/SchoolAnnouncements";
import SchoolTimetable from "./pages/school/SchoolTimetable";
import SchoolApplications from "./pages/school/SchoolApplications";
import ApplicationDetail from "./pages/school/ApplicationDetail";
import StudentDetail from "./pages/school/StudentDetail";
import SchoolActivityLog from "./pages/school/SchoolActivityLog";
import SchoolCalendar from "./pages/school/SchoolCalendar";
import ParentDetail from "./pages/school/ParentDetail";
import SchoolAcademicProgress from "./pages/school/SchoolAcademicProgress";
import SchoolAttendance from "./pages/school/SchoolAttendance";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            
            <Route path="/admin" element={<DashboardLayout role="admin" />}>
              <Route index element={<AdminOverview />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="schools" element={<AdminSchools />} />
              <Route path="schools/:id" element={<AdminSchoolDetail />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="subscriptions" element={<AdminSubscriptions />} />
              <Route path="billing" element={<AdminBilling />} />
              <Route path="invoices" element={<AdminInvoices />} />
              <Route path="revenue" element={<AdminRevenue />} />
              <Route path="notifications" element={<AdminNotifications />} />
              <Route path="announcements" element={<AdminAnnouncements />} />
              <Route path="messages" element={<AdminMessages />} />
              <Route path="email-templates" element={<AdminEmailTemplates />} />
              <Route path="activity-log" element={<AdminActivityLog />} />
              <Route path="security" element={<AdminSecurity />} />
              <Route path="permissions" element={<AdminPermissions />} />
              <Route path="integrations" element={<AdminIntegrations />} />
              <Route path="database" element={<AdminDatabase />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="localization" element={<AdminLocalization />} />
              <Route path="support" element={<AdminSupport />} />
            </Route>

            <Route path="/school" element={<DashboardLayout role="school" />}>
              <Route index element={<SchoolOverview />} />
              <Route path="students" element={<SchoolStudents />} />
              <Route path="students/:id" element={<StudentDetail />} />
              <Route path="teachers" element={<SchoolTeachers />} />
              <Route path="parents" element={<SchoolParents />} />
              <Route path="parents/:id" element={<ParentDetail />} />
              <Route path="payments" element={<SchoolPayments />} />
              <Route path="announcements" element={<SchoolAnnouncements />} />
              <Route path="timetable" element={<SchoolTimetable />} />
              <Route path="applications" element={<SchoolApplications />} />
              <Route path="applications/:id" element={<ApplicationDetail />} />
              <Route path="activity-log" element={<SchoolActivityLog />} />
              <Route path="calendar" element={<SchoolCalendar />} />
              <Route path="academic-progress" element={<SchoolAcademicProgress />} />
              <Route path="attendance" element={<SchoolAttendance />} />
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
