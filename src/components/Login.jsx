import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '../context/AuthContext';
import { Shield, KeyRound, User, Mail, Send, CheckCircle2, AlertCircle, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login, registerRequest } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form states
  const [nombre, setNombre] = useState('');
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      if (isLogin) {
        const res = await login(usuario, password);
        if (!res.success) {
          setError(res.error || 'Credenciales inválidas');
        }
      } else {
        const res = await registerRequest(nombre, usuario, password);
        if (res.success) {
          setSuccessMsg(res.message || 'Solicitud enviada correctamente. Espera la aprobación del administrador.');
          // Limpiar registro
          setNombre('');
          setUsuario('');
          setPassword('');
          // Volver a login tras 5 segundos
          setTimeout(() => {
            setIsLogin(true);
            setSuccessMsg(null);
          }, 5000);
        } else {
          setError(res.error || 'Error al procesar la solicitud');
        }
      }
    } catch (err) {
      setError('Ocurrió un error inesperado al conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError(null);
    setSuccessMsg(null);
    setNombre('');
    setUsuario('');
    setPassword('');
    setShowPassword(false);
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-[#090D1A] overflow-hidden px-4 select-none">
      
      {/* Luces ambientales animadas en background */}
      <div className="absolute top-1/4 left-1/4 w-[350px] h-[350px] rounded-full bg-blue-600/20 blur-[100px] animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-indigo-700/10 blur-[130px] animate-pulse pointer-events-none" style={{ animationDelay: '2s' }}></div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md bg-[#0F172A]/70 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        {/* Cabecera / Logo */}
        <div className="flex flex-col items-center mb-8 text-center">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 15 }}
            className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white mb-4 shadow-[0_0_30px_rgba(59,130,246,0.4)]"
          >
            <Shield size={32} className="animate-pulse" />
          </motion.div>
          
          <h2 className="text-3xl font-display font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-300">
            {isLogin ? 'Acceso al Portal' : 'Solicitud de Cuenta'}
          </h2>
          <p className="text-gray-400 mt-2 text-xs">
            {isLogin 
              ? 'Gestión integral de conexiones, fibra y equipos AXS' 
              : 'Completa los datos para registrar tu perfil de técnico AXS'}
          </p>
        </div>

        {/* Notificaciones */}
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-3"
            >
              <AlertCircle size={18} className="shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {successMsg && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-3"
            >
              <CheckCircle2 size={18} className="shrink-0" />
              <span>{successMsg}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div
                key="register-name"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="space-y-2"
              >
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Nombre Completo</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                    <User size={16} />
                  </span>
                  <input
                    required
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej. Richard Choque"
                    className="w-full bg-[#0A0F1D]/60 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-gray-600 text-sm"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">
              {isLogin ? 'Usuario o Correo' : 'Usuario (Correo Electrónico)'}
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <Mail size={16} />
              </span>
              <input
                required
                type={isLogin ? 'text' : 'email'}
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder={isLogin ? 'admin@axs.com o tu_usuario' : 'ejemplo@axs.com'}
                className="w-full bg-[#0A0F1D]/60 border border-white/5 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-gray-600 text-sm font-sans"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider ml-1">Contraseña</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                <KeyRound size={16} />
              </span>
              <input
                required
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#0A0F1D]/60 border border-white/5 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder:text-gray-600 text-sm font-sans"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors focus:outline-none"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98] mt-6 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              <>
                <span>{isLogin ? 'Ingresar al Sistema' : 'Enviar Solicitud'}</span>
                <Send size={16} />
              </>
            )}
          </button>
        </form>

        {/* Toggler de Modo */}
        <div className="mt-8 pt-6 border-t border-white/5 text-center">
          <p className="text-xs text-gray-400">
            {isLogin ? '¿Eres técnico y no tienes cuenta?' : '¿Ya posees una cuenta activa?'}
            <button
              onClick={toggleMode}
              className="text-blue-400 hover:text-blue-300 font-semibold ml-1.5 focus:outline-none transition-colors"
            >
              {isLogin ? 'Solicitar Registro' : 'Iniciar Sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
