import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sliders, Search, Info, CheckCircle, AlertTriangle, 
  X, Wifi, ShieldCheck, Key, RefreshCw, Layers, Compass, HelpCircle, Activity 
} from 'lucide-react';

const ontEquipments = [
  {
    id: 1,
    modelo: "F660",
    fecha: "2014/2016",
    publico: "SI",
    series: ["ZTEGC078", "ZTEGC814", "ZTEGC815", "ZTEGC817"],
    serieOriginal: "ZTEGC078/ZTEGC814, 815, 817",
    interfaz: "VERDE",
    credencial: "admin",
    observaciones: "EQUIPO MONOBANDA, WIFI 4, N300"
  },
  {
    id: 2,
    modelo: "F660.V8",
    fecha: "SEP 2018",
    publico: "SI",
    series: ["ZTEGC4D3"],
    serieOriginal: "ZTEGC4D3",
    interfaz: "VERDE",
    credencial: "admin",
    observaciones: "EQUIPO MONOBANDA, WIFI 4, N300"
  },
  {
    id: 3,
    modelo: "F670L ANTENA PLANA",
    fecha: "—",
    publico: "NO",
    series: ["ZTEGC4B4", "ZTEGC4B5"],
    serieOriginal: "ZTEGC4B4 / ZTEGC4B5",
    interfaz: "VERDE",
    credencial: "Web@0063",
    observaciones: "WIFI INTERMITENTE, WIFI 5, AC1200"
  },
  {
    id: 4,
    modelo: "F670L",
    fecha: "AGOSTO 2020",
    publico: "SI",
    series: ["ZTEGC8E4"],
    serieOriginal: "ZTEGC8E4",
    interfaz: "HOMOLOGADO",
    credencial: "axsf670",
    observaciones: "BUENA COBERTURA, WIFI 5, AC1200 equipo atenúa la potencia óptica (no recomendable instalar menores de -21 dbm)"
  },
  {
    id: 5,
    modelo: "F670L",
    fecha: "OCT 2021",
    publico: "SI",
    series: ["ZTEGCF243", "ZTEGCF244", "ZTEGCF245"],
    serieOriginal: "ZTEGCF243/ 244/ 245",
    interfaz: "HOMOLOGADO",
    credencial: "axsf670",
    observaciones: "BUENA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 6,
    modelo: "F670L",
    fecha: "JUL 2022",
    publico: "NO",
    series: ["ZTEGC0979"],
    serieOriginal: "ZTEGC0979",
    interfaz: "VERDE",
    credencial: "Web@0063",
    observaciones: "BAJA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 7,
    modelo: "F670L.V9",
    fecha: "NOV 2022",
    publico: "SI",
    series: ["ZTEGD168"],
    serieOriginal: "ZTEGD168",
    interfaz: "HAYEC",
    credencial: "Web@0063",
    observaciones: "MUY BUENA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 8,
    modelo: "F670L",
    fecha: "MAR 2023",
    publico: "NO",
    series: ["ZTEGC09E"],
    serieOriginal: "ZTEGC09E",
    interfaz: "VERDE",
    credencial: "Web@0063",
    observaciones: "BAJA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 9,
    modelo: "F670L.V9",
    fecha: "JUN 2023",
    publico: "SI",
    series: ["ZTEGD1D0", "ZTEGD16"],
    serieOriginal: "ZTEGD1D0 / ZTEGD16",
    interfaz: "HAYEC",
    credencial: "Web@0063",
    observaciones: "MUY BUENA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 10,
    modelo: "F670L",
    fecha: "SEP 2023",
    publico: "SI",
    series: ["ZTEGD1D9", "ZTEGD1DB"],
    serieOriginal: "ZTEGD1D9/ ZTEGD1DB",
    interfaz: "HOMOLOGADO",
    credencial: "axsf670",
    observaciones: "SE DEGRADA COBERTURA EN LA MAYORÍA, WIFI 5, AC1200 equipo ideal para servicio IP PUBLICO"
  },
  {
    id: 11,
    modelo: "F670L.V9",
    fecha: "JUN 2024",
    publico: "SI",
    series: ["ZTEGD6DD", "ZTEGD6DE", "ZTEGD38D"],
    serieOriginal: "ZTEGD6DD/ZTEGD6DE/ZTEGD38D",
    interfaz: "HAYEC",
    credencial: "Web@0063",
    observaciones: "MUY BUENA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 12,
    modelo: "F670L.V9",
    fecha: "JUL 2025",
    publico: "SI",
    series: ["ZTEGDAD0"],
    serieOriginal: "ZTEGDAD0",
    interfaz: "HAYEC",
    credencial: "Web@0063",
    observaciones: "MUY BUENA COBERTURA, WIFI 5, AC1200"
  },
  {
    id: 13,
    modelo: "F6600",
    fecha: "—",
    publico: "SI",
    series: ["ZTEGD39E"],
    serieOriginal: "ZTEGD39E /",
    interfaz: "HAYEC",
    credencial: "—",
    observaciones: "MUY BUENA COBERTURA WIFI 6, AX3000"
  },
  {
    id: 14,
    modelo: "F6005",
    fecha: "FEB 2025",
    publico: "SI",
    series: ["ZTEGD637"],
    serieOriginal: "ZTEGD637 /",
    interfaz: "—",
    credencial: "—",
    observaciones: "SOLO LAN. Puerto Ethernet: 1x 2.5GE RJ-45"
  }
];

