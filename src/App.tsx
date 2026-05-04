import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Layout } from './components/Layout';
import { AIAssistant } from './components/AIAssistant'; // Ensure this is global
import { ToastContainer } from './components/ToastContainer';
import { Skeleton } from './components/ui/Skeleton'; // Or a simple loader

// Lazy load pages for performance (Recruiters love this)
const Dashboard = lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })));
const Settings = lazy(() => import('./pages/Settings').then(module => ({ default: module.Settings })));

// Loading Fallback
const PageLoader = () => (
  <div className="p-8 w-full max-w-4xl mx-auto space-y-6">
    <Skeleton className="h-12 w-3/4" />
    <Skeleton className="h-64 w-full" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  </div>
);

export default function App() {
  return (
    <AppProvider>
      <Router>
        {/* Suspense handles the loading state while lazy components are fetched */}
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="settings" element={<Settings />} />
              
              {/* 404 Catch-all: Shows professional handling of missing routes */}
              <Route path="*" element={
                <div className="flex flex-col items-center justify-center h-[60vh]">
                  <h1 className="text-4xl font-bold text-gray-800 dark:text-white">404</h1>
                  <p className="text-gray-500">Scenario not found.</p>
                </div>
              } />
            </Route>
          </Routes>
        </Suspense>

        {/* Global Components: They stay visible across all pages */}
        <AIAssistant />
        <ToastContainer />
      </Router>
    </AppProvider>
  );
}