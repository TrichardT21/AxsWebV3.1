import React, { createContext, useState, useEffect, useContext } from 'react';

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
      setViewingTechnicianId(parseInt(savedId, 10));
    }
    if (savedName) {
      setViewingTechnicianName(savedName);
    }
  }, []);

  const checkSession = async () => {
    try {
      const res = await fetch('backend/verificar_sesion.php', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.usuario) {
          setUser(data.usuario);
        } else {
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
      const res = await fetch('backend/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usuario, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success && data.usuario) {
        setUser(data.usuario);
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Credenciales inválidas' };
      }
    } catch (e) {
      return { success: false, error: 'Error de red al conectar con el servidor' };
    }
  };

  const logout = async () => {
    try {
      await fetch('backend/logout.php', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.error('Error en logout backend:', e);
    } finally {
      setUser(null);
      stopViewingAsTechnician();
    }
  };

  const registerRequest = async (nombre, usuario, password) => {
    try {
      const res = await fetch('backend/registro_solicitud.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nombre, usuario, password }),
        credentials: 'include',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        return { success: true, message: data.message };
      } else {
        return { success: false, error: data.error || 'Error al enviar solicitud' };
      }
    } catch (e) {
      return { success: false, error: 'Error de red al conectar con el servidor' };
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