// Datos DSL de la segunda tabla (DSL LINK INFORMATION)
const dslColumns = [100, 200, 300, 400, 500, 600, 700, 800, 900, 1000, 1100];

const dslRows = [
  { label: "VELOCIDAD max DOWN", key: "velDown", values: [120, 100, 92, 85, 77, 67, 60, 55, 51, 45, 44] },
  { label: "VELOCIDAD max UP", key: "velUp", values: [43, 31, 28.5, 25.5, 22.5, 17.5, 14, 11, 9, 7, 6] },
  { label: "MARGEN DE RUIDO DOWN", key: "ruidoDown", values: [26, 25, 23, 21, 19, 18, 16, 15, 14, 13, 13] },
  { label: "MARGEN DE RUIDO UP", key: "ruidoUp", values: [27, 24, 22, 20, 18, 15, 13, 11, 9, 8, 8] },
  { label: "ATENUACION max DOWN", key: "atenDown", values: [4, 5, 7, 9, 10, 12, 14, 15, 17, 18, 19] },
  { label: "ATENUACION max UP", key: "atenUp", values: [1, 1, 1, 2, 2, 3, 4, 5, 5, 6, 7] }
];

export default function EvaluacionParametros() {
  // ONT States
  const [gponInput, setGponInput] = useState('');
  const [selectedOnt, setSelectedOnt] = useState(null);
  const [isOntModalOpen, setIsOntModalOpen] = useState(false);
  const [ontErrorMessage, setOntErrorMessage] = useState('');
  const [ontFilterText, setOntFilterText] = useState('');
  const [selectedInterfazFilter, setSelectedInterfazFilter] = useState('ALL');

  // DSL States
  const [distanceInput, setDistanceInput] = useState('');
  const [dslErrorMessage, setDslErrorMessage] = useState('');
  const [interpolatedDslResult, setInterpolatedDslResult] = useState(null);
  const [isDslModalOpen, setIsDslModalOpen] = useState(false);

  // Evalúa la serie GPON ingresada
  const handleEvaluateGpon = (e) => {
    e.preventDefault();
    const cleanInput = gponInput.trim().toUpperCase();
    
    if (!cleanInput) {
      setOntErrorMessage('Por favor ingrese una serie GPON');
      return;
    }

    // 1. Intento de coincidencia exacta por prefijo
    let matched = ontEquipments.find(ont => {
      return ont.series.some(pref => {
        const normPref = pref.trim().toUpperCase().replace(/O/g, '0');
        const normInput = cleanInput.replace(/O/g, '0');
        return normInput.startsWith(normPref) || normPref.startsWith(normInput);
      });
    });

    let proximity = false;

    // 2. Si no hay coincidencia exacta, intentamos por aproximidad (primeros 7 caracteres)
    if (!matched && cleanInput.length >= 7) {
      matched = ontEquipments.find(ont => {
        return ont.series.some(pref => {
          const normPref = pref.trim().toUpperCase().replace(/O/g, '0');
          const normInput = cleanInput.replace(/O/g, '0');
          return normInput.substring(0, 7) === normPref.substring(0, 7);
        });
      });
      if (matched) {
        proximity = true;
      }
    }

    if (matched) {
      setSelectedOnt({ ...matched, isProximityMatch: proximity });
      setIsOntModalOpen(true);
      setOntErrorMessage('');
    } else {
      setOntErrorMessage('No se encontró ninguna tanda de equipos ONT con esa serie GPON.');
      setSelectedOnt(null);
    }
  };

  // Evalúa la distancia DSL ingresada
  const handleEvaluateDsl = (e) => {
    e.preventDefault();
    const cleanDist = distanceInput.trim();
    
    if (!cleanDist) {
      setDslErrorMessage('Por favor ingrese una distancia en metros');
      return;
    }

    const d = parseFloat(cleanDist);
    if (isNaN(d) || d < 0) {
      setDslErrorMessage('Por favor ingrese un número de distancia válido mayor o igual a 0');
      return;
    }

    // Algoritmo matemático: Interpolación Lineal (Regla de 3)
    const result = calculateDslParameters(d);
    setInterpolatedDslResult(result);
    setIsDslModalOpen(true);
    setDslErrorMessage('');
  };

  const calculateDslParameters = (targetDistance) => {
    // Definimos los puntos de referencia
    const points = dslColumns.map((dist, idx) => {
      const rawAtenUp = dslRows.find(r => r.key === 'atenUp').values[idx];

      return {
        distancia: dist,
        velDown: dslRows.find(r => r.key === 'velDown').values[idx],
        velUp: dslRows.find(r => r.key === 'velUp').values[idx],
        ruidoDown: dslRows.find(r => r.key === 'ruidoDown').values[idx],
        ruidoUp: dslRows.find(r => r.key === 'ruidoUp').values[idx],
        atenDown: dslRows.find(r => r.key === 'atenDown').values[idx],
        atenUp: rawAtenUp
      };
    });

    // Casos límite
    if (targetDistance <= points[0].distancia) {
      return {
        distancia: targetDistance,
        referencia: "Cercana al límite mínimo (<= 100m)",
        puntosCercanos: [points[0]],
        exacto: true,
        ...points[0]
      };
    }
    if (targetDistance >= points[points.length - 1].distancia) {
      return {
        distancia: targetDistance,
        referencia: "Cercana al límite máximo (>= 1100m)",
        puntosCercanos: [points[points.length - 1]],
        exacto: true,
        ...points[points.length - 1]
      };
    }

    // Encontrar los dos puntos adyacentes para la interpolación
    let p1 = null;
    let p2 = null;
    for (let i = 0; i < points.length - 1; i++) {
      if (targetDistance >= points[i].distancia && targetDistance <= points[i + 1].distancia) {
        p1 = points[i];
        p2 = points[i + 1];
        break;
      }
    }

    // Si coincide exactamente con uno
    if (targetDistance === p1.distancia) {
      return { distancia: targetDistance, exacto: true, referencia: `Exacto (${p1.distancia}m)`, puntosCercanos: [p1], ...p1 };
    }
    if (targetDistance === p2.distancia) {
      return { distancia: targetDistance, exacto: true, referencia: `Exacto (${p2.distancia}m)`, puntosCercanos: [p2], ...p2 };
    }

    // Interpolación lineal
    const ratio = (targetDistance - p1.distancia) / (p2.distancia - p1.distancia);
    
    const interpolateValue = (v1, v2) => {
      const val = v1 + ratio * (v2 - v1);
      return parseFloat(val.toFixed(2));
    };

    return {
      distancia: targetDistance,
      exacto: false,
      referencia: `Interpolación entre ${p1.distancia}m y ${p2.distancia}m`,
      puntosCercanos: [p1, p2],
      velDown: interpolateValue(p1.velDown, p2.velDown),
      velUp: interpolateValue(p1.velUp, p2.velUp),
      ruidoDown: interpolateValue(p1.ruidoDown, p2.ruidoDown),
      ruidoUp: interpolateValue(p1.ruidoUp, p2.ruidoUp),
      atenDown: interpolateValue(p1.atenDown, p2.atenDown),
      atenUp: interpolateValue(p1.atenUp, p2.atenUp)
    };
  };

  const handleRowClick = (ont) => {
    setSelectedOnt(ont);
    setIsOntModalOpen(true);
  };

  // Filtrado de la tabla principal ONT
  const filteredOnts = ontEquipments.filter(ont => {
    const matchesSearch = 
      ont.modelo.toLowerCase().includes(ontFilterText.toLowerCase()) ||
      ont.serieOriginal.toLowerCase().includes(ontFilterText.toLowerCase()) ||
      ont.observaciones.toLowerCase().includes(ontFilterText.toLowerCase());

    const matchesInterfaz = 
      selectedInterfazFilter === 'ALL' || 
      ont.interfaz === selectedInterfazFilter ||
      (selectedInterfazFilter === 'SIN_INTERFAZ' && !ont.interfaz);

    return matchesSearch && matchesInterfaz;
  });

  // Estilo según color de interfaz
  const getInterfazBadgeStyle = (interfaz) => {
    switch (interfaz) {
      case 'VERDE':
        return 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20';
      case 'HOMOLOGADO':
        return 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
      case 'HAYEC':
        return 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border border-white/5';
    }
  };

  // Obtener un color y diagnóstico basado en observaciones
  const getDiagnostic = (observaciones) => {
    const obs = observaciones.toUpperCase();
    if (obs.includes('MUY BUENA COBERTURA') || obs.includes('WIFI 6')) {
      return {
        label: 'Recomendado / Excelente',
        color: 'text-emerald-400 bg-emerald-500/15 border-emerald-500/20',
        icon: <CheckCircle className="text-emerald-400" size={18} />
      };
    } else if (obs.includes('BAJA COBERTURA') || obs.includes('INTERMITENTE') || obs.includes('DEGRADA')) {
      return {
        label: 'Restringido / Precaución',
        color: 'text-red-400 bg-red-500/15 border-red-500/20',
        icon: <AlertTriangle className="text-red-400" size={18} />
      };
    } else if (obs.includes('BUENA COBERTURA') || obs.includes('ATENÚA')) {
      return {
        label: 'Aceptable / Condicionado',
        color: 'text-amber-400 bg-amber-500/15 border-amber-500/20',
        icon: <Info className="text-amber-400" size={18} />
      };
    }
    return {
      label: 'Información Estándar',
      color: 'text-blue-400 bg-blue-500/15 border-blue-500/20',
      icon: <Info className="text-blue-400" size={18} />
    };
  };

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 w-full">
      {/* Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl"></div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-7xl mx-auto w-full bg-[#0F172A]/80 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl space-y-16"
      >
        {/* Header Principal */}
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
            <Sliders size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold text-white">Evaluación de Parámetros</h2>
          <p className="text-xs uppercase tracking-widest font-semibold text-gray-400 mt-2">
            Verificación e identificación rápida de tandas ONT y límites de enlace DSL
          </p>
        </div>

        {/* ▬▬▬▬▬ PRIMER BLOQUE: TANDA DE EQUIPOS ONT ▬▬▬▬▬ */}
        <div className="space-y-6">
          <div className="border border-white/10 rounded-2xl p-6 relative bg-white/5">
            <span className="absolute -top-3 left-6 px-2 bg-[#0F172A] text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Evaluar Serie GPON / ONT
            </span>

            <form onSubmit={handleEvaluateGpon} className="space-y-4">
              <p className="text-sm text-gray-300">
                Ingrese los primeros dígitos o el número de serie completo de la ONT (comenzando típicamente por <span className="font-mono text-blue-400">ZTEGC</span> o <span className="font-mono text-blue-400">ZTEGD</span>) para identificar de inmediato a qué tanda pertenece y cuáles son sus características técnicas.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={gponInput}
                    onChange={(e) => setGponInput(e.target.value.toUpperCase())}
                    placeholder="Ej. ZTEGC078, ZTEGD168, o serie completa..."
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-mono placeholder:text-gray-600 tracking-wide uppercase"
                  />
                  <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  <Search size={16} />
                  Evaluar GPON
                </button>
              </div>
              {ontErrorMessage && (
                <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} /> {ontErrorMessage}
                </p>
              )}
            </form>
          </div>

          {/* Controles y Tabla ONT */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex items-center gap-2">
                <Layers className="text-blue-500" size={20} />
                <h3 className="text-xl font-display font-bold text-white">Tanda de Equipos ONT (ONU)</h3>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <input
                  type="text"
                  value={ontFilterText}
                  onChange={(e) => setOntFilterText(e.target.value)}
                  placeholder="Filtrar por modelo, serie, obs..."
                  className="bg-white/5 border border-white/10 rounded-xl py-2 px-4 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-white w-full sm:w-60"
                />
                <select
                  value={selectedInterfazFilter}
                  onChange={(e) => setSelectedInterfazFilter(e.target.value)}
                  className="bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 text-white appearance-none"
                >
                  <option value="ALL">Todas las Interfaces</option>
                  <option value="VERDE">Interfaz Verde</option>
                  <option value="HOMOLOGADO">Homologado</option>
                  <option value="HAYEC">Hayec</option>
                  <option value="SIN_INTERFAZ">Sin interfaz registrada</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl">
              <table className="w-full text-left text-sm">
                <thead className="bg-[#0A0F1E] border-b border-white/10 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-5 py-4 text-gray-400">Modelo / Fecha</th>
                    <th className="px-5 py-4 text-gray-400 text-center">Público</th>
                    <th className="px-5 py-4 text-gray-400">Serie</th>
                    <th className="px-5 py-4 text-gray-400">Interfaz</th>
                    <th className="px-5 py-4 text-gray-400">Credencial</th>
                    <th className="px-5 py-4 text-gray-400">Observaciones Wifi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-white">
                  {filteredOnts.length > 0 ? (
                    filteredOnts.map((ont) => (
                      <tr 
                        key={ont.id} 
                        onClick={() => handleRowClick(ont)}
                        className="hover:bg-white/5 transition-all cursor-pointer group"
                      >
                        <td className="px-5 py-4">
                          <span className="font-semibold group-hover:text-blue-400 transition-colors">{ont.modelo}</span>
                          {ont.fecha && (
                            <span className="block text-[11px] text-gray-500 mt-0.5">{ont.fecha}</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded ${
                            ont.publico === 'SI' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-red-500/10 text-red-400 border border-red-500/20'
                          }`}>
                            {ont.publico}
                          </span>
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-300">
                          {ont.serieOriginal}
                        </td>
                        <td className="px-5 py-4">
                          {ont.interfaz ? (
                            <span className={`inline-block text-[10px] font-semibold uppercase px-2 py-0.5 rounded ${getInterfazBadgeStyle(ont.interfaz)}`}>
                              {ont.interfaz}
                            </span>
                          ) : (
                            <span className="text-gray-600">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 font-mono text-xs text-gray-300">
                          {ont.credencial || <span className="text-gray-600">—</span>}
                        </td>
                        <td className="px-5 py-4 text-xs text-gray-300">
                          <p className="line-clamp-2" title={ont.observaciones}>
                            {ont.observaciones}
                          </p>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-5 py-8 text-center text-gray-500">
                        No se encontraron equipos ONT que coincidan con la búsqueda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* ▬▬▬▬▬ SEGUNDO BLOQUE: DSL LINK INFORMATION (NUEVO) ▬▬▬▬▬ */}
        <div className="space-y-6 pt-6 border-t border-white/10">
          <div className="border border-white/10 rounded-2xl p-6 relative bg-white/5">
            <span className="absolute -top-3 left-6 px-2 bg-[#0F172A] text-xs font-semibold text-blue-400 uppercase tracking-wider">
              Evaluar DSL por Distancia
            </span>

            <form onSubmit={handleEvaluateDsl} className="space-y-4">
              <p className="text-sm text-gray-300">
                Ingrese la distancia en metros desde el nodo hasta el cliente para evaluar y predecir los parámetros esperados de enlace DSL (Velocidad, Ruido, Atenuación). El sistema calcula los valores recomendados mediante un algoritmo de interpolación lineal.
              </p>
              <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={distanceInput}
                    onChange={(e) => setDistanceInput(e.target.value)}
                    placeholder="Ingrese la distancia en metros (Ej: 250, 450, 950...)"
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-3.5 px-4 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white font-sans placeholder:text-gray-600 tracking-wide"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-xs">metros</span>
                </div>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 active:scale-[0.98]"
                >
                  <Activity size={16} />
                  Calcular Parámetros
                </button>
              </div>
              {dslErrorMessage && (
                <p className="text-xs font-semibold text-red-400 flex items-center gap-1.5 mt-2 bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg">
                  <AlertTriangle size={14} /> {dslErrorMessage}
                </p>
              )}
            </form>
          </div>

          {/* Tabla DSL Link Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Compass className="text-blue-500" size={20} />
              <h3 className="text-xl font-display font-bold text-white">DSL LINK INFORMATION</h3>
            </div>

            <div className="overflow-x-auto bg-white/5 border border-white/10 rounded-2xl">
              <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[800px]">
                <thead className="bg-[#0A0F1E] border-b border-white/10 text-gray-400 font-semibold text-center">
                  <tr>
                    <th className="px-4 py-4 text-left border-r border-white/5 font-display min-w-[200px]">
                      ESTADO DE CONEXION / <br/>DISTANCIA HASTA
                    </th>
                    {dslColumns.map((col, i) => (
                      <th key={i} className="px-3 py-4 font-mono font-bold text-white bg-blue-600/5">
                        {col} m
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-center font-mono">
                  {dslRows.map((row) => (
                    <tr key={row.key} className="hover:bg-white/5 transition-all">
                      <td className="px-4 py-3 text-left font-sans text-gray-300 font-bold border-r border-white/5">
                        {row.label}
                      </td>
                      {row.values.map((val, idx) => (
                        <td key={idx} className="px-3 py-3 relative group text-gray-300">
                          {val}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-[10px] text-gray-500 italic mt-1 flex items-center gap-1.5 ml-1">
              <Info size={12} className="shrink-0" />
              * La tabla muestra los valores de diseño físico del papel de parámetros de red de cobre AXS.
            </p>
          </div>
        </div>
      </motion.div>

      {/* ▬▬▬▬▬ MODALES DE RESPUESTA ▬▬▬▬▬ */}

      {/* Modal 1: Características ONT */}
      <AnimatePresence>
        {isOntModalOpen && selectedOnt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOntModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className={`h-2 w-full ${
                selectedOnt.interfaz === 'VERDE' ? 'bg-emerald-500' :
                selectedOnt.interfaz === 'HOMOLOGADO' ? 'bg-amber-500' :
                selectedOnt.interfaz === 'HAYEC' ? 'bg-blue-500' : 'bg-gray-500'
              }`}></div>

              <button 
                onClick={() => setIsOntModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white flex items-baseline gap-2">
                    {selectedOnt.modelo}
                    {selectedOnt.fecha && (
                      <span className="text-xs font-sans text-gray-400 font-normal">({selectedOnt.fecha})</span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">
                    Características de Tanda ONT
                  </p>
                </div>

                <div className="flex flex-wrap gap-2.5">
                  <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-gray-300">
                    <Layers size={12} className="text-blue-400" />
                    <span>Público: <strong>{selectedOnt.publico}</strong></span>
                  </div>
                  {selectedOnt.interfaz && (
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${getInterfazBadgeStyle(selectedOnt.interfaz)}`}>
                      <span>Interfaz: <strong>{selectedOnt.interfaz}</strong></span>
                    </div>
                  )}
                </div>

                <div className="space-y-4 bg-[#0A0F1E] border border-white/5 rounded-2xl p-4 md:p-5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Prefijo de Serie:</span>
                    <p className="font-mono text-sm text-blue-400 font-semibold">{selectedOnt.serieOriginal}</p>
                    {selectedOnt.isProximityMatch && (
                      <span className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 bg-amber-500/10 border border-amber-500/20 px-2 py-1 rounded">
                        <AlertTriangle size={12} className="shrink-0" /> Coincidencia por aproximidad (está en el rango de esta tanda)
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      <Key size={10} /> Credencial de Acceso:
                    </span>
                    <p className="font-mono text-sm text-gray-200 bg-white/5 px-2.5 py-1 rounded border border-white/5 inline-block select-all cursor-pointer">
                      {selectedOnt.credencial || '— (No requiere o no registrado)'}
                    </p>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/5">
                    <span className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
                      <Wifi size={10} /> Observaciones Wi-Fi:
                    </span>
                    <p className="text-xs text-gray-300 leading-relaxed font-sans">
                      {selectedOnt.observaciones}
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-xs ${getDiagnostic(selectedOnt.observaciones).color}`}>
                  <div className="shrink-0 mt-0.5">
                    {getDiagnostic(selectedOnt.observaciones).icon}
                  </div>
                  <div>
                    <h4 className="font-bold uppercase tracking-wider text-[10px]">
                      Estado Wifi: {getDiagnostic(selectedOnt.observaciones).label}
                    </h4>
                    <p className="text-gray-400 mt-1">
                      {selectedOnt.observaciones.toUpperCase().includes('BAJA COBERTURA') || selectedOnt.observaciones.toUpperCase().includes('INTERMITENTE')
                        ? 'Se recomienda evitar el uso de estos equipos para clientes con alto tráfico o grandes distancias. Priorice ONT de banda dual o superior.'
                        : selectedOnt.observaciones.toUpperCase().includes('MUY BUENA COBERTURA')
                        ? 'Equipo altamente recomendado. Óptimo desempeño en redes domésticas estándar y de mediano tamaño.'
                        : 'Verifique los parámetros ópticos en el sitio antes de completar la instalación.'}
                    </p>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsOntModalOpen(false)}
                    className="bg-white/10 hover:bg-white/15 text-white font-semibold py-2 px-5 rounded-xl transition-all text-xs"
                  >
                    Entendido / Cerrar
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Diagnóstico DSL por Distancia (NUEVO) */}
      <AnimatePresence>
        {isDslModalOpen && interpolatedDslResult && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDslModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            ></motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="relative z-10 w-full max-w-lg bg-[#0F172A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
            >
              <div className="h-2 w-full bg-blue-500"></div>

              <button 
                onClick={() => setIsDslModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-1.5 rounded-full transition-colors focus:outline-none"
              >
                <X size={16} />
              </button>

              <div className="p-6 md:p-8 space-y-6">
                <div>
                  <h3 className="text-2xl font-display font-bold text-white flex items-baseline gap-2">
                    Evaluación DSL: {interpolatedDslResult.distancia} m
                  </h3>
                  <p className="text-xs text-gray-500 uppercase tracking-widest font-semibold mt-1">
                    Cálculo Matemático de Enlace Esperado
                  </p>
                </div>

                {/* Métricas Principales */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Downlink Speed */}
                  <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Velocidad Max Down</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                      {interpolatedDslResult.velDown} <span className="text-xs text-gray-400 font-sans">Mbps</span>
                    </span>
                  </div>
                  {/* Uplink Speed */}
                  <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-4 flex flex-col justify-between">
                    <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Velocidad Max Up</span>
                    <span className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
                      {interpolatedDslResult.velUp} <span className="text-xs text-gray-400 font-sans">Mbps</span>
                    </span>
                  </div>
                </div>

                {/* Tabla de Parámetros Interpolados */}
                <div className="bg-[#0A0F1E] border border-white/5 rounded-2xl p-5 space-y-3 font-mono text-xs">
                  <div className="flex justify-between border-b border-white/5 pb-2 text-[10px] font-bold text-gray-500 uppercase">
                    <span>Parámetro</span>
                    <span>Valor Estimado</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Margen Ruido Down (SNR)</span>
                    <span className="text-gray-200">{interpolatedDslResult.ruidoDown} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Margen Ruido Up (SNR)</span>
                    <span className="text-gray-200">{interpolatedDslResult.ruidoUp} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Atenuación Down</span>
                    <span className="text-gray-200">{interpolatedDslResult.atenDown} dB</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400 font-sans">Atenuación Up</span>
                    <span className="text-gray-200">{interpolatedDslResult.atenUp} dB</span>
                  </div>
                </div>

                {/* Referencias del Algoritmo */}
                <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 text-xs space-y-1">
                  <h4 className="font-bold text-blue-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                    <Info size={12} /> Diagnóstico del Algoritmo
                  </h4>
                  <p className="text-gray-300 leading-relaxed font-sans mt-1">
                    {interpolatedDslResult.referencia}.
                  </p>
                  <div className="text-[10px] text-gray-500 font-sans mt-2 pt-2 border-t border-white/5">
                    Puntos de referencia físicos más cercanos en la tabla:
                    <div className="flex gap-4 mt-1 font-mono">
                      {interpolatedDslResult.puntosCercanos.map((pt, i) => (
                        <div key={i} className="text-gray-400">
                          {pt.distancia}m &rarr; Down: {pt.velDown}Mbps / Aten: {pt.atenDown}dB
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setIsDslModalOpen(false)}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2 px-5 rounded-xl transition-all text-xs active:scale-95"
                  >
                    Cerrar Diagnóstico
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
