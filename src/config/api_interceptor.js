import { supabase } from './supabase';

const ORIGINAL_FETCH = window.fetch;

// Helper to convert data and mock a Response
function mockResponse(data, status = 200) {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  return new Response(blob, {
    status,
    headers: { 'Content-Type': 'application/json' }
  });
}

// Interceptor function
window.fetch = async function (input, init) {
  let url = typeof input === 'string' ? input : input.url;
  
  // Only intercept calls targeting /AxsReact/backend/
  if (!url.includes('/AxsReact/backend/') && !url.includes('/backend/')) {
    return ORIGINAL_FETCH.apply(this, arguments);
  }

  const endpoint = url.split('/').pop().split('?')[0];
  const queryParams = new URLSearchParams(url.includes('?') ? url.split('?')[1] : '');
  
  let body = {};
  if (init && init.body) {
    try {
      if (typeof init.body === 'string') {
        body = JSON.parse(init.body);
      } else if (init.body instanceof FormData) {
        body = Object.fromEntries(init.body.entries());
      }
    } catch (e) {
      console.warn('Could not parse request body:', e);
    }
  }

  try {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user;

    if (currentUser && endpoint !== 'login.php' && endpoint !== 'logout.php' && endpoint !== 'verificar_sesion.php') {
      const { data: currentProfile } = await supabase.from('usuarios').select('estado').eq('id', currentUser.id).maybeSingle();
      if (currentProfile && (currentProfile.estado === 'pendiente' || currentProfile.estado === 'inactivo')) {
        await supabase.auth.signOut();
        window.location.reload();
        return mockResponse({ success: false, error: 'Tu cuenta ha sido bloqueada o puesta en espera.' }, 401);
      }
    }

    switch (endpoint) {
      case 'verificar_sesion.php': {
        if (!currentUser) return mockResponse({ success: false });
        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', currentUser.id).maybeSingle();
        if (profile && (profile.estado === 'pendiente' || profile.estado === 'inactivo')) {
          await supabase.auth.signOut();
          return mockResponse({ success: false });
        }
        return mockResponse({
          success: true,
          usuario: profile || {
            id: currentUser.id,
            nombre: currentUser.user_metadata.nombre || currentUser.email,
            usuario: currentUser.email,
            rol: currentUser.user_metadata.rol || 'tecnico',
            estado: 'activo'
          }
        });
      }

      case 'login.php': {
        const { usuario, password } = body;
        const { data, error } = await supabase.auth.signInWithPassword({ email: usuario, password });
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        
        const { data: profile } = await supabase.from('usuarios').select('*').eq('id', data.user.id).maybeSingle();
        if (profile && profile.estado === 'pendiente') {
          await supabase.auth.signOut();
          return mockResponse({ success: false, error: 'Tu cuenta está pendiente de aprobación por el administrador.' }, 200);
        }
        if (profile && profile.estado === 'inactivo') {
          await supabase.auth.signOut();
          return mockResponse({ success: false, error: 'Tu cuenta está inactiva.' }, 200);
        }
        return mockResponse({
          success: true,
          usuario: profile || {
            id: data.user.id,
            nombre: data.user.user_metadata.nombre || data.user.email,
            usuario: data.user.email,
            rol: data.user.user_metadata.rol || 'tecnico',
            estado: data.user.user_metadata.estado || 'activo'
          }
        });
      }

      case 'logout.php': {
        await supabase.auth.signOut();
        return mockResponse({ success: true });
      }

      case 'registro_solicitud.php': {
        const { nombre, usuario, password } = body;
        const { data, error } = await supabase.auth.signUp({
          email: usuario,
          password: password,
          options: {
            data: { nombre, rol: 'tecnico', estado: 'pendiente', password_plano: password }
          }
        });
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, message: 'Solicitud enviada correctamente. El administrador debe aprobar tu cuenta antes de que puedas iniciar sesión.' });
      }

      case 'buscar_por_af.php': {
        const af = queryParams.get('af');
        const { data, error } = await supabase.from('equipos').select('*').eq('af', af).maybeSingle();
        if (error) return mockResponse({ existe: false, error: error.message });
        return mockResponse({ existe: !!data, equipo: data });
      }

      case 'obtener_equipos.php': {
        let query = supabase.from('equipos').select('*');
        
        const tecnico_id = queryParams.get('tecnico_id');
        const personal = queryParams.get('personal');
        
        if (tecnico_id) {
          query = query.eq('usuario_id', tecnico_id);
        } else if (personal === 'true' && currentUser) {
          query = query.eq('usuario_id', currentUser.id);
        }
        
        const { data, error } = await query.order('fecha_creacion', { ascending: false });
        if (error) return mockResponse({ error: error.message }, 200);
        return mockResponse(data || []);
      }

      case 'guardar_equipo.php': {
        const { af, modelo, serie, estado, ubicacion, contrato, fecha_registro, observaciones } = body;
        const { data, error } = await supabase.from('equipos').insert([{
          af, modelo, serie, estado, ubicacion, contrato: contrato || null, fecha_registro, observaciones,
          usuario_id: currentUser ? currentUser.id : null
        }]).select();
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, data });
      }

      case 'actualizar_equipo.php': {
        const { id, estado, ubicacion, contrato, fecha_registro, observaciones } = body;
        const { data, error } = await supabase.from('equipos').update({
          estado, ubicacion, contrato: contrato || null, fecha_registro, observaciones
        }).eq('id', id).select();
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, data });
      }

      case 'eliminar_equipo.php': {
        const { id } = body;
        const { error } = await supabase.from('equipos').delete().eq('id', id);
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true });
      }

      case 'obtener_casos.php': {
        let query = supabase.from('casos').select('*');
        
        const tecnico_id = queryParams.get('tecnico_id');
        const personal = queryParams.get('personal');
        
        if (tecnico_id) {
          query = query.eq('usuario_id', tecnico_id);
        } else if (personal === 'true' && currentUser) {
          query = query.eq('usuario_id', currentUser.id);
        }
        
        const { data, error } = await query.order('fecha_registro', { ascending: false });
        if (error) return mockResponse({ error: error.message }, 200);
        return mockResponse(data || []);
      }

      case 'guardar_caso.php': {
        const payload = {
          ...body,
          usuario_id: currentUser ? currentUser.id : null
        };
        // Clean empty values to respect numeric constraints
        const numericFields = [
          'velocidad_eth_down', 'velocidad_eth_up',
          'velocidad_wifi24_down', 'velocidad_wifi24_up',
          'velocidad_wifi5_down', 'velocidad_wifi5_up'
        ];
        numericFields.forEach(field => {
          if (payload[field] === '' || payload[field] === undefined) {
            payload[field] = null;
          }
        });
        const { data, error } = await supabase.from('casos').insert([payload]).select();
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, data });
      }

      case 'actualizar_caso.php': {
        const { id, ...updates } = body;
        const numericFields = [
          'velocidad_eth_down', 'velocidad_eth_up',
          'velocidad_wifi24_down', 'velocidad_wifi24_up',
          'velocidad_wifi5_down', 'velocidad_wifi5_up'
        ];
        numericFields.forEach(field => {
          if (updates[field] === '' || updates[field] === undefined) {
            updates[field] = null;
          }
        });
        const { data, error } = await supabase.from('casos').update(updates).eq('id', id).select();
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, data });
      }

      case 'eliminar_caso.php': {
        const { id } = body;
        const { error } = await supabase.from('casos').delete().eq('id', id);
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true });
      }

      case 'buscar.php': {
        const tipo = queryParams.get('tipo');
        const q = queryParams.get('q') || '';
        
        let query;
        if (tipo === 'casos') {
          query = supabase.from('casos').select('*');
          if (q) {
            query = query.or(`contrato.ilike.%${q}%,incidencia.ilike.%${q}%,af_recogido.ilike.%${q}%,af_instalado.ilike.%${q}%`);
          }
          const { data, error } = await query.order('fecha_registro', { ascending: false });
          if (error) return mockResponse({ error: error.message }, 200);
          return mockResponse(data || []);
        } else {
          query = supabase.from('equipos').select('*');
          if (q) {
            query = query.or(`af.ilike.%${q}%,contrato.ilike.%${q}%,serie.ilike.%${q}%,modelo.ilike.%${q}%`);
          }
          const { data, error } = await query.order('fecha_creacion', { ascending: false });
          if (error) return mockResponse({ error: error.message }, 200);
          return mockResponse(data || []);
        }
      }

      case 'obtener_vdsl.php': {
        const contrato = queryParams.get('contrato');
        const { data, error } = await supabase.from('conf_vdsl').select('*').eq('contrato', contrato).maybeSingle();
        if (error) return mockResponse({ existe: false, error: error.message });
        return mockResponse({ existe: !!data, config: data });
      }

      case 'guardar_vdsl.php': {
        const { data, error } = await supabase.from('conf_vdsl').upsert([body], { onConflict: 'contrato' }).select();
        if (error) return mockResponse({ success: false, error: error.message }, 200);
        return mockResponse({ success: true, data });
      }

      case 'admin_usuarios.php': {
        const method = init?.method || 'GET';
        if (method === 'GET') {
          const estado = queryParams.get('estado') || 'todos';
          let query = supabase.from('usuarios').select('*');
          if (estado === 'pendiente') query = query.eq('estado', 'pendiente');
          else if (estado === 'activo') query = query.eq('estado', 'activo');
          
          const { data: users, error } = await query.order('fecha_creacion', { ascending: false });
          if (error) return mockResponse({ error: error.message }, 200);

          // Get counts from cases and equipments for each user
          const { data: cases } = await supabase.from('casos').select('usuario_id');
          const { data: equipments } = await supabase.from('equipos').select('usuario_id');

          const userList = (users || []).map(u => {
            const total_casos = (cases || []).filter(c => c.usuario_id === u.id).length;
            const total_equipos = (equipments || []).filter(e => e.usuario_id === u.id).length;
            return {
              ...u,
              total_casos,
              total_equipos
            };
          });
          return mockResponse(userList);
        } else {
          // POST / PUT / DELETE emulation
          const { accion, id, ...updateData } = body;
          const targetId = id || queryParams.get('id');

          if (accion === 'aprobar') {
            const { error } = await supabase.from('usuarios').update({ estado: 'activo' }).eq('id', targetId);
            if (error) return mockResponse({ success: false, error: error.message }, 200);
            return mockResponse({ success: true, message: 'Usuario aprobado correctamente' });
          }
          if (accion === 'rechazar') {
            const { error } = await supabase.from('usuarios').delete().eq('id', targetId).eq('estado', 'pendiente');
            if (error) return mockResponse({ success: false, error: error.message }, 200);
            return mockResponse({ success: true, message: 'Solicitud rechazada y eliminada' });
          }
          if (accion === 'desactivar') {
            const { error } = await supabase.from('usuarios').update({ estado: 'inactivo' }).eq('id', targetId);
            if (error) return mockResponse({ success: false, error: error.message }, 200);
            return mockResponse({ success: true, message: 'Usuario desactivado correctamente' });
          }
          if (accion === 'editar') {
            const { nombre, usuario, rol, estado, password } = body;
            const payload = { nombre, usuario, rol, estado };
            if (password) {
              payload.password_plano = password;
            }
            const { error } = await supabase.from('usuarios').update(payload).eq('id', targetId);
            if (error) return mockResponse({ success: false, error: error.message }, 200);
            return mockResponse({ success: true, message: 'Usuario actualizado correctamente' });
          }

          // Direct creation by admin
          const { nombre, usuario: newEmail, password, rol } = body;
          const { data, error } = await supabase.auth.signUp({
            email: newEmail,
            password: password,
            options: {
              data: { nombre, rol, estado: 'activo', password_plano: password }
            }
          });
          if (error) return mockResponse({ success: false, error: error.message }, 200);
          await supabase.from('usuarios').update({ estado: 'activo', rol }).eq('id', data.user.id);
          return mockResponse({ success: true, message: 'Usuario creado correctamente' });
        }
      }

      default:
        return ORIGINAL_FETCH.apply(this, arguments);
    }
  } catch (err) {
    console.error(`Error in intercepted fetch for ${endpoint}:`, err);
    return mockResponse({ success: false, error: err.message }, 200);
  }
};
