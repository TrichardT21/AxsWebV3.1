import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { 
  Users, UserCheck, UserX, UserPlus, Eye, EyeOff, Settings, RefreshCw, 
  Trash2, ShieldAlert, Award, FileText, Database, Shield, Lock, Check, X 
} from 'lucide-react';
import homeVideo from './assets/home.mp4';
import { API_BASE } from '../config/api';

export default function AdminDashboard() {
  const { startViewingAsTechnician, user: currentUser } = useAuth();
  
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Tab control
  const [activeTab, setActiveTab] = useState('supervisar');

  // Modal Control
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  // Form states
  const [formNombre, setFormNombre] = useState('');
  const [formUsuario, setFormUsuario] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRol, setFormRol] = useState('tecnico');
  const [formEstado, setFormEstado] = useState('activo');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState(null);

  // Password visibility states
  const [showAddPassword, setShowAddPassword] = useState(false);
  const [showEditPassword, setShowEditPassword] = useState(false);

  const fetchUsuarios = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      } else {
        const errData = await res.json();
        setError(errData.error || 'Error al obtener los usuarios');
      }
    } catch (e) {
      setError('Error de conexión al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  // Approvals
  const handleAprobar = async (id) => {
    if (!confirm('¿Aprobar esta solicitud de cuenta?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'aprobar', id }),
        credentials: 'include',
      });
      if (res.ok) {
        alert('Usuario aprobado con éxito.');
        fetchUsuarios();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  const handleRechazar = async (id) => {
    if (!confirm('¿Rechazar y eliminar físicamente esta solicitud de cuenta?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accion: 'rechazar', id }),
        credentials: 'include',
      });
      if (res.ok) {
        alert('Solicitud rechazada.');
        fetchUsuarios();
      } else {
        const data = await res.json();
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  // Create User
  const handleCrearUsuario = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError(null);

    if (!formNombre || !formUsuario || !formPassword) {
      setFormError('Todos los campos son obligatorios.');
      setFormLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: formNombre,
          usuario: formUsuario,
          password: formPassword,
          rol: formRol,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Usuario creado con éxito.');
        setShowAddModal(false);
        fetchUsuarios();
        // Reset
        setFormNombre('');
        setFormUsuario('');
        setFormPassword('');
        setFormRol('tecnico');
      } else {
        setFormError(data.error || 'Error al crear usuario.');
      }
    } catch (e) {
      setFormError('Error de red al conectar.');
    } finally {
      setFormLoading(false);
    }
  };

  // Edit User
  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormNombre(user.nombre);
    setFormUsuario(user.usuario);
    setFormPassword(user.password_plano || ''); // Mostrar contraseña en plano si existe
    setFormRol(user.rol);
    setFormEstado(user.estado);
    setFormError(null);
    setShowEditModal(true);
  };

  const handleActualizarUsuario = async (e) => {
    e.preventDefault();
    if (!selectedUser) return;
    setFormLoading(true);
    setFormError(null);

    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'editar',
          id: selectedUser.id,
          nombre: formNombre,
          usuario: formUsuario,
          password: formPassword || undefined,
          rol: formRol,
          estado: formEstado,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Usuario actualizado con éxito.');
        setShowEditModal(false);
        fetchUsuarios();
      } else {
        setFormError(data.error || 'Error al actualizar usuario.');
      }
    } catch (e) {
      setFormError('Error de red al conectar.');
    } finally {
      setFormLoading(false);
    }
  };

  // Deactivate
  const handleDesactivar = async (id) => {
    if (!confirm('¿Estás seguro de desactivar (marcar inactivo) a este usuario?')) return;
    try {
      const res = await fetch(`${API_BASE}/admin_usuarios.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          accion: 'desactivar',
          id,
        }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert('Usuario desactivado.');
        fetchUsuarios();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (e) {
      alert('Error de conexión.');
    }
  };

  const pendingRequests = usuarios.filter(u => u.estado === 'pendiente');
  
  // Panel de supervisión:
  // - El Administrador Principal puede ver a todos los usuarios activos (técnicos o administradores), excepto a sí mismo.
  // - Los administradores secundarios pueden ver a técnicos y a otros administradores activos, pero nunca al Administrador Principal.
  const isCurrentSuperAdmin = currentUser?.id === 1 || currentUser?.usuario === 'admin@axs.com' || currentUser?.usuario === 'richardchoque121@gmail.com';
  
  const activeTechnicians = usuarios.filter(u => {
    if (u.estado !== 'activo' || u.id === currentUser?.id) return false;
    
    const isTargetSuperAdmin = u.id === 1 || u.usuario === 'admin@axs.com' || u.usuario === 'richardchoque121@gmail.com';
    
    if (isCurrentSuperAdmin) {
      // El Super Admin ve a todos los demás activos (admins o técnicos)
      return true;
    } else {
      // Los admins secundarios ven a técnicos y otros admins, pero NO al Super Admin
      return !isTargetSuperAdmin;
    }
  });

  const allUsers = usuarios;

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 bg-[#090D1A] w-full text-white overflow-hidden">
      
      {/* Video de Fondo y Luces Ambientales */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-15"
        >
          <source src={homeVideo} type="video/mp4" />
        </video>
        <div className="absolute top-10 left-1/3 w-[300px] h-[300px] rounded-full bg-blue-600/10 blur-[80px]"></div>
        <div className="absolute bottom-10 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-700/5 blur-[120px]"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* Cabecera del Panel */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#0F172A]/40 backdrop-blur-md border border-white/5 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
              <Shield size={28} />
            </div>
            <div>
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400 font-display">
                Administración de Personal AXS
              </h2>
              <p className="text-gray-400 text-xs mt-0.5">Control de cuentas, solicitudes de técnicos y supervisión de registros</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={fetchUsuarios} 
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl transition-all text-gray-300"
              title="Recargar datos"
            >
              <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
            </button>
            <button 
              onClick={() => {
                setFormNombre('');
                setFormUsuario('');
                setFormPassword('');
                setFormRol('tecnico');
                setFormError(null);
                setShowAddModal(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 py-3 px-5 rounded-xl text-xs font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98]"
            >
              <UserPlus size={16} /> CREAR TÉCNICO
            </button>
          </div>
        </div>

        {/* Pestañas de Navegación */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto whitespace-nowrap [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {[
            { id: 'supervisar', label: 'Panel de Supervisión', badge: activeTechnicians.length, icon: Eye },
            { id: 'solicitudes', label: 'Solicitudes Pendientes', badge: pendingRequests.length, icon: ShieldAlert, badgeColor: 'bg-amber-600/80' },
            { id: 'cuentas', label: 'Todas las Cuentas', badge: allUsers.length, icon: Users }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`shrink-0 flex items-center gap-2 py-4 px-6 font-semibold text-xs uppercase tracking-wider relative transition-all ${isActive ? 'text-blue-400' : 'text-gray-400 hover:text-white'}`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {tab.badge > 0 && (
                  <span className={`py-0.5 px-2 rounded-full text-[9px] font-bold ${tab.badgeColor || 'bg-blue-600/80'} text-white`}>
                    {tab.badge}
                  </span>
                )}
                {isActive && (
                  <motion.div 
                    layoutId="activeAdminTabLine" 
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500" 
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Contenido según Pestaña */}
        <div className="min-h-[400px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-10 h-10 border-2 border-white/10 border-t-blue-500 rounded-full animate-spin"></div>
              <p className="text-gray-400 text-xs">Cargando datos del personal...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center text-red-400 max-w-lg mx-auto">
              <p className="font-semibold">Error al cargar el panel:</p>
              <p className="text-xs mt-1 text-red-300/80">{error}</p>
              <button onClick={fetchUsuarios} className="mt-4 bg-red-500 hover:bg-red-400 text-white font-bold py-2 px-4 rounded-xl text-xs">Reintentar</button>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              
              {/* Pestaña: PANEL DE SUPERVISIÓN */}
              {activeTab === 'supervisar' && (
                <motion.div
                  key="supervisar-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="space-y-6"
                >
                  {activeTechnicians.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 border border-white/5 rounded-3xl">
                      <Users size={48} className="text-gray-600 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">No hay técnicos activos registrados.</p>
                      <p className="text-gray-500 text-xs mt-1">Las solicitudes aprobadas aparecerán aquí.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {activeTechnicians.map((tecnico) => (
                        <motion.div
                          key={tecnico.id}
                          className="bg-[#0F172A]/55 backdrop-blur-sm border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col justify-between hover:border-blue-500/30 transition-all group"
                          whileHover={{ y: -4 }}
                        >
                          <div>
                            <div className="flex justify-between items-start gap-2 mb-4">
                              <div className="flex items-center gap-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${tecnico.rol === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                  {tecnico.nombre.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <h4 className="font-bold text-base truncate max-w-[150px]">{tecnico.nombre}</h4>
                                  <span className="text-[10px] text-gray-500 font-mono">{tecnico.usuario}</span>
                                </div>
                              </div>
                              <span className={`py-0.5 px-2 text-[9px] font-bold uppercase rounded-md ${
                                tecnico.rol === 'admin' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20'
                              }`}>
                                {tecnico.rol === 'admin' ? 'Admin' : 'Técnico'}
                              </span>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5 mb-6 text-center">
                              <div>
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Casos</span>
                                <div className="flex items-center justify-center gap-1.5 mt-1 text-blue-400 font-display">
                                  <FileText size={14} />
                                  <span className="text-lg font-bold">{tecnico.total_casos}</span>
                                </div>
                              </div>
                              <div className="border-l border-white/10">
                                <span className="text-[10px] text-gray-400 uppercase font-semibold">Equipos</span>
                                <div className="flex items-center justify-center gap-1.5 mt-1 text-indigo-400 font-display">
                                  <Database size={14} />
                                  <span className="text-lg font-bold">{tecnico.total_equipos}</span>
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => startViewingAsTechnician(tecnico.id, tecnico.nombre)}
                              className="flex-1 bg-blue-600/20 hover:bg-blue-600/30 border border-blue-500/30 hover:border-blue-500/50 py-2.5 rounded-xl text-xs font-bold text-blue-400 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                            >
                              <Eye size={14} /> VER EQUIPOS Y CASOS
                            </button>
                            <button
                              onClick={() => openEditModal(tecnico)}
                              className="p-2.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-gray-300 transition-all"
                              title="Configuración de Cuenta"
                            >
                              <Settings size={14} />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Pestaña: SOLICITUDES PENDIENTES */}
              {activeTab === 'solicitudes' && (
                <motion.div
                  key="solicitudes-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-[#0F172A]/30 border border-white/5 rounded-3xl p-6 shadow-xl"
                >
                  <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                    <ShieldAlert size={18} className="text-amber-500" />
                    Solicitudes de Registro Técnico
                  </h3>

                  {pendingRequests.length === 0 ? (
                    <div className="text-center py-20">
                      <UserCheck size={48} className="text-gray-700 mx-auto mb-4" />
                      <p className="text-gray-400 text-sm">No hay solicitudes de cuenta pendientes.</p>
                      <p className="text-gray-500 text-xs mt-1">Los registros de técnicos se mostrarán aquí para aprobación.</p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                            <th className="py-4 px-4">Técnico</th>
                            <th className="py-4 px-4">Usuario / Email</th>
                            <th className="py-4 px-4">Fecha Solicitud</th>
                            <th className="py-4 px-4 text-center">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingRequests.map((req) => (
                            <tr key={req.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
                                  {req.nombre.charAt(0).toUpperCase()}
                                </div>
                                {req.nombre}
                              </td>
                              <td className="py-4 px-4 font-mono text-gray-400">{req.usuario}</td>
                              <td className="py-4 px-4 text-gray-400">{new Date(req.fecha_creacion).toLocaleDateString()}</td>
                              <td className="py-4 px-4">
                                <div className="flex items-center justify-center gap-2">
                                  <button
                                    onClick={() => handleAprobar(req.id)}
                                    className="bg-emerald-600 hover:bg-emerald-500 py-1.5 px-3 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all shadow-md shadow-emerald-600/10 active:scale-[0.98]"
                                  >
                                    <Check size={12} /> ACEPTAR
                                  </button>
                                  <button
                                    onClick={() => handleRechazar(req.id)}
                                    className="bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 text-red-400 py-1.5 px-3 rounded-lg font-bold text-[10px] flex items-center gap-1 transition-all active:scale-[0.98]"
                                  >
                                    <X size={12} /> RECHAZAR
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Pestaña: TODAS LAS CUENTAS */}
              {activeTab === 'cuentas' && (
                <motion.div
                  key="cuentas-tab"
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="bg-[#0F172A]/30 border border-white/5 rounded-3xl p-6 shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h3 className="font-bold text-lg flex items-center gap-2">
                      <Users size={18} className="text-blue-500" />
                      Listado General de Cuentas
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="border-b border-white/10 text-gray-400 uppercase font-semibold text-[10px] tracking-wider">
                          <th className="py-4 px-4">Usuario</th>
                          <th className="py-4 px-4">Usuario / Email</th>
                          <th className="py-4 px-4">Rol</th>
                          <th className="py-4 px-4">Estado</th>
                          <th className="py-4 px-4 text-center">Registros (Casos/Equipos)</th>
                          <th className="py-4 px-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allUsers.map((user) => {
                          const isSelf = user.id === currentUser?.id;
                          const isTargetSuperAdmin = user.id === 1 || user.usuario === 'admin@axs.com' || user.usuario === 'richardchoque121@gmail.com';
                          const isCurrentSuperAdmin = currentUser?.id === 1 || currentUser?.usuario === 'admin@axs.com' || currentUser?.usuario === 'richardchoque121@gmail.com';
                          const canEdit = !isTargetSuperAdmin || isCurrentSuperAdmin;
                          const canDesactivar = !isSelf && (!isTargetSuperAdmin || isCurrentSuperAdmin);

                          return (
                            <tr key={user.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                              <td className="py-4 px-4 font-bold text-white flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${user.rol === 'admin' ? 'bg-blue-500/10 text-blue-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                                  {user.nombre.charAt(0).toUpperCase()}
                                </div>
                                <span>
                                  {user.nombre} {isSelf && <span className="text-[9px] bg-white/10 px-1.5 py-0.5 rounded text-gray-300 ml-1">Tú</span>}
                                </span>
                              </td>
                              <td className="py-4 px-4 font-mono text-gray-400">{user.usuario}</td>
                              <td className="py-4 px-4">
                                <span className={`py-0.5 px-2 text-[9px] font-bold uppercase rounded ${user.rol === 'admin' ? 'bg-blue-500/15 text-blue-400 border border-blue-500/20' : 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/20'}`}>
                                  {user.rol}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <span className={`py-0.5 px-2 text-[9px] font-bold uppercase rounded ${
                                  user.estado === 'activo' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                  user.estado === 'pendiente' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20' :
                                  'bg-red-500/15 text-red-400 border border-red-500/20'
                                }`}>
                                  {user.estado}
                                </span>
                              </td>
                              <td className="py-4 px-4 text-center text-gray-300 font-mono">
                                {user.total_casos} / {user.total_equipos}
                              </td>
                              <td className="py-4 px-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => openEditModal(user)}
                                    disabled={!canEdit}
                                    className={`p-2 rounded-lg border transition-all ${!canEdit ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600' : 'bg-white/5 hover:bg-white/10 border-white/10 text-gray-300'}`}
                                    title={canEdit ? "Editar cuenta" : "No tienes permisos para editar al Administrador Principal Superior"}
                                  >
                                    <Settings size={12} />
                                  </button>
                                  <button
                                    onClick={() => handleDesactivar(user.id)}
                                    disabled={!canDesactivar}
                                    className={`p-2 rounded-lg border transition-all ${!canDesactivar ? 'opacity-30 cursor-not-allowed border-white/5 text-gray-600' : 'bg-red-500/10 hover:bg-red-500/20 border-red-500/25 text-red-400'}`}
                                    title={canDesactivar ? "Desactivar cuenta" : isSelf ? "No puedes desactivar tu propio usuario" : "No tienes permisos para desactivar al Administrador Principal Superior"}
                                  >
                                    <UserX size={12} />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modal: Crear Técnico Directamente */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
            >
              <div className="flex justify-between items-center pb-2 border-b border-white/5">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <UserPlus className="text-blue-500" size={20} />
                  Crear Nuevo Técnico
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white transition-colors">
                  <X size={18} />
                </button>
              </div>

              {formError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                  <ShieldAlert size={16} />
                  <span>{formError}</span>
                </div>
              )}

              <form onSubmit={handleCrearUsuario} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                  <input
                    required
                    type="text"
                    value={formNombre}
                    onChange={(e) => setFormNombre(e.target.value)}
                    placeholder="Ej. Richard Choque"
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Usuario / Email</label>
                  <input
                    required
                    type="email"
                    value={formUsuario}
                    onChange={(e) => setFormUsuario(e.target.value)}
                    placeholder="tecnico@axs.com"
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Contraseña</label>
                  <div className="relative">
                    <input
                      required
                      type={showAddPassword ? "text" : "password"}
                      value={formPassword}
                      onChange={(e) => setFormPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-sans"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAddPassword(!showAddPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showAddPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Rol</label>
                  <select
                    value={formRol}
                    onChange={(e) => setFormRol(e.target.value)}
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none"
                  >
                    <option value="tecnico">Técnico (Usuario estándar)</option>
                    <option value="admin">Administrador (Control total)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={formLoading}
                  className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4"
                >
                  {formLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>CREAR CUENTA</>
                  )}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Editar Cuenta Existente */}
      <AnimatePresence>
        {showEditModal && selectedUser && (() => {
          const isTargetSuperAdmin = selectedUser.id === 1 || selectedUser.usuario === 'admin@axs.com' || selectedUser.usuario === 'richardchoque121@gmail.com';
          const isCurrentSuperAdmin = currentUser?.id === 1 || currentUser?.usuario === 'admin@axs.com' || currentUser?.usuario === 'richardchoque121@gmail.com';
          const canModify = !isTargetSuperAdmin || isCurrentSuperAdmin;

          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-[#0F172A] border border-white/10 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-6"
              >
                <div className="flex justify-between items-center pb-2 border-b border-white/5">
                  <h3 className="text-lg font-bold flex items-center gap-2">
                    <Settings className="text-blue-500" size={20} />
                    Editar Cuenta: {selectedUser.nombre}
                  </h3>
                  <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white transition-colors">
                    <X size={18} />
                  </button>
                </div>

                {!canModify && (
                  <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs rounded-xl flex items-start gap-2.5 leading-relaxed">
                    <ShieldAlert className="shrink-0 text-amber-500 mt-0.5" size={16} />
                    <span>Esta es la cuenta del <strong>Administrador Principal Superior</strong>. Solo el Administrador Principal tiene permisos para modificarla o alterarla.</span>
                  </div>
                )}

                {formError && (
                  <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl flex items-center gap-2">
                    <ShieldAlert size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                <form onSubmit={handleActualizarUsuario} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Nombre Completo</label>
                    <input
                      required
                      type="text"
                      value={formNombre}
                      disabled={!canModify}
                      onChange={(e) => setFormNombre(e.target.value)}
                      className={`w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${!canModify ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Usuario / Email</label>
                    <input
                      required
                      type="email"
                      value={formUsuario}
                      disabled={!canModify}
                      onChange={(e) => setFormUsuario(e.target.value)}
                      className={`w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm ${!canModify ? 'opacity-50 cursor-not-allowed' : ''}`}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Contraseña de Acceso</label>
                    <div className="relative">
                      <input
                        type={showEditPassword ? "text" : "password"}
                        value={formPassword}
                        disabled={!canModify}
                        onChange={(e) => setFormPassword(e.target.value)}
                        placeholder="••••••••"
                        className={`w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 pl-4 pr-12 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm font-sans ${!canModify ? 'opacity-50 cursor-not-allowed' : ''}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowEditPassword(!showEditPassword)}
                        disabled={!canModify}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors disabled:opacity-30 disabled:pointer-events-none"
                      >
                        {showEditPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Rol</label>
                      <select
                        value={formRol}
                        disabled={!canModify || selectedUser.id === currentUser?.id}
                        onChange={(e) => setFormRol(e.target.value)}
                        className={`w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none ${(!canModify || selectedUser.id === currentUser?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="tecnico">Técnico</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase ml-1">Estado</label>
                      <select
                        value={formEstado}
                        disabled={!canModify || selectedUser.id === currentUser?.id}
                        onChange={(e) => setFormEstado(e.target.value)}
                        className={`w-full bg-[#0A0F1D] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm appearance-none ${(!canModify || selectedUser.id === currentUser?.id) ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                        <option value="pendiente">Pendiente</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={formLoading || !canModify}
                    className={`w-full py-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all mt-4 ${
                      !canModify ? 'bg-gray-700 cursor-not-allowed text-gray-400 border border-white/5' : 'bg-blue-600 hover:bg-blue-500 text-white'
                    }`}
                  >
                    {formLoading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <>GUARDAR CAMBIOS</>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>
    </div>
  );
}
