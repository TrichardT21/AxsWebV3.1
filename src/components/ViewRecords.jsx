import { motion } from 'motion/react';
import { Filter, Download, Monitor, ClipboardList, Eye, ShieldAlert, ArrowLeft, User, Database, Edit, Trash2, Save, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import SearchResultsModal from './SearchResultsModal';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../config/api';

export default function ViewRecords() {
  const { user, viewingTechnicianId, viewingTechnicianName, stopViewingAsTechnician } = useAuth();
  const [personalOnly, setPersonalOnly] = useState(false);
  const [equipos, setEquipos] = useState([]);
  const [casos, setCasos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filters
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [filterEquipos, setFilterEquipos] = useState('all'); 
  // 'all', 'contrato', 'bodega', 'casa', 'tormenta'
  
  // Case Details Modal
  const [selectedCase, setSelectedCase] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Pagination
  const [currentPageEquipos, setCurrentPageEquipos] = useState(1);
  const [currentPageCasos, setCurrentPageCasos] = useState(1);
  const itemsPerPage = 25;

  // Edit Equipment States
  const [editingEquipo, setEditingEquipo] = useState(null);
  const [eqEstado, setEqEstado] = useState('');
  const [eqUbicacion, setEqUbicacion] = useState('');
  const [eqContrato, setEqContrato] = useState('');
  const [eqFechaRegistro, setEqFechaRegistro] = useState('');
  const [eqObservaciones, setEqObservaciones] = useState('');

  // Edit Case States
  const [editingCaso, setEditingCaso] = useState(null);
  const [cContrato, setCContrato] = useState('');
  const [cFecha, setCFecha] = useState('');
  const [cHoraInicio, setCHoraInicio] = useState('');
  const [cHoraFin, setCHoraFin] = useState('');
  const [cIncidencia, setCIncidencia] = useState('');
  const [cDiagnostico, setCDiagnostico] = useState('');
  const [cSolucion, setCSolucion] = useState('');
  const [cAfRecogido, setCAfRecogido] = useState('');
  const [cModeloRecogido, setCModeloRecogido] = useState('');
  const [cSerieAntigua, setCSerieAntigua] = useState('');
  const [cEstadoRecogido, setCEstadoRecogido] = useState('Funcional');
  const [cAfInstalado, setCAfInstalado] = useState('');
  const [cModeloInstalado, setCModeloInstalado] = useState('');
  const [cSerieNueva, setCSerieNueva] = useState('');
  const [cEstadoInstalado, setCEstadoInstalado] = useState('Nuevo');
  const [cVelEthDown, setCVelEthDown] = useState(0);
  const [cVelEthUp, setCVelEthUp] = useState(0);
  const [cVelWifi24Down, setCVelWifi24Down] = useState(0);
  const [cVelWifi24Up, setCVelWifi24Up] = useState(0);
  const [cVelWifi5Down, setCVelWifi5Down] = useState(0);
  const [cVelWifi5Up, setCVelWifi5Up] = useState(0);
  const [cObservaciones, setCObservaciones] = useState('');
  const [cEstado, setCEstado] = useState('');

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams();
      if (user?.rol === 'admin') {
        if (viewingTechnicianId) {
          queryParams.append('tecnico_id', viewingTechnicianId.toString());
        } else if (personalOnly) {
          queryParams.append('personal', 'true');
        }
      }

      const qs = queryParams.toString() ? `?${queryParams.toString()}` : '';
      const [casosRes, equiposRes] = await Promise.all([
        fetch(`${API_BASE}/obtener_casos.php${qs}`, { credentials: 'include' }),
        fetch(`${API_BASE}/obtener_equipos.php${qs}`, { credentials: 'include' })
      ]);
      
      const dataCasos = await casosRes.json();
      const dataEquipos = await equiposRes.json();
      
      if (Array.isArray(dataCasos)) setCasos(dataCasos);
      if (Array.isArray(dataEquipos)) setEquipos(dataEquipos);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [user, viewingTechnicianId, personalOnly]);

  // Populate Edit Equipment Form
  useEffect(() => {
    if (editingEquipo) {
      setEqEstado(editingEquipo.estado || 'Nuevo');
      setEqUbicacion(editingEquipo.ubicacion || 'Mi gabeta (Bodega)');
      setEqContrato(editingEquipo.contrato || '');
      setEqFechaRegistro(editingEquipo.fecha_registro || '');
      setEqObservaciones(editingEquipo.observaciones || '');
    }
  }, [editingEquipo]);

  // Populate Edit Case Form
  useEffect(() => {
    if (editingCaso) {
      setCContrato(editingCaso.contrato || '');
      setCFecha(editingCaso.fecha || '');
      setCHoraInicio(editingCaso.hora_inicio || '');
      setCHoraFin(editingCaso.hora_fin || '');
      setCIncidencia(editingCaso.incidencia || '');
      setCDiagnostico(editingCaso.diagnostico || '');
      setCSolucion(editingCaso.solucion || '');
      setCAfRecogido(editingCaso.af_recogido || '');
      setCModeloRecogido(editingCaso.modelo_recogido || '');
      setCSerieAntigua(editingCaso.serie_antigua || '');
      setCEstadoRecogido(editingCaso.estado_recogido || 'Funcional');
      setCAfInstalado(editingCaso.af_instalado || '');
      setCModeloInstalado(editingCaso.modelo_instalado || '');
      setCSerieNueva(editingCaso.serie_nueva || '');
      setCEstadoInstalado(editingCaso.estado_instalado || 'Nuevo');
      setCVelEthDown(editingCaso.velocidad_eth_down || 0);
      setCVelEthUp(editingCaso.velocidad_eth_up || 0);
      setCVelWifi24Down(editingCaso.velocidad_wifi24_down || 0);
      setCVelWifi24Up(editingCaso.velocidad_wifi24_up || 0);
      setCVelWifi5Down(editingCaso.velocidad_wifi5_down || 0);
      setCVelWifi5Up(editingCaso.velocidad_wifi5_up || 0);
      setCObservaciones(editingCaso.observaciones || '');
      setCEstado(editingCaso.estado || '');
    }
  }, [editingCaso]);

  const handleSaveEquipo = async (e) => {
    e.preventDefault();
    if (!editingEquipo) return;
    try {
      const response = await fetch(`${API_BASE}/actualizar_equipo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEquipo.id,
          estado: eqEstado,
          ubicacion: eqUbicacion,
          contrato: eqUbicacion === 'Contrato' ? eqContrato : '',
          fecha_registro: eqFechaRegistro,
          observaciones: eqObservaciones
        }),
        credentials: 'include'
      });
      const res = await response.json();
      if (res.success) {
        alert('Equipo actualizado correctamente');
        setEditingEquipo(null);
        fetchData();
      } else {
        alert('Error al actualizar: ' + (res.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  };

  const handleSaveCaso = async (e) => {
    e.preventDefault();
    if (!editingCaso) return;
    try {
      const response = await fetch(`${API_BASE}/actualizar_caso.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingCaso.id,
          contrato: cContrato,
          fecha: cFecha,
          hora_inicio: cHoraInicio || null,
          hora_fin: cHoraFin || null,
          incidencia: cIncidencia,
          diagnostico: cDiagnostico,
          solucion: cSolucion,
          af_recogido: cAfRecogido,
          modelo_recogido: cModeloRecogido,
          serie_antigua: cSerieAntigua,
          estado_recogido: cEstadoRecogido,
          af_instalado: cAfInstalado,
          modelo_instalado: cModeloInstalado,
          serie_nueva: cSerieNueva,
          estado_instalado: cEstadoInstalado,
          velocidad_eth_down: cVelEthDown,
          velocidad_eth_up: cVelEthUp,
          velocidad_wifi24_down: cVelWifi24Down,
          velocidad_wifi24_up: cVelWifi24Up,
          velocidad_wifi5_down: cVelWifi5Down,
          velocidad_wifi5_up: cVelWifi5Up,
          observaciones: cObservaciones,
          estado: cEstado
        }),
        credentials: 'include'
      });
      const res = await response.json();
      if (res.success) {
        alert('Caso actualizado correctamente');
        setEditingCaso(null);
        fetchData();
      } else {
        alert('Error al actualizar: ' + (res.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteEquipo = async (id, af) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el equipo con AF ${af}?`)) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/eliminar_equipo.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      const res = await response.json();
      if (res.success) {
        alert('Equipo eliminado con éxito');
        fetchData();
      } else {
        alert('Error al eliminar: ' + (res.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  };

  const handleDeleteCaso = async (id) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el caso con ID ${id}?`)) {
      return;
    }
    try {
      const response = await fetch(`${API_BASE}/eliminar_caso.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
        credentials: 'include'
      });
      const res = await response.json();
      if (res.success) {
        alert('Caso eliminado con éxito');
        fetchData();
      } else {
        alert('Error al eliminar: ' + (res.error || 'Error desconocido'));
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión con el servidor');
    }
  };

  const getFilteredEquipos = () => {
    const filtered = equipos.filter(e => {
      const isTormenta = e.estado?.toUpperCase() === 'DAÑADO POR TORMENTA' || 
                         e.estado?.toUpperCase() === 'DAÑADO TORMENTA' || 
                         (e.estado && e.estado.toUpperCase().includes('TORMENTA'));
                         
      if (filterEquipos === 'all') return true;
      if (filterEquipos === 'tormenta') return isTormenta;
      
      if (filterEquipos === 'contrato') {
        return (e.ubicacion === 'Contrato' || e.ubicacion?.toLowerCase().includes('contrato')) && !isTormenta;
      }
      if (filterEquipos === 'bodega') {
        return (e.ubicacion === 'Mi gabeta (Bodega)' || e.ubicacion?.toLowerCase().includes('bodega') || e.ubicacion?.toLowerCase().includes('gabeta')) && !isTormenta;
      }
      if (filterEquipos === 'casa') {
        return (e.ubicacion === 'En Casa' || e.ubicacion?.toLowerCase().includes('casa')) && !isTormenta;
      }
      if (filterEquipos === 'devuelto') {
        return (e.ubicacion === 'Devuelto Equipo' || e.ubicacion?.toLowerCase().includes('devuelto')) && !isTormenta;
      }
      
      return true;
    });

    // Ordenar por modelo
    return [...filtered].sort((a, b) => {
      const modA = (a.modelo || '').toString().toUpperCase();
      const modB = (b.modelo || '').toString().toUpperCase();
      return modA.localeCompare(modB);
    });
  };

  const filteredEquipos = getFilteredEquipos();
  const paginatedEquipos = filteredEquipos.slice((currentPageEquipos - 1) * itemsPerPage, currentPageEquipos * itemsPerPage);
  
  const paginatedCasos = casos.slice((currentPageCasos - 1) * itemsPerPage, currentPageCasos * itemsPerPage);

  // When filter changes, reset equipos page to 1
  useEffect(() => {
    setCurrentPageEquipos(1);
  }, [filterEquipos]);

  const renderPagination = (currentPage, totalItems, onPageChange) => {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    if (totalPages <= 1) return null;

    const pages = [];
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <div className="flex items-center gap-1.5 sm:gap-2">
        <button 
          onClick={() => onPageChange(currentPage - 1)} 
          disabled={currentPage === 1}
          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        
        {startPage > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-md transition-colors">1</button>
            {startPage > 2 && <span className="text-gray-600 px-1">...</span>}
          </>
        )}

        {pages.map(page => (
          <button 
            key={page}
            onClick={() => onPageChange(page)}
            className={`px-3 py-1.5 text-xs rounded-md transition-colors ${currentPage === page ? 'bg-blue-600 text-white font-bold' : 'text-gray-400 hover:text-white hover:bg-white/10 border border-white/10'}`}
          >
            {page}
          </button>
        ))}

        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && <span className="text-gray-600 px-1">...</span>}
            <button onClick={() => onPageChange(totalPages)} className="px-3 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-md transition-colors">{totalPages}</button>
          </>
        )}

        <button 
          onClick={() => onPageChange(currentPage + 1)} 
          disabled={currentPage === totalPages}
          className="px-2.5 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-white/10 border border-white/10 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    );
  };

  const getFilterLabel = () => {
    switch(filterEquipos) {
      case 'all': return 'Mostrar todo';
      case 'contrato': return 'Equipos en contrato';
      case 'bodega': return 'Equipos en bodega';
      case 'casa': return 'Equipos en casa';
      case 'tormenta': return 'Equipos dañados por tormenta';
      case 'devuelto': return 'Equipos devueltos';
      default: return 'Filtrar';
    }
  };

  const handleExportExcel = () => {
    // Filter equipments
    const eqBodega = equipos.filter(e => e.ubicacion === 'Mi gabeta (Bodega)' && e.estado !== 'Dañado por tormenta' && e.estado !== 'Dañado tormenta');
    const eqContrato = equipos.filter(e => e.ubicacion === 'Contrato' && e.estado !== 'Dañado por tormenta' && e.estado !== 'Dañado tormenta');
    const eqEnCasa = equipos.filter(e => e.ubicacion === 'En Casa' && e.estado !== 'Dañado por tormenta' && e.estado !== 'Dañado tormenta');
    const eqDevueltos = equipos.filter(e => e.ubicacion === 'Devuelto Equipo' && e.estado !== 'Dañado por tormenta' && e.estado !== 'Dañado tormenta');
    
    const eqDanadosBodega = equipos.filter(e => (e.estado?.toUpperCase().includes('TORMENTA')) && e.ubicacion === 'Mi gabeta (Bodega)');
    const eqDanadosContrato = equipos.filter(e => (e.estado?.toUpperCase().includes('TORMENTA')) && e.ubicacion === 'Contrato');
    const eqDanadosCasa = equipos.filter(e => (e.estado?.toUpperCase().includes('TORMENTA')) && e.ubicacion === 'En Casa');
    
    const totalDanadosTormenta = eqDanadosBodega.length + eqDanadosContrato.length + eqDanadosCasa.length;

    let content = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
<head>
    <meta charset="UTF-8">
    <title>Reporte AXS Completo</title>
    <style>
        th { background-color: #2c7be5; color: white; }
        .total { font-weight: bold; background-color: #e9ecef; }
        .danado { background-color: #f8d7da; color: #721c24; }
    </style>
</head>
<body>`;

    // HOJA 1: EQUIPOS EN BODEGA
    content += `<div><h2>📦 EQUIPOS EN BODEGA</h2>`;
    content += `<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
    eqBodega.forEach(equipo => {
        content += `<tr>`;
        content += `<td>${equipo.af || ''}</td>`;
        content += `<td>${equipo.modelo || ''}</td>`;
        content += `<td>${equipo.serie || '-'}</td>`;
        content += `<td>${equipo.estado || ''}</td>`;
        content += `<td>${equipo.ubicacion || ''}</td>`;
        content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
        content += `<td>${equipo.fecha_registro || ''}</td>`;
        content += `<td>${equipo.observaciones || ''}</td>`;
        content += `</tr>`;
    });
    content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>${eqBodega.length}</strong></td></tr></tfoot></table></div>`;
    content += `<br clear="all" style="page-break-before: always;">`;

    // HOJA 2: EQUIPOS EN CONTRATO
    content += `<div><h2>📄 EQUIPOS EN CONTRATO</h2>`;
    content += `<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
    eqContrato.forEach(equipo => {
        content += `<tr>`;
        content += `<td>${equipo.af || ''}</td>`;
        content += `<td>${equipo.modelo || ''}</td>`;
        content += `<td>${equipo.serie || '-'}</td>`;
        content += `<td>${equipo.estado || ''}</td>`;
        content += `<td>${equipo.ubicacion || ''}</td>`;
        content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
        content += `<td>${equipo.fecha_registro || ''}</td>`;
        content += `<td>${equipo.observaciones || ''}</td>`;
        content += `</tr>`;
    });
    content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>${eqContrato.length}</strong></td></tr></tfoot></table></div>`;
    content += `<br clear="all" style="page-break-before: always;">`;

    // HOJA 3: EQUIPOS EN CASA
    content += `<div><h2>🏠 EQUIPOS EN CASA</h2>`;
    content += `<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
    eqEnCasa.forEach(equipo => {
        content += `<tr>`;
        content += `<td>${equipo.af || ''}</td>`;
        content += `<td>${equipo.modelo || ''}</td>`;
        content += `<td>${equipo.serie || '-'}</td>`;
        content += `<td>${equipo.estado || ''}</td>`;
        content += `<td>${equipo.ubicacion || ''}</td>`;
        content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
        content += `<td>${equipo.fecha_registro || ''}</td>`;
        content += `<td>${equipo.observaciones || ''}</td>`;
        content += `</tr>`;
    });
    content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>${eqEnCasa.length}</strong></td></tr></tfoot></table></div>`;
    content += `<br clear="all" style="page-break-before: always;">`;

    // HOJA 3b: EQUIPOS DEVUELTOS
    content += `<div><h2>↩️ EQUIPOS DEVUELTOS</h2>`;
    content += `<table border="1" cellpadding="5" cellspacing="0"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
    eqDevueltos.forEach(equipo => {
        content += `<tr>`;
        content += `<td>${equipo.af || ''}</td>`;
        content += `<td>${equipo.modelo || ''}</td>`;
        content += `<td>${equipo.serie || '-'}</td>`;
        content += `<td>${equipo.estado || ''}</td>`;
        content += `<td>${equipo.ubicacion || ''}</td>`;
        content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
        content += `<td>${equipo.fecha_registro || ''}</td>`;
        content += `<td>${equipo.observaciones || ''}</td>`;
        content += `</tr>`;
    });
    content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL:</strong></td><td><strong>${eqDevueltos.length}</strong></td></tr></tfoot></table></div>`;
    content += `<br clear="all" style="page-break-before: always;">`;

    // HOJA 4: EQUIPOS DAÑADOS POR TORMENTA
    content += `<div><h2>⚡ EQUIPOS DAÑADOS POR TORMENTA</h2>`;
    
    if (eqDanadosBodega.length > 0) {
        content += `<h3>📦 En Bodega</h3>`;
        content += `<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
        eqDanadosBodega.forEach(equipo => {
            content += `<tr>`;
            content += `<td>${equipo.af || ''}</td>`;
            content += `<td>${equipo.modelo || ''}</td>`;
            content += `<td>${equipo.serie || '-'}</td>`;
            content += `<td><strong>⚡ ${equipo.estado || ''}</strong></td>`;
            content += `<td>${equipo.ubicacion || ''}</td>`;
            content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
            content += `<td>${equipo.fecha_registro || ''}</td>`;
            content += `<td>${equipo.observaciones || ''}</td>`;
            content += `</tr>`;
        });
        content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN BODEGA:</strong></td><td><strong>${eqDanadosBodega.length}</strong></td></tr></tfoot></table>`;
    }
    
    if (eqDanadosContrato.length > 0) {
        content += `<h3>📄 En Contrato</h3>`;
        content += `<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
        eqDanadosContrato.forEach(equipo => {
            content += `<tr>`;
            content += `<td>${equipo.af || ''}</td>`;
            content += `<td>${equipo.modelo || ''}</td>`;
            content += `<td>${equipo.serie || '-'}</td>`;
            content += `<td><strong>⚡ ${equipo.estado || ''}</strong></td>`;
            content += `<td>${equipo.ubicacion || ''}</td>`;
            content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
            content += `<td>${equipo.fecha_registro || ''}</td>`;
            content += `<td>${equipo.observaciones || ''}</td>`;
            content += `</tr>`;
        });
        content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CONTRATO:</strong></td><td><strong>${eqDanadosContrato.length}</strong></td></tr></tfoot></table>`;
    }
    
    if (eqDanadosCasa.length > 0) {
        content += `<h3>🏠 En Casa</h3>`;
        content += `<table border="1" cellpadding="5" cellspacing="0" class="danado"><thead><tr><th>AF</th><th>Modelo</th><th>Serie</th><th>Estado</th><th>Ubicación</th><th>Contrato</th><th>Fecha Registro</th><th>Observaciones</th></tr></thead><tbody>`;
        eqDanadosCasa.forEach(equipo => {
            content += `<tr>`;
            content += `<td>${equipo.af || ''}</td>`;
            content += `<td>${equipo.modelo || ''}</td>`;
            content += `<td>${equipo.serie || '-'}</td>`;
            content += `<td><strong>⚡ ${equipo.estado || ''}</strong></td>`;
            content += `<td>${equipo.ubicacion || ''}</td>`;
            content += `<td>${equipo.contrato || 'Sin asignar'}</td>`;
            content += `<td>${equipo.fecha_registro || ''}</td>`;
            content += `<td>${equipo.observaciones || ''}</td>`;
            content += `</tr>`;
        });
        content += `</tbody><tfoot><tr class="total"><td colspan="7"><strong>TOTAL EN CASA:</strong></td><td><strong>${eqDanadosCasa.length}</strong></td></tr></tfoot></table>`;
    }
    
    if (totalDanadosTormenta === 0) {
        content += `<p>No hay equipos dañados por tormenta registrados.</p>`;
    }
    
    content += `<br clear="all" style="page-break-before: always;">`;

    // HOJA 5: CASOS
    content += `<div><h2>📋 CASOS REGISTRADOS</h2>`;
    content += `<table border="1" cellpadding="5" cellspacing="0" style="font-size: 10px;"><thead><tr>`;
    content += `<th>ID</th><th>Contrato</th><th>Fecha</th><th>Hora</th><th>Incidencia</th>`;
    content += `<th>Diagnóstico</th><th>Solución</th>`;
    content += `<th>AF Recogido</th><th>Modelo Recogido</th><th>Serie Antigua</th>`;
    content += `<th>Estado Recogido</th><th>AF Instalado</th><th>Modelo Instalado</th><th>Serie Nueva</th><th>Estado Instalado</th>`;
    content += `<th>Vel. ETH</th><th>Vel. 2.4G</th><th>Vel. 5G</th><th>Observaciones</th><th>Estado</th><th>Fecha Reg.</th>`;
    content += `</tr></thead><tbody>`;
    
    casos.forEach(caso => {
        let hora = caso.hora_inicio || '--:--';
        if (caso.hora_fin) hora += ' - ' + caso.hora_fin;
        content += `<tr>`;
        content += `<td>${caso.id || ''}</td>`;
        content += `<td>${caso.contrato || ''}</td>`;
        content += `<td>${caso.fecha || ''}</td>`;
        content += `<td>${hora}</td>`;
        content += `<td>${caso.incidencia || '-'}</td>`;
        content += `<td>${(caso.diagnostico || '-').substring(0, 150)}</td>`;
        content += `<td>${(caso.solucion || '-').substring(0, 150)}</td>`;
        content += `<td>${caso.af_recogido || '-'}</td>`;
        content += `<td>${caso.modelo_recogido || '-'}</td>`;
        content += `<td>${caso.serie_antigua || '-'}</td>`;
        content += `<td>${caso.estado_recogido || '-'}</td>`;
        content += `<td>${caso.af_instalado || '-'}</td>`;
        content += `<td>${caso.modelo_instalado || '-'}</td>`;
        content += `<td>${caso.serie_nueva || '-'}</td>`;
        content += `<td>${caso.estado_instalado || '-'}</td>`;
        content += `<td>${caso.velocidad_eth_down || 0}/${caso.velocidad_eth_up || 0}</td>`;
        content += `<td>${caso.velocidad_wifi24_down || 0}/${caso.velocidad_wifi24_up || 0}</td>`;
        content += `<td>${caso.velocidad_wifi5_down || 0}/${caso.velocidad_wifi5_up || 0}</td>`;
        content += `<td>${(caso.observaciones || '-').substring(0, 100)}</td>`;
        content += `<td>${caso.estado || '-'}</td>`;
        content += `<td>${caso.fecha_registro || ''}</td>`;
        content += `</tr>`;
    });
    content += `</tbody><tfoot><tr class="total"><td colspan="20"><strong>TOTAL CASOS:</strong></td><td><strong>${casos.length}</strong></td></tr></table></tfoot></table></div>`;
    content += `</body></html>`;

    // Download file
    const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `reporte_axs_${viewingTechnicianId ? 'tecnico' : personalOnly ? 'personal' : 'completo'}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4 max-w-[95%] mx-auto w-full">
      {/* Banner de Modo Inspección */}
      {viewingTechnicianId && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg shadow-amber-500/5 select-none"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="shrink-0 animate-pulse text-amber-500" size={20} />
            <div className="text-xs">
              <span className="font-bold">MODO INSPECCIÓN TÉCNICO:</span> Actualmente visualizando el historial y stock de <span className="font-bold text-white underline">{viewingTechnicianName}</span>.
            </div>
          </div>
          <button
            onClick={stopViewingAsTechnician}
            className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold py-2 px-4 rounded-xl text-[10px] uppercase tracking-wider transition-all active:scale-[0.98] shadow-md shadow-amber-500/15"
          >
            <ArrowLeft size={12} /> VOLVER A PANEL ADMIN
          </button>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4"
      >
        <div className="space-y-3">
          <div>
            <h2 className="text-3xl font-display font-bold">
              {viewingTechnicianId 
                ? `Registros de ${viewingTechnicianName}` 
                : personalOnly 
                  ? 'Mis Registros Personales' 
                  : 'Registros del Sistema'}
            </h2>
            <p className="text-gray-400 mt-1 text-xs">
              {viewingTechnicianId 
                ? 'Inspección aislada de equipos y casos del técnico.' 
                : 'Historial completo de equipos y casos registrados.'}
            </p>
          </div>

          {/* Selector de Filtro de Administrador (Vista Global vs Vista Personal) */}
          {user?.rol === 'admin' && !viewingTechnicianId && (
            <div className="flex items-center gap-1.5 bg-white/5 border border-white/10 p-1 rounded-xl w-fit">
              <button
                onClick={() => setPersonalOnly(false)}
                className={`py-1.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${!personalOnly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Vista Global
              </button>
              <button
                onClick={() => setPersonalOnly(true)}
                className={`py-1.5 px-4 rounded-lg font-bold text-[10px] uppercase tracking-wider transition-all ${personalOnly ? 'bg-blue-600 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
              >
                Mis Registros
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          <button onClick={handleExportExcel} className="flex items-center gap-2 bg-blue-600/20 border border-blue-500/30 px-5 py-2.5 rounded-xl text-xs hover:bg-blue-600/30 transition-all text-blue-400 font-bold uppercase tracking-wider">
            <Download size={15} /> Exportar Excel {viewingTechnicianId ? 'Técnico' : personalOnly ? 'Personal' : 'Completo'}
          </button>
        </div>
      </motion.div>

      {/* EQUIPOS SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-500/10 rounded-lg border border-blue-500/20 text-blue-400">
              <Monitor size={22} />
            </div>
            <h3 className="text-2xl font-bold text-white">Equipos Registrados</h3>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setShowFilterMenu(!showFilterMenu)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-lg text-sm hover:bg-white/10 transition-all text-gray-200"
            >
              <Filter size={16} /> {getFilterLabel()}
            </button>
            
            {showFilterMenu && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-[#0A0F1E] border border-white/10 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
                <button onClick={() => { setFilterEquipos('all'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'all' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>1. Mostrar todo</button>
                <button onClick={() => { setFilterEquipos('contrato'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'contrato' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>2. Equipos en contrato</button>
                <button onClick={() => { setFilterEquipos('bodega'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'bodega' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>3. Equipos en bodega</button>
                <button onClick={() => { setFilterEquipos('casa'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'casa' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>4. Equipos en casa</button>
                <button onClick={() => { setFilterEquipos('devuelto'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'devuelto' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>5. Equipos devueltos</button>
                <button onClick={() => { setFilterEquipos('tormenta'); setShowFilterMenu(false); }} className={`w-full text-left px-4 py-2.5 text-sm hover:bg-white/5 transition-colors ${filterEquipos === 'tormenta' ? 'text-blue-400 bg-white/5 font-bold' : 'text-gray-300'}`}>6. Equipos dañados por tormenta</button>
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-5 py-4 font-semibold text-gray-400">AF</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Modelo</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Serie</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Estado</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Ubicación</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Contrato</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Fecha Registro</th>
                  <th className="px-5 py-4 font-semibold text-gray-400 max-w-[200px]">Observaciones</th>
                  <th className="px-5 py-4 font-semibold text-gray-400 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400">Cargando equipos...</td></tr>
                ) : filteredEquipos.length === 0 ? (
                  <tr><td colSpan={9} className="px-6 py-8 text-center text-gray-400">No hay equipos registrados para este filtro.</td></tr>
                ) : (
                  paginatedEquipos.map((eq) => (
                    <tr key={eq.id} className="hover:bg-white/5 transition-colors text-gray-300">
                      <td className="px-5 py-3 font-mono font-medium text-white">{eq.af}</td>
                      <td className="px-5 py-3">{eq.modelo}</td>
                      <td className="px-5 py-3 font-mono">{eq.serie || '-'}</td>
                      <td className="px-5 py-3">
                        {eq.estado && eq.estado.toUpperCase().includes('TORMENTA') ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20">
                            ⚡ {eq.estado.toUpperCase()}
                          </span>
                        ) : (
                          <span className="text-gray-200 font-medium">{eq.estado}</span>
                        )}
                      </td>
                      <td className="px-5 py-3">{eq.ubicacion}</td>
                      <td className="px-5 py-3">{eq.contrato || 'Sin asignar'}</td>
                      <td className="px-5 py-3 text-gray-500">{eq.fecha_registro}</td>
                      <td className="px-5 py-3 truncate max-w-[200px]" title={eq.observaciones}>{eq.observaciones || ''}</td>
                      <td className="px-5 py-3 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => setEditingEquipo(eq)}
                            className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/30 rounded-md transition-all bg-blue-500/10"
                            title="Editar Equipo"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteEquipo(eq.id, eq.af)}
                            className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/30 rounded-md transition-all bg-red-500/10"
                            title="Eliminar Equipo"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              Mostrando {Math.min((currentPageEquipos - 1) * itemsPerPage + 1, filteredEquipos.length)} a {Math.min(currentPageEquipos * itemsPerPage, filteredEquipos.length)} de {filteredEquipos.length} equipos
            </span>
            {renderPagination(currentPageEquipos, filteredEquipos.length, setCurrentPageEquipos)}
          </div>
        </div>
      </motion.div>

      {/* CASOS SECTION */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-purple-500/10 rounded-lg border border-purple-500/20 text-purple-400">
            <ClipboardList size={22} />
          </div>
          <h3 className="text-2xl font-bold text-white">Casos Registrados</h3>
        </div>

        <div className="bg-[#0F172A] border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="bg-white/5 border-b border-white/10">
                  <th className="px-5 py-4 font-semibold text-gray-400">ID</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Contrato</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Fecha</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Hora</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Incidencia</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Diagnóstico</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Solución</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">AF Recogido</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">AF Instalado</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Velocidades (ETH | 2.4 | 5G)</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Estado</th>
                  <th className="px-5 py-4 font-semibold text-gray-400 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {isLoading ? (
                  <tr><td colSpan={12} className="px-6 py-8 text-center text-gray-400">Cargando casos...</td></tr>
                ) : casos.length === 0 ? (
                  <tr><td colSpan={12} className="px-6 py-8 text-center text-gray-400">No hay casos registrados.</td></tr>
                ) : (
                  paginatedCasos.map((caso) => {
                    const hora = caso.hora_inicio ? `${caso.hora_inicio.substring(0,5)} ${caso.hora_fin ? '- '+caso.hora_fin.substring(0,5) : ''}` : '--:--';
                    const vel = `${caso.velocidad_eth_down||0}/${caso.velocidad_eth_up||0} | ${caso.velocidad_wifi24_down||0}/${caso.velocidad_wifi24_up||0} | ${caso.velocidad_wifi5_down||0}/${caso.velocidad_wifi5_up||0}`;
                    
                    return (
                      <tr key={caso.id} className="hover:bg-white/5 transition-colors text-gray-300">
                        <td className="px-5 py-3 font-mono font-medium text-white">{caso.id}</td>
                        <td className="px-5 py-3 font-bold text-gray-200">{caso.contrato}</td>
                        <td className="px-5 py-3">{caso.fecha}</td>
                        <td className="px-5 py-3 text-gray-400">{hora}</td>
                        <td className="px-5 py-3 text-red-400 max-w-[150px] truncate" title={caso.incidencia}>{caso.incidencia || '-'}</td>
                        <td className="px-5 py-3 max-w-[200px] truncate" title={caso.diagnostico}>{caso.diagnostico || '-'}</td>
                        <td className="px-5 py-3 max-w-[200px] truncate" title={caso.solucion}>{caso.solucion || '-'}</td>
                        <td className="px-5 py-3 font-mono text-red-300">{caso.af_recogido || '-'}</td>
                        <td className="px-5 py-3 font-mono text-green-300">{caso.af_instalado || '-'}</td>
                        <td className="px-5 py-3 text-gray-400">{vel}</td>
                        <td className="px-5 py-3 font-bold text-blue-400">{caso.estado || '-'}</td>
                        <td className="px-5 py-3 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button 
                              onClick={() => {
                                setSelectedCase(caso);
                                setIsModalOpen(true);
                              }}
                              className="p-1.5 text-gray-400 hover:text-white hover:bg-white/10 rounded-md transition-all bg-white/5 border border-white/10"
                              title="Ver Detalles"
                            >
                              <Eye size={15} />
                            </button>
                            <button 
                              onClick={() => setEditingCaso(caso)}
                              className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600/20 border border-blue-500/30 rounded-md transition-all bg-blue-500/10"
                              title="Editar Caso"
                            >
                              <Edit size={15} />
                            </button>
                            <button 
                              onClick={() => handleDeleteCaso(caso.id)}
                              className="p-1.5 text-red-400 hover:text-white hover:bg-red-600/20 border border-red-500/30 rounded-md transition-all bg-red-500/10"
                              title="Eliminar Caso"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="px-6 py-4 border-t border-white/5 bg-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <span className="text-xs text-gray-500 uppercase tracking-widest">
              Mostrando {Math.min((currentPageCasos - 1) * itemsPerPage + 1, casos.length)} a {Math.min(currentPageCasos * itemsPerPage, casos.length)} de {casos.length} casos
            </span>
            {renderPagination(currentPageCasos, casos.length, setCurrentPageCasos)}
          </div>
        </div>
      </motion.div>
      
      {/* CASE DETAILS MODAL */}
      <SearchResultsModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        directCaso={selectedCase} 
      />

      {/* MODAL EDITAR EQUIPO */}
      {editingEquipo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D1A]/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-lg shadow-2xl relative"
          >
            <button
              onClick={() => setEditingEquipo(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display">
              <Edit className="text-blue-500" size={20} /> Editar Equipo AF: <span className="text-blue-400 font-mono">{editingEquipo.af}</span>
            </h3>
            
            <form onSubmit={handleSaveEquipo} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Modelo</label>
                <input type="text" disabled value={editingEquipo.modelo} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-gray-500 text-sm cursor-not-allowed font-medium" />
              </div>
              
              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Serie</label>
                <input type="text" disabled value={editingEquipo.serie || '-'} className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-gray-500 text-sm cursor-not-allowed font-mono" />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado</label>
                <select
                  value={eqEstado}
                  onChange={(e) => setEqEstado(e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Nuevo">Nuevo</option>
                  <option value="Funcional">Funcional</option>
                  <option value="Dañado por tormenta">Dañado por tormenta</option>
                  <option value="Dañado">Dañado</option>
                  <option value="Para revision">Para revisión</option>
                  <option value="Descontinuado">Descontinuado</option>
                  <option value="Obsoleto">Obsoleto</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Ubicación</label>
                <select
                  value={eqUbicacion}
                  onChange={(e) => setEqUbicacion(e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Mi gabeta (Bodega)">Mi gabeta (Bodega)</option>
                  <option value="Contrato">Contrato</option>
                  <option value="En Casa">En Casa</option>
                  <option value="Devuelto Equipo">Devuelto Equipo</option>
                </select>
              </div>

              {eqUbicacion === 'Contrato' && (
                <div>
                  <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Número de Contrato</label>
                  <input
                    required
                    type="text"
                    value={eqContrato}
                    onChange={(e) => setEqContrato(e.target.value)}
                    placeholder="Ej. C123456"
                    className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Fecha de Registro</label>
                <input
                  type="date"
                  value={eqFechaRegistro}
                  onChange={(e) => setEqFechaRegistro(e.target.value)}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block mb-1">Observaciones</label>
                <textarea
                  value={eqObservaciones}
                  onChange={(e) => setEqObservaciones(e.target.value)}
                  rows={3}
                  className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-gray-600"
                  placeholder="Detalles del equipo..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setEditingEquipo(null)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-600/20"
                >
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* MODAL EDITAR CASO */}
      {editingCaso && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090D1A]/80 backdrop-blur-sm p-4 overflow-y-auto select-none">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#0F172A] border border-white/10 rounded-2xl p-6 w-full max-w-4xl shadow-2xl relative max-h-[90vh] flex flex-col"
          >
            <button
              onClick={() => setEditingCaso(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
            >
              <X size={20} />
            </button>
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2 font-display">
              <Edit className="text-purple-500" size={20} /> Editar Caso ID: <span className="text-purple-400 font-mono">{editingCaso.id}</span>
            </h3>
            
            <form onSubmit={handleSaveCaso} className="space-y-6 overflow-y-auto pr-2 flex-1 scrollbar-thin">
              
              {/* Sección 1: Información General */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">1. Información General</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Número de Contrato</label>
                    <input
                      required
                      type="text"
                      value={cContrato}
                      onChange={(e) => setCContrato(e.target.value)}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Fecha</label>
                    <input
                      required
                      type="date"
                      value={cFecha}
                      onChange={(e) => setCFecha(e.target.value)}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Hora Inicio</label>
                      <input
                        type="time"
                        value={cHoraInicio}
                        onChange={(e) => setCHoraInicio(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Hora Fin</label>
                      <input
                        type="time"
                        value={cHoraFin}
                        onChange={(e) => setCHoraFin(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 2: Incidencia y Solución */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">2. Incidencia, Diagnóstico y Solución</h4>
                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Incidencia</label>
                    <input
                      type="text"
                      value={cIncidencia}
                      onChange={(e) => setCIncidencia(e.target.value)}
                      placeholder="Ej. Cambio de equipo"
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Diagnóstico</label>
                      <textarea
                        value={cDiagnostico}
                        onChange={(e) => setCDiagnostico(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Solución</label>
                      <textarea
                        value={cSolucion}
                        onChange={(e) => setCSolucion(e.target.value)}
                        rows={3}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 3: Equipos Involucrados */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">3. Equipos Involucrados</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Recogido */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                    <h5 className="text-[10px] font-bold text-red-400 uppercase tracking-widest">Equipo Recogido</h5>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">AF Recogido</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={cAfRecogido}
                        onChange={(e) => setCAfRecogido(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Modelo</label>
                        <input
                          type="text"
                          value={cModeloRecogido}
                          onChange={(e) => setCModeloRecogido(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Serie</label>
                        <input
                          type="text"
                          value={cSerieAntigua}
                          onChange={(e) => setCSerieAntigua(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado</label>
                      <select
                        value={cEstadoRecogido}
                        onChange={(e) => setCEstadoRecogido(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-red-500"
                      >
                        <option value="Funcional">Funcional</option>
                        <option value="Dañado por tormenta">Dañado por tormenta</option>
                        <option value="Dañado">Dañado</option>
                      </select>
                    </div>
                  </div>

                  {/* Instalado */}
                  <div className="bg-white/5 border border-white/10 p-4 rounded-xl space-y-3">
                    <h5 className="text-[10px] font-bold text-green-400 uppercase tracking-widest">Equipo Instalado</h5>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">AF Instalado</label>
                      <input
                        type="text"
                        maxLength={8}
                        value={cAfInstalado}
                        onChange={(e) => setCAfInstalado(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Modelo</label>
                        <input
                          type="text"
                          value={cModeloInstalado}
                          onChange={(e) => setCModeloInstalado(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                        />
                      </div>
                      <div>
                        <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Serie</label>
                        <input
                          type="text"
                          value={cSerieNueva}
                          onChange={(e) => setCSerieNueva(e.target.value)}
                          className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500 font-mono"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[9px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado</label>
                      <select
                        value={cEstadoInstalado}
                        onChange={(e) => setCEstadoInstalado(e.target.value)}
                        className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500"
                      >
                        <option value="Nuevo">Nuevo</option>
                        <option value="Funcional">Funcional</option>
                      </select>
                    </div>
                  </div>

                </div>
              </div>

              {/* Sección 4: Velocidades */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">4. Pruebas de Velocidad (Mbps)</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-white/5 p-3 border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block font-sans">Cable Ethernet</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" placeholder="Down" value={cVelEthDown} onChange={(e) => setCVelEthDown(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                      <input type="number" step="0.01" placeholder="Up" value={cVelEthUp} onChange={(e) => setCVelEthUp(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block font-sans">WiFi 2.4 GHz</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" placeholder="Down" value={cVelWifi24Down} onChange={(e) => setCVelWifi24Down(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                      <input type="number" step="0.01" placeholder="Up" value={cVelWifi24Up} onChange={(e) => setCVelWifi24Up(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                    </div>
                  </div>
                  <div className="bg-white/5 p-3 border border-white/10 rounded-xl space-y-2">
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 block font-sans">WiFi 5.0 GHz</span>
                    <div className="grid grid-cols-2 gap-2">
                      <input type="number" step="0.01" placeholder="Down" value={cVelWifi5Down} onChange={(e) => setCVelWifi5Down(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                      <input type="number" step="0.01" placeholder="Up" value={cVelWifi5Up} onChange={(e) => setCVelWifi5Up(parseFloat(e.target.value)||0)} className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2 px-3 text-white text-xs font-mono" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sección 5: Estado y Observaciones */}
              <div>
                <h4 className="text-xs font-bold text-blue-400 mb-3 border-b border-white/10 pb-1.5 uppercase tracking-widest">5. Estado Final</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Estado del Caso</label>
                    <select
                      value={cEstado}
                      onChange={(e) => setCEstado(e.target.value)}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Pendiente">Pendiente</option>
                      <option value="Solucionado">Solucionado</option>
                      <option value="En Curso">En Curso</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider block mb-1">Observaciones</label>
                    <textarea
                      value={cObservaciones}
                      onChange={(e) => setCObservaciones(e.target.value)}
                      rows={2}
                      className="w-full bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingCaso(null)}
                  className="bg-white/5 border border-white/10 hover:bg-white/10 text-gray-300 font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-2.5 px-5 rounded-xl text-xs uppercase tracking-wider transition-colors flex items-center gap-1.5 shadow-lg shadow-purple-600/20"
                >
                  <Save size={14} /> Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
