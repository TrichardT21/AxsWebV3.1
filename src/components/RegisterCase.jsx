import { motion, AnimatePresence } from 'motion/react';
import { Send, FileText, Calendar, Gauge, Activity, CheckCircle2, AlertTriangle, ShieldCheck, Search } from 'lucide-react';
import React, { useState, useRef } from 'react';
import registerVideo from './assets/register.mp4';

const getLocalDateString = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

async function buscarEquipoPorAF(af) {
  if (af.length !== 8) return null;
  try {
    const res = await fetch(`backend/buscar_por_af.php?af=${encodeURIComponent(af)}`, { credentials: 'include' });
    const data = await res.json();
    if (data.existe && data.equipo) return data.equipo;
  } catch { /* silent */ }
  return null;
}

export default function RegisterCase() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [visitType, setVisitType] = useState('realizada');
  const [currentDate, setCurrentDate] = useState(getLocalDateString());
  const [showEquipmentChange, setShowEquipmentChange] = useState(false);

  // AF recogido lookup
  const [afRecogido, setAfRecogido] = useState('');
  const [modeloRecogido, setModeloRecogido] = useState('');
  const [serieAntigua, setSerieAntigua] = useState('');
  const [lookingRecogido, setLookingRecogido] = useState(false);
  const [recogidoFound, setRecogidoFound] = useState(false);
  const timerRecogido = useRef(null);

  // AF instalado lookup
  const [afInstalado, setAfInstalado] = useState('');
  const [modeloInstalado, setModeloInstalado] = useState('');
  const [serieNueva, setSerieNueva] = useState('');
  const [lookingInstalado, setLookingInstalado] = useState(false);
  const [instaladoFound, setInstaladoFound] = useState(false);
  const timerInstalado = useRef(null);

  const [incidencia, setIncidencia] = useState('');

  const handleAfRecogidoChange = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 8);
    setAfRecogido(v); setModeloRecogido(''); setSerieAntigua(''); setRecogidoFound(false);
    if (timerRecogido.current) clearTimeout(timerRecogido.current);
    if (v.length === 8) {
      timerRecogido.current = setTimeout(async () => {
        setLookingRecogido(true);
        const eq = await buscarEquipoPorAF(v);
        if (eq) { setModeloRecogido(eq.modelo || ''); setSerieAntigua(eq.serie || ''); setRecogidoFound(true); }
        else { setRecogidoFound(false); }
        setLookingRecogido(false);
      }, 400);
    }
  };

  const handleAfInstaladoChange = (val) => {
    const v = val.replace(/\D/g, '').slice(0, 8);
    setAfInstalado(v); setModeloInstalado(''); setSerieNueva(''); setInstaladoFound(false);
    if (timerInstalado.current) clearTimeout(timerInstalado.current);
    if (v.length === 8) {
      timerInstalado.current = setTimeout(async () => {
        setLookingInstalado(true);
        const eq = await buscarEquipoPorAF(v);
        if (eq) { setModeloInstalado(eq.modelo || ''); setSerieNueva(eq.serie || ''); setInstaladoFound(true); }
        else { setInstaladoFound(false); }
        setLookingInstalado(false);
      }, 400);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      const response = await fetch('backend/guardar_caso.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        credentials: 'include'
      });
      
      const result = await response.json();
      
      if (result.success) {
        alert('Caso registrado con éxito en base de datos');
        form.reset();
        setIncidencia('');
        setShowEquipmentChange(false);
        setVisitType('realizada');
        setCurrentDate(getLocalDateString());
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

  const setToday = () => {
    setCurrentDate(getLocalDateString());
  };

  const SectionTitle = ({ title, icon }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-white/10">
      <div className="text-blue-500">{icon}</div>
      <h3 className="text-sm font-semibold uppercase tracking-wider text-blue-400">{title}</h3>
    </div>
  );

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 flex items-center justify-center w-full">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
          <source src={registerVideo} type="video/mp4" />
        </video>
      </div>
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-4xl w-full bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
      >
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <FileText size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold">Formulario de Visita Técnica</h2>
          <p className="text-gray-400 mt-2">Complete el reporte técnico detallado de la intervención.</p>
          <a
            href="docs/FORMULARIO DAÑADOS POR TORMENTA.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-blue-400 hover:text-blue-300 font-semibold py-2.5 px-5 rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          >
            <FileText size={14} />
            FORMULARIO DAÑADOS POR TORMENTA
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-10">
          
          {/* Tipo de Visita */}
          <section>
            <SectionTitle title="Tipo de Visita" icon={<Activity size={18} />} />
            <div className="flex flex-wrap gap-6 bg-white/5 p-4 rounded-xl border border-white/5">
              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="visitType" 
                  checked={visitType === 'realizada'} 
                  onChange={() => setVisitType('realizada')}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visitType === 'realizada' ? 'border-blue-500 bg-blue-500' : 'border-gray-600'}`}>
                  {visitType === 'realizada' && <CheckCircle2 size={12} className="text-white" />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${visitType === 'realizada' ? 'text-white' : 'text-gray-400'}`}>Visita Realizada</span>
                  <span className="text-[10px] text-gray-500">Servicio concluido exitosamente</span>
                </div>
              </label>

              <label className="flex items-center gap-3 cursor-pointer group">
                <input 
                  type="radio" 
                  name="visitType" 
                  checked={visitType === 'suspendida'} 
                  onChange={() => setVisitType('suspendida')}
                  className="hidden"
                />
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${visitType === 'suspendida' ? 'border-amber-500 bg-amber-500' : 'border-gray-600'}`}>
                  {visitType === 'suspendida' && <AlertTriangle size={12} className="text-black" />}
                </div>
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${visitType === 'suspendida' ? 'text-white' : 'text-gray-400'}`}>Visita Suspendida</span>
                  <span className="text-[10px] text-gray-500">Cancelada por motivos externos</span>
                </div>
              </label>
            </div>
          </section>

          {/* Información General */}
          <section>
            <SectionTitle title="Información General" icon={<ShieldCheck size={18} />} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Contrato</label>
                <input 
                  required
                  type="text" 
                  name="contrato"
                  pattern="^[GVA]-\d{5}$"
                  maxLength={7}
                  title="El contrato debe tener exactamente 7 caracteres: G-, V- o A- seguido de 5 números (ej. G-12345)"
                  placeholder="A-12345 / V-12345 / G-12345"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white placeholder:text-gray-600"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Fecha</label>
                <div className="flex gap-2">
                  <input 
                    required
                    type="date" 
                    name="fecha"
                    value={currentDate}
                    onChange={(e) => setCurrentDate(e.target.value)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                  />
                  <button 
                    type="button"
                    onClick={setToday}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-2"
                  >
                    <Calendar size={14} /> HOY
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">
                  {visitType === 'suspendida' ? 'Hora Llamada' : 'Hora Inicio'}
                </label>
                <input 
                  type="time" 
                  name="hora_inicio"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Hora Fin</label>
                <input 
                  type="time" 
                  name="hora_fin"
                  disabled={visitType === 'suspendida'}
                  className={`w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white ${visitType === 'suspendida' ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
                {visitType === 'suspendida' && <p className="text-[10px] text-gray-500 ml-1">Dejar vacío si no aplica.</p>}
              </div>
            </div>
          </section>

          <AnimatePresence mode="wait">
            {visitType === 'realizada' ? (
              <motion.div
                key="realizada-sections"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-10"
              >
                {/* Detalles del Servicio */}
                <section className="space-y-6">
                  <SectionTitle title="Detalles del Servicio" icon={<Activity size={18} />} />
                  
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tipo de Incidencia</label>
                    <input 
                      required 
                      name="incidencia" 
                      list="incidencias-list"
                      value={incidencia}
                      onChange={(e) => setIncidencia(e.target.value.toUpperCase())}
                      placeholder="Selecciona o escribe la incidencia..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" 
                    />
                    <datalist id="incidencias-list">
                      <option value="CON LINEA PERO NO LOGEA" />
                      <option value="CON SERVICIO PERO SIN WIFI" />
                      <option value="DAÑO POR TORMENTA ELECTRICA" />
                      <option value="INTERMITENCIA DE SERVICIO" />
                      <option value="INTERMITENCIA EN LA CONEXIÓN" />
                      <option value="INTERMITENCIA EN WIFI" />
                      <option value="LENTITUD DE SERVICIO" />
                      <option value="LENTITUD E INTERMITENCIA" />
                      <option value="LENTITUD EN WIFI" />
                      <option value="MODEM CON PROBLEMAS" />
                      <option value="MODEM DAÑADO" />
                      <option value="LENTITUD Y CORTES" />
                      <option value="LENTITUD DEL SERVICIO WIFI" />
                      <option value="NO NAVEGA EN DISPOSITIVOS" />
                      <option value="PROBLEMAS DE COBERTURA" />
                      <option value="RECLAMA VELOCIDAD DE CONTRATO" />
                      <option value="SIN RESPUESTA AL IP PUBLICO" />
                      <option value="SIN RESPUESTA DEL MODEM" />
                      <option value="SIN SERVICIO" />
                      <option value="SOLUCIONES WIFI" />
                      <option value="MICROCORTES" />
                      <option value="NO NAVEGA" />
                      <option value="NO NAVEGA POR PUERTO LAN 3" />
                      <option value="NO NAVEGA 5G" />
                      <option value="NO NAVEGA WIFI" />
                      <option value="NO LEVANTA LINEA" />
                      <option value="VISITA DEMOSTRATIVA" />
                    </datalist>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Diagnóstico</label>
                    <textarea 
                      required
                      name="diagnostico"
                      rows={3}
                      placeholder="Describe el diagnóstico de la situación..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Solución aplicada</label>
                    <textarea 
                      required
                      name="solucion"
                      rows={3}
                      placeholder="Describe la solución implementada..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white resize-none"
                    ></textarea>
                  </div>

                  <div className="flex flex-col gap-4 p-4 bg-white/5 border border-white/5 rounded-xl">
                    <div className="flex items-center gap-3">
                      <input 
                        type="checkbox" 
                        id="equipo-cambio"
                        checked={showEquipmentChange}
                        onChange={(e) => setShowEquipmentChange(e.target.checked)}
                        className="w-5 h-5 rounded border-white/20 bg-white/5 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      />
                      <label htmlFor="equipo-cambio" className="text-sm font-medium text-gray-300 cursor-pointer">
                        Se realizó cambio de equipo / ONU
                      </label>
                    </div>

                    <AnimatePresence>
                      {showEquipmentChange && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="pt-4 border-t border-white/5 space-y-6">
                            {/* Fila Recogido */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">AF Recogido:</label>
                                <div className="relative">
                                  <input type="text" name="af_recogido" value={afRecogido} onChange={(e) => handleAfRecogidoChange(e.target.value)} placeholder="10124277" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                  {lookingRecogido && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400"><Search size={14} /></motion.div>}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Modelo Equipo Recogido:</label>
                                {recogidoFound ? (
                                  <>
                                    <input type="hidden" name="modelo_recogido" value={modeloRecogido} />
                                    <input type="text" value={modeloRecogido} disabled className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-sm text-gray-500 cursor-not-allowed opacity-70" />
                                  </>
                                ) : (
                                  <select required name="modelo_recogido" value={modeloRecogido} onChange={(e) => setModeloRecogido(e.target.value)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="">-- Selecciona --</option>
                                    <optgroup label="VDSL">
                                      <option value="ZXHN H168N">ZXHN H168N (VDSL)</option>
                                      <option value="ZXHN H168A">ZXHN H168A (VDSL)</option>
                                      <option value="VR530V">VR530V (VDSL)</option>
                                    </optgroup>
                                    <optgroup label="GPON">
                                      <option value="ZXHN F660">ZXHN F660 (GPON)</option>
                                      <option value="ZXHN F670L">ZXHN F670L (GPON)</option>
                                    </optgroup>
                                  </select>
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Serie Antigua:</label>
                                {recogidoFound ? (
                                  <>
                                    <input type="hidden" name="serie_antigua" value={serieAntigua} />
                                    <input type="text" value={serieAntigua} disabled className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-sm text-gray-500 font-mono cursor-not-allowed opacity-70" />
                                  </>
                                ) : (
                                  <input type="text" name="serie_antigua" value={serieAntigua} onChange={(e) => setSerieAntigua(e.target.value.toUpperCase())} placeholder="ZTEGC4D3374A" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Estado Equipo Recogido:</label>
                                <select name="estado_recogido" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option value="">-- Selecciona estado --</option>
                                  <option value="Funcional" className="bg-[#0F172A]">✅ Funcional</option>
                                  <option value="Dañado" className="bg-[#0F172A]">❌ Dañado</option>
                                  <option value="Dañado por tormenta" className="bg-[#0F172A]">⚡ Dañado por tormenta</option>
                                  <option value="Para revision" className="bg-[#0F172A]">Para revision</option>
                                  <option value="Obsoleto" className="bg-[#0F172A]">Obsoleto</option>
                                  <option value="En blanco" className="bg-[#0F172A]">📄 En blanco (sin especificar)</option>
                                </select>
                              </div>
                            </div>

                            {/* Fila Instalado */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">AF Instalado:</label>
                                <div className="relative">
                                  <input type="text" name="af_instalado" value={afInstalado} onChange={(e) => handleAfInstaladoChange(e.target.value)} placeholder="10194718" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 pr-8 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                  {lookingInstalado && <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} className="absolute right-2 top-1/2 -translate-y-1/2 text-blue-400"><Search size={14} /></motion.div>}
                                </div>
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Modelo Equipo Instalado:</label>
                                {instaladoFound ? (
                                  <>
                                    <input type="hidden" name="modelo_instalado" value={modeloInstalado} />
                                    <input type="text" value={modeloInstalado} disabled className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-sm text-gray-500 cursor-not-allowed opacity-70" />
                                  </>
                                ) : (
                                  <select required name="modelo_instalado" value={modeloInstalado} onChange={(e) => setModeloInstalado(e.target.value)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                    <option value="">-- Selecciona --</option>
                                    <optgroup label="VDSL">
                                      <option value="ZXHN H168N">ZXHN H168N (VDSL)</option>
                                      <option value="ZXHN H168A">ZXHN H168A (VDSL)</option>
                                      <option value="VR530V">VR530V (VDSL)</option>
                                    </optgroup>
                                    <optgroup label="GPON">
                                      <option value="ZXHN F660">ZXHN F660 (GPON)</option>
                                      <option value="ZXHN F670L">ZXHN F670L (GPON)</option>
                                    </optgroup>
                                  </select>
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Serie Nueva:</label>
                                {instaladoFound ? (
                                  <>
                                    <input type="hidden" name="serie_nueva" value={serieNueva} />
                                    <input type="text" value={serieNueva} disabled className="w-full bg-white/5 border border-white/5 rounded-lg py-2 px-3 text-sm text-gray-500 font-mono cursor-not-allowed opacity-70" />
                                  </>
                                ) : (
                                  <input type="text" name="serie_nueva" value={serieNueva} onChange={(e) => setSerieNueva(e.target.value.toUpperCase())} placeholder="ZTEGDAD0A2EC" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500" />
                                )}
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">Estado Equipo Instalado:</label>
                                <select name="estado_instalado" className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500">
                                  <option value="">-- Selecciona estado --</option>
                                  <option value="Nuevo" className="bg-[#0F172A]">🆕 Nuevo</option>
                                  <option value="Funcional" className="bg-[#0F172A]">✅ Funcional</option>
                                  <option value="Reutilizado" className="bg-[#0F172A]">🔄 Reutilizado</option>
                                  <option value="En blanco" className="bg-[#0F172A]">📄 En blanco (sin especificar)</option>
                                </select>
                              </div>
                            </div>

                            <p className="text-[10px] text-gray-500 italic mt-2">
                              * La serie antigua se marca como (Funcional), la nueva como (Nuevo).
                            </p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </section>

                {/* Velocidades de Prueba */}
                <section>
                  <SectionTitle title="Velocidades de Prueba (Mbps)" icon={<Gauge size={18} />} />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 bg-white/5 p-6 rounded-2xl border border-white/5">
                    {[
                      { label: 'Ethernet (Down)', id: 'eth-down' },
                      { label: 'Ethernet (Up)', id: 'eth-up' },
                      { label: 'WiFi 2.4G (Down)', id: 'wifi24-down' },
                      { label: 'WiFi 2.4G (Up)', id: 'wifi24-up' },
                      { label: 'WiFi 5G (Down)', id: 'wifi5-down' },
                      { label: 'WiFi 5G (Up)', id: 'wifi5-up' },
                    ].map((input) => (
                      <div key={input.id} className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500 uppercase ml-1">{input.label}</label>
                        <input 
                          type="number" 
                          name={`velocidad_${input.id.replace('-', '_')}`}
                          step="0.01"
                          placeholder="0.00"
                          className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-2 px-3 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all text-white"
                        />
                      </div>
                    ))}
                  </div>
                </section>
              </motion.div>
            ) : (
              <motion.div
                key="suspendida-sections"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-10"
              >
                <section className="space-y-6">
                  <SectionTitle title="Tipo de Incidencia" icon={<Activity size={18} />} />
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Tipo de Incidencia</label>
                    <input 
                      required 
                      name="incidencia" 
                      list="incidencias-list-susp"
                      value={incidencia}
                      onChange={(e) => setIncidencia(e.target.value.toUpperCase())}
                      placeholder="Selecciona o escribe la incidencia..."
                      className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white" 
                    />
                    <datalist id="incidencias-list-susp">
                      <option value="CON LINEA PERO NO LOGEA" />
                      <option value="CON SERVICIO PERO SIN WIFI" />
                      <option value="DAÑO POR TORMENTA ELECTRICA" />
                      <option value="INTERMITENCIA DE SERVICIO" />
                      <option value="INTERMITENCIA EN LA CONEXIÓN" />
                      <option value="INTERMITENCIA EN WIFI" />
                      <option value="LENTITUD DE SERVICIO" />
                      <option value="LENTITUD E INTERMITENCIA" />
                      <option value="LENTITUD EN WIFI" />
                      <option value="MODEM CON PROBLEMAS" />
                      <option value="MODEM DAÑADO" />
                      <option value="LENTITUD Y CORTES" />
                      <option value="LENTITUD DEL SERVICIO WIFI" />
                      <option value="NO NAVEGA EN DISPOSITIVOS" />
                      <option value="PROBLEMAS DE COBERTURA" />
                      <option value="RECLAMA VELOCIDAD DE CONTRATO" />
                      <option value="SIN RESPUESTA AL IP PUBLICO" />
                      <option value="SIN RESPUESTA DEL MODEM" />
                      <option value="SIN SERVICIO" />
                      <option value="SOLUCIONES WIFI" />
                      <option value="MICROCORTES" />
                      <option value="NO NAVEGA" />
                      <option value="NO NAVEGA POR PUERTO LAN 3" />
                      <option value="NO NAVEGA 5G" />
                      <option value="NO NAVEGA WIFI" />
                      <option value="NO LEVANTA LINEA" />
                      <option value="VISITA DEMOSTRATIVA" />
                    </datalist>
                  </div>
                </section>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Finalización */}
          <section className="space-y-6">
            <SectionTitle title="Finalización" icon={<CheckCircle2 size={18} />} />
            
            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Observaciones / Motivo de Suspensión</label>
              <textarea 
                name="observaciones"
                rows={4}
                placeholder={visitType === 'suspendida' 
                  ? "📌 MOTIVO DE SUSPENSIÓN DE LA VISITA:\nEj: Cliente no se encontraba en domicilio, reprogramación solicitada, etc."
                  : "Notas adicionales..."
                }
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white resize-none"
              ></textarea>
              {visitType === 'suspendida' && <p className="text-[10px] text-gray-500 ml-1">En caso de visita suspendida, describe detalladamente el motivo aquí.</p>}
            </div>

            <div className="space-y-2">
              <label className="text-xs font-semibold text-gray-500 uppercase ml-1">Estado Final</label>
              <select required name="estado" className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white appearance-none">
                <option value="" className="bg-[#0F172A]">-- Selecciona estado final --</option>
                <option value="CON SERVICIO NORMAL" className="bg-[#0F172A]">CON SERVICIO NORMAL</option>
                <option value="CANCELADO POR ACCESO" className="bg-[#0F172A]">CANCELADO POR ACCESO</option>
                <option value="CANCELADO POR CLIENTE" className="bg-[#0F172A]">CANCELADO POR CLIENTE</option>
                <option value="CASO DESCARTADO" className="bg-[#0F172A]">CASO DESCARTADO</option>
                <option value="CASO SUSPENDIDO" className="bg-[#0F172A]">CASO SUSPENDIDO</option>
                <option value="CLIENTE AUSENTE" className="bg-[#0F172A]">CLIENTE AUSENTE</option>
                <option value="DERIVADO A ODN" className="bg-[#0F172A]">DERIVADO A ODN</option>
                <option value="DERIVADO A PEX" className="bg-[#0F172A]">DERIVADO A PEX</option>
                <option value="LINEA CON PROBLEMAS" className="bg-[#0F172A]">LINEA CON PROBLEMAS</option>
                <option value="REALIZADO EN OFICINAS" className="bg-[#0F172A]">REALIZADO EN OFICINAS</option>
                <option value="REALIZADO POR OTRA AREA" className="bg-[#0F172A]">REALIZADO POR OTRA AREA</option>
                <option value="REALIZADO REMOTAMENTE" className="bg-[#0F172A]">REALIZADO REMOTAMENTE</option>
                <option value="REALIZADO SIN PROBLEMAS" className="bg-[#0F172A]">REALIZADO SIN PROBLEMAS</option>
                <option value="REPROGRAMADO POR ACCESO" className="bg-[#0F172A]">REPROGRAMADO POR ACCESO</option>
                <option value="REPROGRAMADO POR CLIENTE" className="bg-[#0F172A]">REPROGRAMADO POR CLIENTE</option>
                <option value="REPROGRAMADO, NO CONTESTA" className="bg-[#0F172A]">REPROGRAMADO, NO CONTESTA</option>
                <option value="SUSPENDIDO POR CLIENTE" className="bg-[#0F172A]">SUSPENDIDO POR CLIENTE</option>
                <option value="SUSPENDIDO POR VARIOS INTENTOS" className="bg-[#0F172A]">SUSPENDIDO POR VARIOS INTENTOS</option>
                <option value="SUSPENDIDO, NO CONTESTA" className="bg-[#0F172A]">SUSPENDIDO, NO CONTESTA</option>
                <option value="SIN SERVICIO POR INCOMPATIBILIDAD" className="bg-[#0F172A]">SIN SERVICIO POR INCOMPATIBILIDAD</option>
                <option value="USUARIO NO CONTESTA" className="bg-[#0F172A]">USUARIO NO CONTESTA</option>
              </select>
            </div>
          </section>

          <div className="pt-6">
            <button 
              disabled={isSubmitting}
              type="submit"
              className={`w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-5 rounded-2xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-blue-600/20 active:scale-[0.98] ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  PROCESANDO REPORTE...
                </>
              ) : (
                <>
                  FINALIZAR REGISTRO
                  <Send size={20} />
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
