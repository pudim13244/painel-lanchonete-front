import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: ('CUSTOMER' | 'ESTABLISHMENT' | 'DELIVERY')[];
  redirectTo?: string;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading, user } = useAuth();
  const location = useLocation();

  // Mostrar loading enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-orange-600" />
          <span className="text-gray-600">Carregando...</span>
        </div>
      </div>
    );
  }

  // Se não está autenticado, redirecionar para login
  if (!isAuthenticated) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Se há roles específicas permitidas, verificar se o usuário tem permissão
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Redirecionar baseado no role do usuário
    let defaultRedirect = '/';
    switch (user.role) {
      case 'ESTABLISHMENT':
        defaultRedirect = '/dashboard';
        break;
      case 'DELIVERY':
        defaultRedirect = '/delivery';
        break;
      case 'CUSTOMER':
      default:
        defaultRedirect = '/';
        break;
    }
    
    return <Navigate to={defaultRedirect} replace />;
  }

  return <>{children}</>;
};

// Componentes específicos para cada tipo de usuário
export const CustomerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['CUSTOMER']}>
    {children}
  </ProtectedRoute>
);

export const EstablishmentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['ESTABLISHMENT']}>
    {children}
  </ProtectedRoute>
);

export const DeliveryRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['DELIVERY']}>
    {children}
  </ProtectedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ProtectedRoute allowedRoles={['ESTABLISHMENT', 'DELIVERY']}>
    {children}
  </ProtectedRoute>
); 