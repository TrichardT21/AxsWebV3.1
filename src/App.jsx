import { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import RegisterCase from './components/RegisterCase';
import RegisterEquipment from './components/RegisterEquipment';
import ViewRecords from './components/ViewRecords';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import { motion, AnimatePresence } from 'motion/react';
import { AuthProvider, useAuth } from './context/AuthContext';

function AppContent() {
  const { user, loading, viewingTechnicianId } = useAuth();
  const [currentView, setCurrentView] = useState('home');

  // Redirigir automáticamente basándonos en si hay sesión iniciada y roles
  useEffect(() => {
    if (!loading) {
      if (!user) {
        setCurrentView('login');
      } else {
        if (user.rol === 'admin' && (currentView === 'login' || currentView === 'home')) {
          setCurrentView('admin-dashboard');
        } else if (user.rol === 'tecnico' && currentView === 'login') {
          setCurrentView('home');
        }
      }
    }
  }, [user, loading]);

  // Si cambia de Modo Vista Técnico a normal (o viceversa), redireccionar para ver la actualización
  useEffect(() => {
    if (viewingTechnicianId && user?.rol === 'admin') {
      setCurrentView('ver-registros');
    }
  }, [viewingTechnicianId, user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D1A] flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
        <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold animate-pulse font-sans">
          Validando Sesión AXS...
        </p>
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'home':
        return user.rol === 'admin' 
          ? <AdminDashboard />
          : <Hero onStart={(view) => setCurrentView(view)} />;
      case 'admin-dashboard':
        return user.rol === 'admin' ? <AdminDashboard /> : <RegisterCase />;
      case 'registrar-caso':
        return <RegisterCase />;
      case 'registrar-equipo':
        return <RegisterEquipment />;
      case 'ver-registros':
        return <ViewRecords />;
      default:
        return user.rol === 'admin' ? <AdminDashboard /> : <RegisterCase />;
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1E] text-white selection:bg-blue-500/30">
      <Navbar onNavigate={(view) => setCurrentView(view)} currentView={currentView} />
      
      <main>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {renderView()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 bg-[#0A0F1E]">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start">
              <span className="text-xl font-display font-bold tracking-tighter text-white mb-2">
                AXS<span className="text-blue-500">.</span>
              </span>
              <p className="text-gray-500 text-xs uppercase tracking-widest font-medium">
                © 2026 AXS Internet. Sistemas de Gestión Interna.
              </p>
            </div>
            
            <div className="flex items-center gap-8 text-xs uppercase tracking-widest font-semibold text-gray-400">
              <a href="#" className="hover:text-blue-400 transition-colors">Seguridad</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Soporte</a>
              <a href="#" className="hover:text-blue-400 transition-colors">Infraestructura</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
