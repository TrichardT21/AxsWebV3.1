import { Search, PlusCircle, Monitor, List, Menu, X, Shield, LogOut, ChevronDown, User, Home, Network, Sliders } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SearchResultsModal from './SearchResultsModal';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onNavigate, currentView }) {
  const { user, logout, viewingTechnicianId } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRegistroOpen, setIsRegistroOpen] = useState(false);
  const [isMobileRegistroOpen, setIsMobileRegistroOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [searchResults, setSearchResults] = useState({ equipos: [], casos: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  // Close profile dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchKeyDown = async (e) => {
    if (e.key === 'Enter') {
      const query = e.currentTarget.value.trim();
      if (!query) return;
      
      setSearchQuery(query);
      setIsSearchModalOpen(true);
      setIsSearching(true);
      
      try {
        const queryParamsEquipos = new URLSearchParams({ q: query, tipo: 'equipos' });
        const queryParamsCasos = new URLSearchParams({ q: query, tipo: 'casos' });

        if (user?.rol === 'admin' && viewingTechnicianId) {
          queryParamsEquipos.append('tecnico_id', viewingTechnicianId.toString());
          queryParamsCasos.append('tecnico_id', viewingTechnicianId.toString());
        }

        const [equiposRes, casosRes] = await Promise.all([
          fetch(`backend/buscar.php?${queryParamsEquipos.toString()}`, { credentials: 'include' }),
          fetch(`backend/buscar.php?${queryParamsCasos.toString()}`, { credentials: 'include' })
        ]);
        
        const equipos = await equiposRes.json();
        const casos = await casosRes.json();
        
        setSearchResults({ 
          equipos: Array.isArray(equipos) ? equipos : [], 
          casos: Array.isArray(casos) ? casos : [] 
        });
      } catch (error) {
        console.error("Error searching:", error);
      } finally {
        setIsSearching(false);
      }
    }
  };

  const navItems = [
    ...(user?.rol === 'tecnico' ? [{ id: 'home', label: 'Inicio', icon: <Home size={17} /> }] : []),
    { id: 'configuracion-vdsl', label: 'Config VDSL', icon: <Network size={17} /> },
    { id: 'evaluacion-parametros', label: 'Eval. Parámetros', icon: <Sliders size={17} /> },
    { id: 'ver-registros', label: 'Ver Registros', icon: <List size={17} /> },
  ];

  if (user?.rol === 'admin') {
    // Insertar Panel Admin al inicio para administradores
    navItems.unshift({
      id: 'admin-dashboard',
      label: 'Panel Admin',
      icon: <Shield size={17} />
    });
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0A0F1E]/80 backdrop-blur-md border-b border-white/10 select-none">
      <div className="w-full mx-auto px-4 sm:px-8 lg:px-12">
        <div className="flex justify-between items-center h-16">
          
          {/* Logo */}
          <div 
            className="flex-shrink-0 flex items-center cursor-pointer"
            onClick={() => onNavigate(user?.rol === 'admin' ? 'admin-dashboard' : 'home')}
          >
            <span className="text-2xl font-display font-bold tracking-tighter text-white">
              AXS<span className="text-blue-500">.</span>
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden xl:flex items-center space-x-6">
            {/* Items before Registro */}
            {navItems.filter(item => item.id === 'admin-dashboard' || item.id === 'home').map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-blue-400 ${
                  currentView === item.id ? 'text-blue-500' : 'text-gray-300'
                }`}
                id={`nav-item-${item.id}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}

            {/* Submenu Registro (Hover) */}
            <div 
              className="relative py-2"
              onMouseEnter={() => setIsRegistroOpen(true)}
              onMouseLeave={() => setIsRegistroOpen(false)}
            >
              <button
                type="button"
                onClick={() => setIsRegistroOpen(!isRegistroOpen)}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-blue-400 focus:outline-none ${
                  currentView === 'registrar-caso' || currentView === 'registrar-equipo' ? 'text-blue-500' : 'text-gray-300'
                }`}
                id="nav-item-registro"
              >
                <PlusCircle size={17} />
                <span>Registro</span>
                <ChevronDown size={12} className={`transition-transform duration-200 ${isRegistroOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isRegistroOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-0 mt-2 w-48 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden text-left"
                  >
                    <button
                      onClick={() => {
                        onNavigate('registrar-caso');
                        setIsRegistroOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors flex items-center gap-2 ${
                        currentView === 'registrar-caso' ? 'text-blue-400 bg-blue-500/5' : 'text-gray-300'
                      }`}
                    >
                      <PlusCircle size={14} />
                      Registrar Caso
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('registrar-equipo');
                        setIsRegistroOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-white/5 transition-colors flex items-center gap-2 ${
                        currentView === 'registrar-equipo' ? 'text-blue-400 bg-blue-500/5' : 'text-gray-300'
                      }`}
                    >
                      <Monitor size={14} />
                      Registrar Equipo
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Items after Registro */}
            {navItems.filter(item => item.id !== 'admin-dashboard' && item.id !== 'home').map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center space-x-1.5 text-xs font-semibold uppercase tracking-wider transition-colors hover:text-blue-400 ${
                  currentView === item.id ? 'text-blue-500' : 'text-gray-300'
                }`}
                id={`nav-item-${item.id}`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>

          {/* Search, User Profile, and Mobile Menu Toggler */}
          <div className="flex items-center space-x-4">
            
            {/* Buscador */}
            <div className="relative hidden sm:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <Search size={14} />
              </div>
              <input
                type="text"
                placeholder="Buscar casos o equipos..."
                onKeyDown={handleSearchKeyDown}
                className="bg-white/5 border border-white/10 rounded-full py-1.5 pl-9 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all w-40 xl:w-56 text-white placeholder:text-gray-600"
                id="global-search"
              />
            </div>

            {/* Perfil del Usuario Dropdown */}
            {user && (
              <div className="relative" ref={profileRef}>
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 bg-white/5 border border-white/10 hover:bg-white/10 py-1.5 px-3 rounded-full transition-all focus:outline-none"
                >
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs ${
                    user.rol === 'admin' ? 'bg-gradient-to-tr from-blue-600 to-indigo-500 text-white' : 'bg-white/10 text-gray-300'
                  }`}>
                    {user.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-gray-300 max-w-[100px] truncate">
                    {user.nombre.split(' ')[0]}
                  </span>
                  <ChevronDown size={12} className={`text-gray-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isProfileOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-[#0F172A]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl py-2 z-50 overflow-hidden text-left"
                    >
                      <div className="px-4 py-3 border-b border-white/5 bg-white/5">
                        <p className="text-xs font-bold text-white truncate">{user.nombre}</p>
                        <p className="text-[10px] text-gray-500 truncate mt-0.5 font-mono">{user.usuario}</p>
                        <span className={`inline-block mt-2 py-0.5 px-2 text-[8px] font-bold uppercase rounded ${
                          user.rol === 'admin' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-white/5 text-gray-400 border border-white/10'
                        }`}>
                          {user.rol}
                        </span>
                      </div>
                      
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-semibold text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <LogOut size={13} />
                        Cerrar Sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            
            {/* Toggler Menú Móvil */}
            <button 
              className="xl:hidden text-gray-400 hover:text-white focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Móvil */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="xl:hidden bg-[#0A0F1E] border-b border-white/10 overflow-hidden"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {/* Items before Registro */}
              {navItems.filter(item => item.id === 'admin-dashboard' || item.id === 'home').map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider ${
                    currentView === item.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}

              {/* Registro collapsible submenu */}
              <div className="w-full">
                <button
                  type="button"
                  onClick={() => setIsMobileRegistroOpen(!isMobileRegistroOpen)}
                  className={`flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider transition-all ${
                    currentView === 'registrar-caso' || currentView === 'registrar-equipo'
                      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                      : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <PlusCircle size={17} />
                    <span>Registro</span>
                  </div>
                  <ChevronDown size={14} className={`transition-transform duration-200 ${isMobileRegistroOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {isMobileRegistroOpen && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden pl-6 pr-2 py-1 space-y-1 bg-white/[0.02] rounded-xl mt-1 border border-white/5"
                    >
                      <button
                        onClick={() => {
                          onNavigate('registrar-caso');
                          setIsMobileMenuOpen(false);
                          setIsMobileRegistroOpen(false);
                        }}
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                          currentView === 'registrar-caso' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <PlusCircle size={14} />
                        <span>Registrar Caso</span>
                      </button>
                      <button
                        onClick={() => {
                          onNavigate('registrar-equipo');
                          setIsMobileMenuOpen(false);
                          setIsMobileRegistroOpen(false);
                        }}
                        className={`flex items-center space-x-3 w-full px-4 py-2.5 rounded-lg text-xs font-semibold uppercase tracking-wider ${
                          currentView === 'registrar-equipo' ? 'bg-blue-600/20 text-blue-400' : 'text-gray-400 hover:bg-white/5'
                        }`}
                      >
                        <Monitor size={14} />
                        <span>Registrar Equipo</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Items after Registro */}
              {navItems.filter(item => item.id !== 'admin-dashboard' && item.id !== 'home').map((item) => (
                <button
                  key={item.id}
                  onClick={() => {
                    onNavigate(item.id);
                    setIsMobileMenuOpen(false);
                  }}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl text-sm font-semibold uppercase tracking-wider ${
                    currentView === item.id ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30' : 'text-gray-300 hover:bg-white/5'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              ))}
              
              {/* Buscador móvil */}
              <div className="p-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Search size={14} />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar..."
                    onKeyDown={(e) => {
                       handleSearchKeyDown(e);
                       if (e.key === 'Enter') setIsMobileMenuOpen(false);
                    }}
                    className="bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs w-full focus:outline-none focus:ring-1 focus:ring-blue-500 text-white"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Búsqueda */}
      <SearchResultsModal 
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        query={searchQuery}
        results={searchResults}
        isLoading={isSearching}
        onNavigate={onNavigate}
      />
    </nav>
  );
}
