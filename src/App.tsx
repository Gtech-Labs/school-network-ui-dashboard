import React, { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "next-themes";
import { AuthProvider } from "@/context/AuthContext.tsx";
import { ProtectedRoute, PublicRoute } from "@/components/AuthGuards.tsx";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading components
const Login = lazy(() => import("./pages/Login.tsx"));
const DashboardLayout = lazy(() => import("./components/DashboardLayout").then(module => ({ default: module.DashboardLayout })));
const AdminOverview = lazy(() => import("./pages/admin/AdminOverview"));
const AdminSchools = lazy(() => import("./pages/admin/AdminSchools"));
const AdminSchoolDetail = lazy(() => import("./pages/admin/SchoolDetail"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminBilling = lazy(() => import("./pages/admin/AdminBilling"));
const AdminNotifications = lazy(() => import("./pages/admin/AdminNotifications"));
const AdminActivityLog = lazy(() => import("./pages/admin/AdminActivityLog"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const AdminRevenue = lazy(() => import("./pages/admin/AdminRevenue"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminSecurity = lazy(() => import("./pages/admin/AdminSecurity"));
const AdminPermissions = lazy(() => import("./pages/admin/AdminPermissions"));
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminDatabase = lazy(() => import("./pages/admin/AdminDatabase"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminLocalization = lazy(() => import("./pages/admin/AdminLocalization"));
const AdminSupport = lazy(() => import("./pages/admin/AdminSupport"));
const AdminEmailTemplates = lazy(() => import("./pages/admin/AdminEmailTemplates"));
const AdminAnnouncements = lazy(() => import("./pages/admin/AdminAnnouncements"));
const AdminInvoices = lazy(() => import("./pages/admin/AdminInvoices"));
const SchoolOverview = lazy(() => import("./pages/school/SchoolOverview"));
const SchoolStudents = lazy(() => import("./pages/school/SchoolStudents"));
const SchoolTeachers = lazy(() => import("./pages/school/SchoolTeachers"));
const SchoolParents = lazy(() => import("./pages/school/SchoolParents"));
const SchoolPayments = lazy(() => import("./pages/school/SchoolPayments"));
const SchoolAnnouncements = lazy(() => import("./pages/school/SchoolAnnouncements"));
const SchoolTimetable = lazy(() => import("./pages/school/SchoolTimetable"));
const SchoolApplications = lazy(() => import("./pages/school/SchoolApplications"));
const ApplicationDetail = lazy(() => import("./pages/school/ApplicationDetail"));
const StudentDetail = lazy(() => import("./pages/school/StudentDetail"));
const TeacherDetail = lazy(() => import("./pages/school/TeacherDetail"));
const SchoolActivityLog = lazy(() => import("./pages/school/SchoolActivityLog"));

const SchoolCalendar = lazy(() => import("./pages/school/SchoolCalendar"));
const ParentDetail = lazy(() => import("./pages/school/ParentDetail"));
const SchoolAcademicProgress = lazy(() => import("./pages/school/SchoolAcademicProgress"));
const SchoolAttendance = lazy(() => import("./pages/school/SchoolAttendance"));
const NotFound = lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="p-8 space-y-4">
    <Skeleton className="h-12 w-[250px]" />
    <Skeleton className="h-[400px] w-full" />
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* PUBLIC ROUTES: Only accessible if NOT logged in */}
                <Route element={<PublicRoute />}>
                  <Route path="/" element={<Login />} />
                </Route>

                {/* PROTECTED ROUTES: Only accessible if logged in */}
                <Route element={<ProtectedRoute />}>
                  {/* Admin Section */}
                  <Route path="/admin" element={<DashboardLayout role="admin" />}>
                    <Route index element={<AdminOverview />} />
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
                    <Route path="support" element={<AdminSupport />} />
                  </Route>

                  <Route path="/school" element={<DashboardLayout role="school" />}>
                    <Route index element={<SchoolOverview />} />
                    <Route path="students" element={<SchoolStudents />} />
                    <Route path="students/:id" element={<StudentDetail />} />
                    <Route path="teachers" element={<SchoolTeachers />} />
                    <Route path="teachers/:id" element={<TeacherDetail />} />

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
                </Route>

                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
