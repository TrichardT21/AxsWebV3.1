import { motion, AnimatePresence } from 'motion/react';
import { X, Search, Monitor, ClipboardList, Clock, BarChart2, Calendar, RefreshCcw, Loader2, Edit2, FileText, Star, Copy } from 'lucide-react';
import { createPortal } from 'react-dom';
import { useState, useEffect } from 'react';

export default function SearchResultsModal({ isOpen, onClose, query = '', results = { equipos: [], casos: [] }, isLoading = false, onNavigate, directCaso }) {
  const [selectedCaso, setSelectedCaso] = useState(null);
  const [viewMode, setViewMode] = useState('simple');

  useEffect(() => {
    if (isOpen) {
      if (directCaso) {
        setSelectedCaso(directCaso);
      }
    } else {
      setSelectedCaso(null);
    }
  }, [directCaso, isOpen]);

  const hasEquipos = results.equipos && results.equipos.length > 0;
  const hasCasos = results.casos && results.casos.length > 0;
  const hasResults = hasEquipos || hasCasos;

  const handleEditEquipo = (af) => {
    sessionStorage.setItem('editEquipoAF', af);
    onClose();
    if (onNavigate) {
      onNavigate('registrar-equipo');
    }
  };

  const handleClose = () => {
    setSelectedCaso(null);
    onClose();
  };

  const restar30Minutos = (hora) => {
    try {
      if (!hora || typeof hora !== 'string' || hora === '--:--' || !hora.includes(':')) return '--:--';
      const parts = hora.split(':');
      if (parts.length < 2) return '--:--';
      const horas = parseInt(parts[0], 10);
      const minutos = parseInt(parts[1], 10);
      if (isNaN(horas) || isNaN(minutos)) return '--:--';
      let totalMinutos = horas * 60 + minutos - 30;
      if (totalMinutos < 0) totalMinutos += 24 * 60;
      const nuevasHoras = Math.floor(totalMinutos / 60);
      const nuevosMinutos = totalMinutos % 60;
      
      const pad = (num) => {
        const s = String(num);
        return s.length < 2 ? '0' + s : s;
      };
      
      return `${pad(nuevasHoras)}:${pad(nuevosMinutos)}`;
    } catch (e) {
      console.error("Error en restar30Minutos:", e);
      return '--:--';
    }
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        alert('Caso copiado al portapapeles');
      }).catch(err => {
        console.error('Error al copiar: ', err);
        fallbackCopyToClipboard(text);
      });
    } else {
      fallbackCopyToClipboard(text);
    }
  };

  const fallbackCopyToClipboard = (text) => {
    try {
      const textArea = document.createElement("textarea");
      textArea.value = text;
      textArea.style.position = "fixed";
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);
      if (successful) {
        alert('Caso copiado al portapapeles');
      } else {
        alert('No se pudo copiar el caso.');
      }
    } catch (err) {
      console.error('Fallback copy error: ', err);
    }
  };

  const renderCaseDetails = () => {
    if (!selectedCaso) return null;
    const caso = selectedCaso;

    let fechaFormateada = caso.fecha || '';
    if (fechaFormateada && typeof fechaFormateada === 'string' && fechaFormateada.match(/^\d{4}-\d{2}-\d{2}$/)) {
        const partes = fechaFormateada.split('-');
        fechaFormateada = `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    const horaInicioSinSegundos = caso.hora_inicio && typeof caso.hora_inicio === 'string' ? caso.hora_inicio.substring(0,5) : '--:--';
    const horaFinSinSegundos = caso.hora_fin && typeof caso.hora_fin === 'string' ? caso.hora_fin.substring(0,5) : '';
    const horaTexto = `${horaInicioSinSegundos}${horaFinSinSegundos ? ` - ${horaFinSinSegundos}` : ''}`;
    const horaLlamada = restar30Minutos(horaInicioSinSegundos);

    const safeFormatSpeed = (val) => {
      if (val === undefined || val === null || val === '') return 'N/A';
      return val.toString().replace('.', ',');
    };

    const ethSpeed = `${safeFormatSpeed(caso.velocidad_eth_down)}/${safeFormatSpeed(caso.velocidad_eth_up)} Mbps`;
    const wifi24Speed = `${safeFormatSpeed(caso.velocidad_wifi24_down)}/${safeFormatSpeed(caso.velocidad_wifi24_up)} Mbps`;
    const wifi5DownNum = parseFloat(caso.velocidad_wifi5_down || '0');
    const wifi5UpNum = parseFloat(caso.velocidad_wifi5_up || '0');
    const wifi5Speed = (wifi5DownNum > 0 || wifi5UpNum > 0) 
        ? `${safeFormatSpeed(caso.velocidad_wifi5_down)}/${safeFormatSpeed(caso.velocidad_wifi5_up)} Mbps` 
        : null;

    const estadoUpper = (caso.estado || '').toUpperCase();
    const isSuspended = (!caso.diagnostico && !caso.solucion) || 
                        estadoUpper.includes('SUSPENDIDO') || 
                        estadoUpper.includes('REPROGRAMADO') || 
                        estadoUpper.includes('CANCELADO') || 
                        estadoUpper.includes('AUSENTE') || 
                        estadoUpper.includes('NO CONTESTA');

    let textoPlano = '';

    if (viewMode === 'simple') {
        if (isSuspended) {
            textoPlano = `*CONTRATO:* ${caso.contrato}\n`;
            textoPlano += `*FECHA:* ${fechaFormateada}\n`;
            textoPlano += `*HORA:* ${horaTexto}\n\n`;
            textoPlano += `*${caso.incidencia || 'INCIDENCIA'}:*\n\n`;
            textoPlano += `*DESCRIPCION:* ${caso.observaciones || 'No especificada'}\n\n`;
            textoPlano += `*${caso.estado}*`;
        } else {
            textoPlano = `*CONTRATO:* ${caso.contrato}\n`;
            textoPlano += `*FECHA:* ${fechaFormateada}\n`;
            textoPlano += `*HORA:* ${horaTexto}\n\n`;
            textoPlano += `*${caso.incidencia || 'INCIDENCIA'}:*\n\n`;
            textoPlano += `*DIAGNÓSTICO:* ${caso.diagnostico || 'No especificado'}\n\n`;
            textoPlano += `*SOLUCIÓN:* ${caso.solucion || 'No especificada'}\n\n`;
            
            if (caso.af_recogido) {
                textoPlano += `*AF Recogido:* ${caso.af_recogido}\n`;
                textoPlano += `${caso.serie_antigua} (${caso.estado_recogido || 'Funcional'})\n`;
                textoPlano += `*AF Instalado:* ${caso.af_instalado}\n`;
                textoPlano += `${caso.serie_nueva} (${caso.estado_instalado || 'Nuevo'})\n\n`;
            }
            
            textoPlano += `*Vel. Ethernet (D/U):* ${ethSpeed}\n`;
            textoPlano += `*Vel. Wifi 2.4G (D/U):* ${wifi24Speed}\n`;
            if (wifi5Speed) {
                textoPlano += `*Vel. Wifi 5G (D/U):* ${wifi5Speed}\n`;
            }
            textoPlano += `\n`;
            
            if (caso.observaciones) {
                textoPlano += `*OBSERVACIONES:* \n${caso.observaciones}\n\n`;
            }
            textoPlano += `*${caso.estado}*`;
        }
    } else {
        textoPlano = `CONTRATO: ${caso.contrato}\n`;
        textoPlano += `FECHA: ${fechaFormateada}\n`;
        textoPlano += `HORA LLAMADA: ${horaLlamada}\n`;
        textoPlano += `HORA: ${horaTexto}\n\n`;
        textoPlano += `DIAGNÓSTICO CRM: \n${caso.diagnostico || 'No especificado'}\n\n`;
        textoPlano += `REVISIÓN WAN y LAN: \n${caso.solucion || 'No especificada'}\n`;
        textoPlano += `Vel. Ethernet (D/U): ${ethSpeed}\n`;
        if (caso.observaciones) {
            textoPlano += `${caso.observaciones}\n`;
        }
        textoPlano += `${caso.estado}\n\n`;
        
        if (wifi5Speed) {
            textoPlano += `REVISIÓN WLAN: \n`;
            textoPlano += `Vel. Wifi 2.4G (D/U): ${wifi24Speed}\n`;
            textoPlano += `Vel. Wifi 5G (D/U): ${wifi5Speed}\n\n`;
        } else {
            textoPlano += `REVISIÓN WLAN: \n`;
            textoPlano += `Vel. Wifi 2.4G (D/U): ${wifi24Speed}\n\n`;
        }
        
        if (caso.af_recogido) {
            textoPlano += `DATOS CPE:\n`;
            textoPlano += `AF Recogido: ${caso.af_recogido} (${caso.serie_antigua} - ${caso.estado_recogido || 'Funcional'})\n`;
            textoPlano += `AF Instalado: ${caso.af_instalado} (${caso.serie_nueva} - ${caso.estado_instalado || 'Nuevo'})\n`;
        }
    }

    return (
      <div className="flex-1 overflow-y-auto bg-[#0F172A] text-white flex flex-col h-full border border-white/10">
        <div className="flex gap-4 p-4 border-b border-white/10 justify-end bg-[#0A0F1E]">
          <button 
            onClick={() => setViewMode('simple')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${viewMode === 'simple' ? 'bg-[#6c757d] text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'}`}
          >
            📄 Vista Simple
          </button>
          <button 
            onClick={() => setViewMode('detallada')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full font-medium transition-colors border ${viewMode === 'detallada' ? 'bg-[#28a745] text-white border-transparent' : 'bg-white/5 text-gray-300 border-white/20 hover:bg-white/10'}`}
          >
            ⭐ Vista Detallada
          </button>
        </div>
        
        <div className="p-6 text-gray-200 text-[15px] space-y-1 font-sans leading-[1.6] whitespace-pre-wrap flex-1 overflow-y-auto">
          {viewMode === 'simple' ? (
            isSuspended ? (
              <>
                <div><span className="font-bold text-white">*CONTRATO:*</span> {caso.contrato}</div>
                <div><span className="font-bold text-white">*FECHA:*</span> {fechaFormateada}</div>
                <div><span className="font-bold text-white">*HORA:*</span> {horaTexto}</div>
                <div className="pt-2"><span className="font-bold text-white">*{caso.incidencia || 'INCIDENCIA'}:*</span></div>
                <div className="pt-2"><span className="font-bold text-white">*DESCRIPCION:*</span> {caso.observaciones || 'No especificada'}</div>
                <div className="pt-4 text-[#ffc107] font-bold text-lg">*{caso.estado}*</div>
              </>
            ) : (
              <>
                <div><span className="font-bold text-white">*CONTRATO:*</span> {caso.contrato}</div>
                <div><span className="font-bold text-white">*FECHA:*</span> {fechaFormateada}</div>
                <div><span className="font-bold text-white">*HORA:*</span> {horaTexto}</div>
                <div className="pt-2"><span className="font-bold text-white">*{caso.incidencia || 'INCIDENCIA'}:*</span></div>
                <div className="pt-2"><span className="font-bold text-white">*DIAGNÓSTICO:*</span> {caso.diagnostico || 'No especificado'}</div>
                <div className="pt-2"><span className="font-bold text-white">*SOLUCIÓN:*</span> {caso.solucion || 'No especificada'}</div>
                
                {caso.af_recogido && (
                  <div className="pt-2">
                    <div><span className="font-bold text-white">*AF Recogido:*</span> {caso.af_recogido}</div>
                    <div>{caso.serie_antigua} ({caso.estado_recogido || 'Funcional'})</div>
                    <div><span className="font-bold text-white">*AF Instalado:*</span> {caso.af_instalado}</div>
                    <div>{caso.serie_nueva} ({caso.estado_instalado || 'Nuevo'})</div>
                  </div>
                )}
                
                <div className="pt-2">
                  <div><span className="font-bold text-white">*Vel. Ethernet (D/U):*</span> {ethSpeed}</div>
                  <div><span className="font-bold text-white">*Vel. Wifi 2.4G (D/U):*</span> {wifi24Speed}</div>
                  {wifi5Speed && <div><span className="font-bold text-white">*Vel. Wifi 5G (D/U):*</span> {wifi5Speed}</div>}
                </div>

                {caso.observaciones && (
                  <div className="pt-2">
                    <div><span className="font-bold text-white">*OBSERVACIONES:*</span></div>
                    <div>{caso.observaciones}</div>
                  </div>
                )}
                
                <div className="pt-4 text-[#28a745] font-bold text-lg">*{caso.estado}*</div>
              </>
            )
          ) : (
            <>
              <div>CONTRATO: {caso.contrato}</div>
              <div>FECHA: {fechaFormateada}</div>
              <div>HORA LLAMADA: {horaLlamada}</div>
              <div>HORA: {horaTexto}</div>

              <div className="pt-2">DIAGNÓSTICO CRM:</div>
              <div>{caso.diagnostico || 'No especificado'}</div>

              <div className="pt-2">REVISIÓN WAN y LAN:</div>
              <div>{caso.solucion || 'No especificada'}</div>
              <div>Vel. Ethernet (D/U): {ethSpeed}</div>
              {caso.observaciones && <div>{caso.observaciones}</div>}
              <div className={`pt-4 font-bold text-lg ${isSuspended ? 'text-[#ffc107]' : 'text-[#28a745]'}`}>{caso.estado}</div>

              <div className="pt-2">REVISIÓN WLAN:</div>
              <div>Vel. Wifi 2.4G (D/U): {wifi24Speed}</div>
              {wifi5Speed && <div>Vel. Wifi 5G (D/U): {wifi5Speed}</div>}

              {caso.af_recogido && (
                <div className="pt-2">
                  <div>DATOS CPE:</div>
                  <div>AF Recogido: {caso.af_recogido} ({caso.serie_antigua} - {caso.estado_recogido || 'Funcional'})</div>
                  <div>AF Instalado: {caso.af_instalado} ({caso.serie_nueva} - {caso.estado_instalado || 'Nuevo'})</div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/10 bg-[#0A0F1E] flex justify-end">
          <button 
            onClick={() => copyToClipboard(textoPlano)}
            className="flex items-center gap-2 bg-[#6c757d] hover:bg-[#5a6268] text-white px-4 py-2 rounded-md font-medium transition-colors shadow-sm"
          >
            📋 Copiar Caso
          </button>
        </div>
      </div>
    );
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 font-sans">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-3xl bg-[#0F172A] border border-white/10 rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] h-full"
          >
            {/* Header */}
            <div className="bg-[#2176FF] text-white px-4 py-3 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center gap-2">
                {selectedCaso ? <ClipboardList size={20} /> : <Search size={20} />}
                <h2 className="font-bold text-lg">{selectedCaso ? '📋 Detalles del Caso' : 'Resultados de búsqueda'}</h2>
              </div>
              <button onClick={handleClose} className="text-white hover:bg-white/20 p-1.5 rounded-full transition-colors">
                <X size={24} className="font-bold" />
              </button>
            </div>

            {/* Body */}
            {selectedCaso ? renderCaseDetails() : (
              <div className="flex-1 overflow-y-auto p-6 space-y-8 bg-[#0F172A] text-gray-200">
                <div className="text-sm text-gray-400 italic mb-2">
                  Resultados para: <span className="font-bold text-white">{query}</span>
                </div>

                {isLoading ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                    <Loader2 size={32} className="animate-spin text-blue-500 mb-4" />
                    <p>Buscando resultados...</p>
                  </div>
                ) : !hasResults ? (
                  <div className="flex flex-col items-center justify-center py-12 text-gray-500 text-center">
                    <Search size={48} className="text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-700">No se encontraron resultados</h3>
                    <p className="text-sm">No hay coincidencias de equipos o casos para "{query}".</p>
                  </div>
                ) : (
                  <>
                    {/* Equipos Section */}
                    {hasEquipos && (
                      <section>
                        <div className="flex items-center gap-2 text-green-600 font-bold mb-4 text-lg">
                          <Monitor size={20} />
                          <h3>Equipos ({results.equipos.length})</h3>
                        </div>
                        
                        <div className="space-y-4">
                          {results.equipos.map((equipo, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 border-l-[3px] border-l-blue-500 rounded-lg p-5 shadow-lg">
                              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                                <Monitor size={20} />
                                <h4>AF: {equipo.af || '-'} - {equipo.modelo || '-'}</h4>
                              </div>
                              
                              <div className="space-y-2 text-[15px] text-gray-300">
                                <p><span className="font-bold text-gray-400">Estado:</span> {equipo.estado || '-'}</p>
                                <p><span className="font-bold text-gray-400">Ubicación:</span> {equipo.ubicacion || '-'} {equipo.contrato && equipo.contrato !== '-' ? `- Contrato: ${equipo.contrato}` : ''}</p>
                                <p><span className="font-bold text-gray-400">Fecha:</span> {equipo.fecha_registro || '-'}</p>
                                <p><span className="font-bold text-gray-400">Observaciones:</span> {equipo.observaciones || '-'}</p>
                              </div>
                              
                              <div className="mt-5">
                                <button 
                                  onClick={() => handleEditEquipo(equipo.af)}
                                  className="flex items-center gap-2 bg-[#FFC107] hover:bg-[#FFB300] text-black font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
                                >
                                  <Edit2 size={16} />
                                  Editar Equipo
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* Casos Section */}
                    {hasCasos && (
                      <section>
                        <div className="flex items-center gap-2 text-blue-600 font-bold mb-4 text-lg">
                          <ClipboardList size={20} />
                          <h3>Casos ({results.casos.length})</h3>
                        </div>
                        
                        <div className="space-y-4">
                          {results.casos.map((caso, index) => (
                            <div key={index} className="bg-white/5 border border-white/10 border-l-[3px] border-l-blue-500 rounded-lg p-5 shadow-lg relative overflow-hidden">
                              <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                              <div className="flex items-center gap-2 text-white font-bold text-lg mb-4">
                                <ClipboardList size={20} />
                                <h4>Contrato: {caso.contrato || '-'} - {caso.fecha || '-'}</h4>
                              </div>
                              
                              <div className="space-y-2 text-[15px] text-gray-300">
                                <p className="flex items-center gap-2">
                                  <Clock size={16} className="text-gray-400" /> 
                                  <span className="font-bold text-gray-400">Hora:</span> {caso.hora_inicio || '-'} - {caso.hora_fin || '-'}
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-red-500">📌</span> 
                                  <span className="font-bold text-gray-400">Incidencia:</span> {caso.incidencia || '-'}
                                </p>
                                <p className="flex items-center gap-2">
                                  <BarChart2 size={16} className="text-green-500" /> 
                                  <span className="font-bold text-gray-400">Velocidades:</span> ETH: {caso.velocidad_eth_down || '0'}/{caso.velocidad_eth_up || '0'} Mbps | 2.4G: {caso.velocidad_wifi24_down || '0'}/{caso.velocidad_wifi24_up || '0'} Mbps
                                </p>
                                <p className="flex items-center gap-2">
                                  <span className="text-red-500">📌</span> 
                                  <span className="font-bold text-gray-400">Estado:</span> {caso.estado || '-'}
                                </p>
                                {caso.af_recogido && caso.af_instalado && (
                                  <p className="flex items-center gap-2">
                                    <RefreshCcw size={16} className="text-blue-400" /> 
                                    <span className="font-bold text-gray-400">Cambio:</span> {caso.af_recogido} → {caso.af_instalado}
                                  </p>
                                )}
                                <p className="flex items-center gap-2">
                                  <Calendar size={16} className="text-red-400" /> 
                                  <span className="font-bold text-gray-400">Fecha Registro:</span> {caso.fecha_registro || '-'}
                                </p>
                              </div>
                              
                              <div className="mt-5">
                                <button 
                                  onClick={() => { setSelectedCaso(caso); setViewMode('simple'); }}
                                  className="flex items-center gap-2 bg-[#17a2b8] hover:bg-[#138496] text-white font-semibold px-4 py-2 rounded-md text-sm transition-colors shadow-sm"
                                >
                                  <Search size={16} />
                                  Ver Detalles
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}
                  </>
                )}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }
  return null;
}
