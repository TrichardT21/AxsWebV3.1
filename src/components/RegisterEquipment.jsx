import { motion, AnimatePresence } from 'motion/react';
import { Monitor, Save, Trash2, Calendar, ClipboardList, Search, CheckCircle2, AlertCircle, Lock } from 'lucide-react';
import React, { useState, useRef } from 'react';
import registerVideo from './assets/register.mp4';
import { API_BASE } from '../config/api';

const getEstadoValue = (dbVal) => {
  if (!dbVal) return 'Nuevo';
  const v = dbVal.toLowerCase();
  if (v.includes('nuevo')) return 'Nuevo';
  if (v.includes('funcional')) return 'Funcional';
  if (v.includes('tormenta')) return 'Dañado por tormenta';
  if (v.includes('dañado')) return 'Dañado';
  if (v.includes('revision') || v.includes('provision')) return 'Para revision';
  if (v.includes('descontinuado')) return 'Descontinuado';
  if (v.includes('obsoleto')) return 'Obsoleto';
  return 'Nuevo';
};

const getUbicacionValue = (dbVal, hasContrato) => {
  if (!dbVal) return hasContrato ? 'Contrato' : '';
  const v = dbVal.toLowerCase();
  if (v.includes('bodega') || v.includes('gabeta')) return 'Mi gabeta (Bodega)';
  if (v.includes('contrato')) return 'Contrato';
  if (v.includes('casa')) return 'En Casa';
  if (v.includes('devuelto')) return 'Devuelto Equipo';
  return dbVal; // fallback
};

const getLocalDateString = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

