
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import FeedbackButton from "@/components/FeedbackButton";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import PersonaBuilder from "./pages/PersonaBuilder";
import ProblemCanvas from "./pages/ProblemCanvas";
import AIDocs from "./pages/AIDocs";
import DocumentGeneration from "./pages/DocumentGeneration";
import Feedback from "./pages/Feedback";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/dashboard" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/workspace/:workspaceId/persona-builder" element={
              <ProtectedRoute>
                <PersonaBuilder />
              </ProtectedRoute>
            } />
            <Route path="/workspace/:workspaceId/problem-canvas" element={
              <ProtectedRoute>
                <ProblemCanvas />
              </ProtectedRoute>
            } />
            <Route path="/workspace/:workspaceId/ai-docs" element={
              <ProtectedRoute>
                <AIDocs />
              </ProtectedRoute>
            } />
            <Route path="/document-generation" element={
              <ProtectedRoute>
                <DocumentGeneration />
              </ProtectedRoute>
            } />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
          <FeedbackButton />
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
