import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute, CustomerRoute, EstablishmentRoute, DeliveryRoute } from "@/components/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Orders from "./pages/Orders";
import Delivery from "./pages/Delivery";
import DeliveryControl from "./pages/DeliveryControl";
import Profile from "./pages/Profile";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import NotFound from "./pages/NotFound";
import DeliveryPeople from "./pages/DeliveryPeople";
import EditOrderPage from "./pages/EditOrder";
import Register from "./pages/Register";

const queryClient = new QueryClient();

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/" element={<Index />} />
              
              {/* Rotas protegidas */}
              <Route path="/orders" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Orders />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              
              <Route path="/delivery" element={
                <DeliveryRoute>
                  <ErrorBoundary>
                    <Delivery />
                  </ErrorBoundary>
                </DeliveryRoute>
              } />
              
              <Route path="/delivery-control" element={
                <EstablishmentRoute>
                  <ErrorBoundary>
                    <DeliveryControl />
                  </ErrorBoundary>
                </EstablishmentRoute>
              } />
              
              <Route path="/profile" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <Profile />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              
              <Route path="/dashboard" element={
                <EstablishmentRoute>
                  <ErrorBoundary>
                    <Dashboard />
                  </ErrorBoundary>
                </EstablishmentRoute>
              } />
              
              <Route path="/admin" element={
                <EstablishmentRoute>
                  <ErrorBoundary>
                    <Admin />
                  </ErrorBoundary>
                </EstablishmentRoute>
              } />
              
              <Route path="/entregadores" element={
                <EstablishmentRoute>
                  <ErrorBoundary>
                    <DeliveryPeople />
                  </ErrorBoundary>
                </EstablishmentRoute>
              } />
              
              <Route path="/edit-order/:id" element={
                <ProtectedRoute>
                  <ErrorBoundary>
                    <EditOrderPage />
                  </ErrorBoundary>
                </ProtectedRoute>
              } />
              
              {/* Rota 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