export default function RegisterEquipment() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentDate, setCurrentDate] = useState(getLocalDateString());
  const [ubicacion, setUbicacion] = useState('');

  // AF lookup state
  const [afValue, setAfValue] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [equipoEncontrado, setEquipoEncontrado] = useState(null);
  const [afLookupDone, setAfLookupDone] = useState(false);

  // Controlled fields that get auto-filled
  const [modelo, setModelo] = useState('');
  const [serie, setSerie] = useState('');
  const [estado, setEstado] = useState('Nuevo');
  const [observaciones, setObservaciones] = useState('');
  const [contrato, setContrato] = useState('');
  
  const [latestEquipment, setLatestEquipment] = useState([]);

  const fetchLatestEquipment = async () => {
    try {
      const res = await fetch(`${API_BASE}/obtener_equipos.php`, { credentials: 'include' });
      const data = await res.json();
      if (Array.isArray(data)) {
        setLatestEquipment(data.slice(0, 9));
      }
    } catch (err) {
      console.error('Error fetching latest equipment:', err);
    }
  };

  const afLookupTimeout = useRef(null);

  const lookupAF = async (af) => {
    if (af.length !== 8) return;
    setIsLookingUp(true);
    setAfLookupDone(false);
    setEquipoEncontrado(null);
    try {
      const res = await fetch(`${API_BASE}/buscar_por_af.php?af=${encodeURIComponent(af)}`, { credentials: 'include' });
      const data = await res.json();
      if (data.existe && data.equipo) {
        const eq = data.equipo;
        setEquipoEncontrado(eq);
        // Auto-fill fields
        setModelo(eq.modelo || '');
        setSerie(eq.serie || '');
        setEstado(getEstadoValue(eq.estado));
        
        const rawUb = (eq.ubicacion || '').toString().trim();
        const ub = getUbicacionValue(rawUb, !!eq.contrato);
        setUbicacion(ub);
        setContrato(eq.contrato || '');
        setObservaciones(eq.observaciones || '');
        // Handle both ISO datetime (2026-05-07T00:00:00) and date-only (2026-05-07) and MySQL datetime (2026-05-07 00:00:00)
        if (eq.fecha_registro) {
          const fechaStr = eq.fecha_registro.toString().replace(' ', 'T');
          setCurrentDate(fechaStr.split('T')[0]);
        }
      } else {
        setEquipoEncontrado(null);
        // Don't reset fields so user can fill freely
      }
    } catch (e) {
      // Silent fail – let user fill manually
    } finally {
      setIsLookingUp(false);
      setAfLookupDone(true);
    }
  };

  const handleAfChange = (e) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 8);
    setAfValue(val);
    // Reset lookup state when AF changes
    setEquipoEncontrado(null);
    setAfLookupDone(false);
    setModelo('');
    setSerie('');
    setEstado('Nuevo');
    setUbicacion('');
    setContrato('');
    setObservaciones('');

    if (afLookupTimeout.current) clearTimeout(afLookupTimeout.current);
    if (val.length === 8) {
      afLookupTimeout.current = setTimeout(() => lookupAF(val), 400);
    }
  };

  React.useEffect(() => {
    fetchLatestEquipment();
    
    const editAf = sessionStorage.getItem('editEquipoAF');
    if (editAf) {
      setAfValue(editAf);
      lookupAF(editAf);
      sessionStorage.removeItem('editEquipoAF');
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());

      // If AF already exists → update; otherwise → insert
      const isUpdate = equipoEncontrado !== null;
      const endpoint = isUpdate ? `${API_BASE}/actualizar_equipo.php` : `${API_BASE}/guardar_equipo.php`;
      const payload = isUpdate
        ? { id: equipoEncontrado.id, estado, ubicacion, contrato: data.contrato || '', fecha_registro: currentDate, observaciones }
        : data;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const result = await response.json();

      if (result.success) {
        alert(isUpdate ? 'Equipo actualizado con éxito' : 'Equipo registrado con éxito en base de datos');
        fetchLatestEquipment();
        handleClear();
      } else {
        alert('Error: ' + (result.error || 'Error desconocido'));
      }
    } catch (error) {
      console.error(error);
      alert('Error de conexión con el servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setAfValue('');
    setModelo('');
    setSerie('');
    setEstado('Nuevo');
    setUbicacion('');
    setContrato('');
    setObservaciones('');
    setCurrentDate(getLocalDateString());
    setEquipoEncontrado(null);
    setAfLookupDone(false);
  };

  const setToday = () => {
    setCurrentDate(getLocalDateString());
  };

  const isExistingEquipo = equipoEncontrado !== null;

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
          <source src={registerVideo} type="video/mp4" />
        </video>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-5xl mx-auto w-full bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Monitor size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">Registro de Equipos</h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="border border-white/10 rounded-2xl p-6 relative">
            <span className="absolute -top-3 left-6 px-2 bg-[#0F172A] text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Información del Equipo
            </span>

            <div className="space-y-6">

              {/* ── AF Input con lookup ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                  AF (Código de Activo Fijo): <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    required
                    type="text"
                    name="af"
                    value={afValue}
                    onChange={handleAfChange}
                    pattern="\d{8}"
                    maxLength={8}
                    title="El AF debe tener exactamente 8 dígitos"
                    placeholder="10123456"
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-mono placeholder:text-gray-600 tracking-wider"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {isLookingUp && (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }}
                        className="text-blue-400"
                      >
                        <Search size={18} />
                      </motion.div>
                    )}
                    {!isLookingUp && afLookupDone && isExistingEquipo && (
                      <CheckCircle2 size={18} className="text-amber-400" />
                    )}
                    {!isLookingUp && afLookupDone && !isExistingEquipo && afValue.length === 8 && (
                      <CheckCircle2 size={18} className="text-green-400" />
                    )}
                  </div>
                </div>

                {/* Banner: equipo YA existe */}
                <AnimatePresence>
                  {afLookupDone && isExistingEquipo && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3 mt-2">
                        <AlertCircle size={18} className="text-amber-400 mt-0.5 shrink-0" />
                        <div className="text-sm text-amber-300">
                          <p className="font-semibold">Este AF ya está registrado en la base de datos.</p>
                          <p className="text-amber-400/80 text-xs mt-0.5">
                            Los datos del equipo se han cargado automáticamente. Modelo y serie no son editables.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Banner: AF libre */}
                  {afLookupDone && !isExistingEquipo && afValue.length === 8 && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: 'auto' }}
                      exit={{ opacity: 0, y: -6, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl px-4 py-3 mt-2">
                        <CheckCircle2 size={18} className="text-green-400 shrink-0" />
                        <p className="text-sm text-green-300">AF disponible — puedes registrar este equipo.</p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ── Modelo ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1 flex items-center gap-2">
                  Modelo del Equipo: <span className="text-red-500">*</span>
                  {isExistingEquipo && <Lock size={12} className="text-gray-500" />}
                </label>
                {isExistingEquipo ? (
                  <>
                    <input type="hidden" name="modelo" value={modelo} />
                    <input
                      type="text"
                      value={modelo || '—'}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-500 font-mono cursor-not-allowed opacity-70"
                    />
                  </>
                ) : (
                  <select
                    required
                    name="modelo"
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none"
                  >
                    <option value="" className="bg-[#0F172A]">-- Selecciona un modelo --</option>
                    <optgroup label="VDSL">
                      <option value="ZXHN H168N" className="bg-[#0F172A]">ZXHN H168N (VDSL)</option>
                      <option value="ZXHN H168A" className="bg-[#0F172A]">ZXHN H168A (VDSL)</option>
                      <option value="VR530V" className="bg-[#0F172A]">VR530V (VDSL)</option>
                    </optgroup>
                    <optgroup label="GPON">
                      <option value="ZXHN F660" className="bg-[#0F172A]">ZXHN F660 (GPON)</option>
                      <option value="ZXHN F670L" className="bg-[#0F172A]">ZXHN F670L (GPON)</option>
                    </optgroup>
                  </select>
                )}
              </div>

              {/* ── Serie ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1 flex items-center gap-2">
                  Serie del Equipo:
                  {isExistingEquipo && <Lock size={12} className="text-gray-500" />}
                </label>
                {isExistingEquipo ? (
                  <>
                    <input type="hidden" name="serie" value={serie} />
                    <input
                      type="text"
                      value={serie || '—'}
                      disabled
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-gray-500 font-mono cursor-not-allowed opacity-70"
                    />
                  </>
                ) : (
                  <input
                    type="text"
                    name="serie"
                    value={serie}
                    onChange={(e) => setSerie(e.target.value.toUpperCase())}
                    placeholder="ZTEGC4D3374A"
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-mono placeholder:text-gray-600"
                  />
                )}
              </div>

              {/* ── Estado y Ubicación ── */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                    Estado del Equipo: <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="estado"
                    value={estado}
                    onChange={(e) => setEstado(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none"
                  >
                    <option value="Nuevo" className="bg-[#0F172A]">🆕 Nuevo</option>
                    <option value="Funcional" className="bg-[#0F172A]">✅ Funcional</option>
                    <option value="Dañado" className="bg-[#0F172A]">❌ Dañado</option>
                    <option value="Dañado por tormenta" className="bg-[#0F172A]">⚡ Dañado por tormenta</option>
                    <option value="Para revision" className="bg-[#0F172A]">🔧 Para revision</option>
                    <option value="Descontinuado" className="bg-[#0F172A]">📦 Descontinuado</option>
                    <option value="Obsoleto" className="bg-[#0F172A]">🗑️ Obsoleto</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                    Ubicación: <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    name="ubicacion"
                    value={ubicacion}
                    onChange={(e) => setUbicacion(e.target.value)}
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none"
                  >
                    <option value="" className="bg-[#0F172A]">-- Selecciona ubicación --</option>
                    <option value="Mi gabeta (Bodega)" className="bg-[#0F172A]">📦 Mi gabeta (Bodega)</option>
                    <option value="Contrato" className="bg-[#0F172A]">📄 Asignado a contrato</option>
                    <option value="En Casa" className="bg-[#0F172A]">En casa</option>
                    <option value="Devuelto Equipo" className="bg-[#0F172A]">↩️ Devuelto Equipo</option>
                  </select>
                </div>
              </div>

              {/* ── Contrato (si ubicación = En Casa o Contrato) ── */}
              <AnimatePresence>
                {ubicacion === 'Contrato' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-1.5 mt-2">
                      <label className="text-xs font-semibold text-gray-400 uppercase ml-1">
                        Contrato: <span className="text-red-500">*</span>
                      </label>
                      <input
                        required
                        type="text"
                        name="contrato"
                        value={contrato}
                        onChange={(e) => setContrato(e.target.value)}
                        pattern="^[GVA]-\d{5}$"
                        maxLength={7}
                        title="El contrato debe tener exactamente 7 caracteres: G-, V- o A- seguido de 5 números (ej. G-12345)"
                        placeholder="G-12345"
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-gray-600"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* ── Fecha ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Fecha de Registro:</label>
                <div className="flex gap-2">
                  <input
                    type="date"
                    name="fecha_registro"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                  />
                  <button
                    type="button"
                    onClick={setToday}
                    className="bg-gray-600 hover:bg-gray-500 text-white px-5 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Calendar size={14} /> Hoy
                  </button>
                </div>
              </div>

              {/* ── Observaciones ── */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-gray-400 uppercase ml-1">Observaciones (opcional):</label>
                <textarea
                  name="observaciones"
                  rows={3}
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  placeholder="Observaciones adicionales sobre el equipo..."
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white resize-none placeholder:text-gray-600"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              disabled={isSubmitting}
              type="submit"
              className={`w-full sm:w-auto min-w-[200px] ${isExistingEquipo ? 'bg-amber-600 hover:bg-amber-500 shadow-amber-600/20' : 'bg-blue-600 hover:bg-blue-500 shadow-blue-600/20'
                } text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={18} />
              {isSubmitting ? (isExistingEquipo ? 'Actualizando...' : 'Guardando...') : (isExistingEquipo ? 'Actualizar Equipo' : 'Guardar Equipo')}
            </button>
            <button
              type="button"
              onClick={handleClear}
              className="w-full sm:w-auto min-w-[150px] bg-gray-600 hover:bg-gray-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 active:scale-[0.98]"
            >
              <Trash2 size={18} />
              Limpiar
            </button>
          </div>
        </form>

        {/* ── Tabla últimos registros ── */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center gap-2">
            <ClipboardList className="text-blue-500" size={24} />
            <h3 className="text-xl font-display font-bold text-white">Últimos equipos registrados</h3>
          </div>

          <div className="overflow-x-auto bg-white/5 border border-white/5 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-5 py-4 font-semibold text-gray-400">AF</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Modelo</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Serie</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Estado</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Ubicación</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Contrato</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {latestEquipment.map((eq, i) => (
                  <tr key={i} className="hover:bg-white/5 transition-colors">
                    <td className="px-5 py-4 text-gray-300">{eq.af}</td>
                    <td className="px-5 py-4 text-gray-300">{eq.modelo}</td>
                    <td className="px-5 py-4 text-gray-300">{eq.serie}</td>
                    <td className="px-5 py-4">
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/5 px-2 py-1 rounded">
                        {eq.estado}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-gray-300">{eq.ubicacion}</td>
                    <td className="px-5 py-4 text-gray-300">{eq.contrato || '-'}</td>
                    <td className="px-5 py-4 text-gray-500">{eq.fecha_registro}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
