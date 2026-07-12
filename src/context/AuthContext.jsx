import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase } from '../config/supabase';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewingTechnicianId, setViewingTechnicianId] = useState(null);
  const [viewingTechnicianName, setViewingTechnicianName] = useState(null);

  // Cargar estado de Modo Vista guardado para persistencia ante reloads (F5)
  useEffect(() => {
    const savedId = sessionStorage.getItem('viewingTechnicianId');
    const savedName = sessionStorage.getItem('viewingTechnicianName');
    if (savedId) {
      setViewingTechnicianId(savedId);
    }
    if (savedName) {
      setViewingTechnicianName(savedName);
    }
  }, []);

  const checkSession = async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (session && session.user) {
        const { data: profile } = await supabase
          .from('usuarios')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (profile) {
          if (profile.estado === 'pendiente' || profile.estado === 'inactivo') {
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(profile);
          }
        } else {
          await supabase.auth.signOut();
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (e) {
      console.error('Error al comprobar sesión:', e);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
  }, []);

  const login = async (usuario, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuario,
        password: password,
      });
      if (error) {
        return { success: false, error: error.message };
      }

      const { data: profile } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profile) {
        if (profile.estado === 'pendiente') {
          await supabase.auth.signOut();
          return { success: false, error: 'Tu cuenta está pendiente de aprobación por el administrador.' };
        }
        if (profile.estado === 'inactivo') {
          await supabase.auth.signOut();
          return { success: false, error: 'Tu cuenta está inactiva.' };
        }
        setUser(profile);
        return { success: true };
      } else {
        const fallbackUser = {
          id: data.user.id,
          usuario: data.user.email,
          nombre: data.user.user_metadata.nombre || data.user.email,
          rol: data.user.user_metadata.rol || 'tecnico',
          estado: data.user.user_metadata.estado || 'pendiente'
        };
        setUser(fallbackUser);
        return { success: true };
      }
    } catch (e) {
      return { success: false, error: 'Error al conectar con la base de datos' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.error('Error en logout:', e);
    } finally {
      setUser(null);
      stopViewingAsTechnician();
    }
  };

  const registerRequest = async (nombre, usuario, password) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: usuario,
        password: password,
        options: {
          data: {
            nombre,
            rol: 'tecnico',
            estado: 'pendiente',
            password_plano: password
          }
        }
      });
      if (error) {
        return { success: false, error: error.message };
      }
      return {
        success: true,
        message: 'Solicitud enviada correctamente. El administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.'
      };
    } catch (e) {
      return { success: false, error: 'Error de red o de base de datos' };
    }
  };

  const startViewingAsTechnician = (id, nombre) => {
    setViewingTechnicianId(id);
    setViewingTechnicianName(nombre);
    sessionStorage.setItem('viewingTechnicianId', id.toString());
    sessionStorage.setItem('viewingTechnicianName', nombre);
  };

  const stopViewingAsTechnician = () => {
    setViewingTechnicianId(null);
    setViewingTechnicianName(null);
    sessionStorage.removeItem('viewingTechnicianId');
    sessionStorage.removeItem('viewingTechnicianName');
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      viewingTechnicianId,
      viewingTechnicianName,
      login,
      logout,
      registerRequest,
      startViewingAsTechnician,
      stopViewingAsTechnician,
      checkSession,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
