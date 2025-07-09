import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Home, Package, User, BarChart3, Menu, X, LogOut, Settings, User as UserIcon, Store, Truck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuth();

  const getMenuItems = () => {
    if (!isAuthenticated) {
      return [
        { path: "/", label: "Cardápio", icon: Home },
        { path: "/login", label: "Entrar", icon: User },
      ];
    }

    // Menu baseado no tipo de usuário
    switch (user?.role) {
      case 'ESTABLISHMENT':
        return [
          { path: "/dashboard", label: "Dashboard", icon: BarChart3 },
          { path: "/admin", label: "Administração", icon: Settings },
          { path: "/orders", label: "Pedidos", icon: Package },
          { path: "/delivery-control", label: "Controle de Entregadores", icon: Truck },
          { path: "/profile", label: "Perfil", icon: User },
        ];
      case 'DELIVERY':
        return [
          { path: "/delivery", label: "Entregas", icon: Package },
          { path: "/profile", label: "Perfil", icon: User },
        ];
      case 'CUSTOMER':
      default:
        return [
          { path: "/", label: "Cardápio", icon: Home },
          { path: "/orders", label: "Meus Pedidos", icon: Package },
          { path: "/profile", label: "Perfil", icon: User },
        ];
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'ESTABLISHMENT': return 'Estabelecimento';
      case 'DELIVERY': return 'Entregador';
      case 'CUSTOMER': return 'Cliente';
      default: return role;
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const menuItems = getMenuItems();

  return (
    <nav className="bg-white shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link to="/" className="text-2xl font-bold">
            <span className="text-[#B21735]">QuickPainel</span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-1">
            {/* Cardápio sempre visível */}
            <Link to="/">
              <Button
                variant={location.pathname === "/" ? "default" : "ghost"}
                className={`flex items-center gap-2 ${
                  location.pathname === "/" 
                    ? "bg-[#B21735] text-white" 
                    : "hover:bg-gray-100"
                }`}
              >
                <Store className="w-4 h-4" />
                Cardápio
              </Button>
            </Link>

            {/* Outros itens do menu */}
            {menuItems.filter(item => item.path !== "/").map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <Link key={item.path} to={item.path}>
                  <Button
                    variant={isActive ? "default" : "ghost"}
                    className={`flex items-center gap-2 ${
                      isActive 
                        ? "bg-[#B21735] text-white" 
                        : "hover:bg-gray-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                </Link>
              );
            })}

            {/* User Menu */}
            {isAuthenticated && user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-orange-100 text-orange-600 text-sm">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="hidden lg:block text-left">
                      <p className="text-sm font-medium">{user.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center gap-2">
                      <UserIcon className="w-4 h-4" />
                      Perfil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings className="w-4 h-4" />
                      Configurações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {/* Login Button for non-authenticated users */}
            {!isAuthenticated && (
              <Link to="/login">
                <Button className="bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700">
                  <User className="w-4 h-4 mr-2" />
                  Entrar
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden pb-4 border-t">
            <div className="flex flex-col space-y-2 pt-4">
              {/* Cardápio sempre visível no menu mobile */}
              <Link to="/" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant={location.pathname === "/" ? "default" : "ghost"}
                  className={`w-full justify-start gap-2 ${
                    location.pathname === "/" 
                      ? "bg-[#B21735] text-white" 
                      : "hover:bg-gray-100"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  Cardápio
                </Button>
              </Link>

              {/* Outros itens do menu mobile */}
              {menuItems.filter(item => item.path !== "/").map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Link key={item.path} to={item.path} onClick={() => setIsMenuOpen(false)}>
                    <Button
                      variant={isActive ? "default" : "ghost"}
                      className={`w-full justify-start gap-2 ${
                        isActive 
                          ? "bg-[#B21735] text-white" 
                          : "hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </Button>
                  </Link>
                );
              })}

              {/* Mobile User Info */}
              {isAuthenticated && user && (
                <>
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-orange-100 text-orange-600">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{user.name}</p>
                      <Badge variant="secondary" className="text-xs">
                        {getRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                  
                  <Button
                    variant="ghost"
                    onClick={handleLogout}
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                  >
                    <LogOut className="w-4 h-4" />
                    Sair
                  </Button>
                </>
              )}

              {/* Mobile Login Button */}
              {!isAuthenticated && (
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  <Button className="w-full bg-gradient-to-r from-orange-600 to-green-600 hover:from-orange-700 hover:to-green-700">
                    <User className="w-4 h-4 mr-2" />
                    Entrar
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
