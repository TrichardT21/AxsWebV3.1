import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Network, Wifi, Shield, Globe, Cpu, Copy, Check, Save, LogOut,
  RefreshCw, CheckCircle2, Calendar, Database, Eye, EyeOff, Trash2, FileText
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import registerVideo from './assets/register.mp4';
import { API_BASE } from '../config/api';

const getLocalDateString = () => {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().split('T')[0];
};

export default function ConfiguracionVdsl({ onNavigate }) {
  const { user } = useAuth();
  const [contrato, setContrato] = useState('');
  const [fecha, setFecha] = useState(getLocalDateString());
  const [nodo, setNodo] = useState('');
  const [puerto, setPuerto] = useState('');

  // Editable fields
  const [wlanPassword, setWlanPassword] = useState('');
  const [showWlanPassword, setShowWlanPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Copy feedback state
  const [copiedField, setCopiedField] = useState(null);

  // Local storage records list for this component
  const [recentConfigs, setRecentConfigs] = useState([]);

  // Auto-calculated variables
  const getContratoDigits = () => contrato.replace(/\D/g, '');
  const getNodoDigits = () => nodo.replace(/\D/g, '');

  // WLAN SSID values
  const [ssid24G, setSsid24G] = useState('');
  const [ssid5G, setSsid5G] = useState('');

  const [tipoServicio, setTipoServicio] = useState('PPPoE'); // 'PPPoE' or 'IPoE'
  const [ipPublica, setIpPublica] = useState('');
  const [puertaEnlace, setPuertaEnlace] = useState('192.168.1.1');
  const [mascaraShort, setMascaraShort] = useState('/24');
  const [remAddress, setRemAddress] = useState('');
  const [remMascara, setRemMascara] = useState('30');

  const netmaskMap = {
    '/24': '255.255.255.0',
    '/25': '255.255.255.128',
    '/26': '255.255.255.192',
    '/27': '255.255.255.224',
    '/28': '255.255.255.240',
    '/29': '255.255.255.248',
    '/30': '255.255.255.252'
  };
  const mascara = netmaskMap[mascaraShort] || '255.255.255.0';

  const remMascaraMap = {
    '30': '255.255.255.252'
  };
  const remMascaraEquiv = remMascaraMap[remMascara] || '255.255.255.252';

  const calculateGatewayFromIp = (ipStr) => {
    if (!ipStr) return '';
    const parts = ipStr.trim().split('.');
    if (parts.length === 4) {
      const lastOctet = parseInt(parts[3], 10);
      if (!isNaN(lastOctet) && lastOctet >= 0 && lastOctet < 255) {
        parts[3] = (lastOctet + 1).toString();
        return parts.join('.');
      }
    }
    return '';
  };

  const handleIpPublicaChange = (val) => {
    setIpPublica(val);
    if (tipoServicio === 'IPoE') {
      const calculated = calculateGatewayFromIp(val);
      if (calculated) {
        setPuertaEnlace(calculated);
      }
    }
  };

  // Update SSID values when contract or service type changes
  useEffect(() => {
    if (tipoServicio === 'IPoE') {
      setSsid24G('');
      setSsid5G('');
      setWlanPassword('');
    } else {
      const digits = getContratoDigits();
      setSsid24G(digits ? `vw-${digits}` : '');
      setSsid5G(digits ? `vw-${digits}_5G` : '');
    }
  }, [contrato, tipoServicio]);

  // Adjust gateway and netmask default values based on service type
  useEffect(() => {
    if (tipoServicio === 'PPPoE') {
      setPuertaEnlace('192.168.1.1');
      setMascaraShort('/24');
    } else if (tipoServicio === 'IPoE') {
      const calculated = calculateGatewayFromIp(ipPublica);
      setPuertaEnlace(calculated || '');
      setMascaraShort('/29');
    }
  }, [tipoServicio]);

  // PPPoE WAN values
  const pppoeUsuario = contrato ? `${contrato.toLowerCase()}@acelerate` : '';
  const pppoePassword = (nodo || puerto) ? `${nodo}${puerto}` : '';

  // LAN default values
  const inicioDhcp = '192.168.1.200';
  const finDhcp = '192.168.1.254';
  const [dnsPrimario, setDnsPrimario] = useState('200.105.128.41');
  const [dnsSecundario, setDnsSecundario] = useState('9.9.9.9');

  // Admin values
  const adminUsuario = 'admin';
  const adminPasswordDefecto = 'aldmt';
  const adminPassword1 = (nodo || puerto) ? `Aldmt${getNodoDigits()}${puerto}` : '';
  const adminPassword2 = (nodo || puerto) ? `aldmt${getNodoDigits()}${puerto}` : '';

  // Validations
  const isContratoValid = /^[GVA]-\d{5}$/.test(contrato);
  const isFechaValid = !!fecha;
  const isNodoValid = /^s\d{4}$/.test(nodo) || (nodo.length > 0 && !isNaN(getNodoDigits()));
  const isPuertoValid = /^\d+$/.test(puerto) && puerto.length > 0;

  useEffect(() => {
    fetchRecentConfigs();
  }, []);

  const fetchRecentConfigs = async () => {
    try {
      const response = await fetch(`${API_BASE}/obtener_vdsl.php`, { credentials: 'include' });
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setRecentConfigs(data);
        }
      }
    } catch (err) {
      console.error('Error fetching VDSL configs:', err);
    }
  };

  const handleCopy = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const generateWlanPassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*';
    let pass = '';
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setWlanPassword(pass);
  };

  const handleClear = () => {
    setContrato('');
    setNodo('');
    setPuerto('');
    setWlanPassword('');
    setSsid24G('');
    setSsid5G('');
    setFecha(getLocalDateString());
    setIpPublica('');
    setRemAddress('');
    setRemMascara('30');
    setTipoServicio('PPPoE');
  };

  const setToday = () => {
    setFecha(getLocalDateString());
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isContratoValid || !isFechaValid || !isNodoValid || !isPuertoValid) {
      alert('Por favor complete y corrija todos los campos requeridos.');
      return;
    }
    if (tipoServicio === 'IPoE' && (!ipPublica || !remAddress)) {
      alert('Por favor complete los campos de IP Pública y Dirección REM para el servicio IPoE.');
      return;
    }

    setIsSubmitting(true);

    const payload = {
      contrato,
      fecha,
      nodo,
      puerto,
      ssid_24: tipoServicio === 'IPoE' ? '' : ssid24G,
      ssid_5g: tipoServicio === 'IPoE' ? '' : ssid5G,
      wlan_password: tipoServicio === 'IPoE' ? '' : wlanPassword,
      pppoe_usuario: tipoServicio === 'IPoE' ? '' : pppoeUsuario,
      pppoe_password: tipoServicio === 'IPoE' ? '' : pppoePassword,
      puerta_enlace: puertaEnlace,
      mascara,
      inicio_dhcp: inicioDhcp,
      fin_dhcp: finDhcp,
      dns_primario: dnsPrimario,
      dns_secundario: dnsSecundario,
      admin_usuario: adminUsuario,
      admin_password_defecto: adminPasswordDefecto,
      admin_password_1: adminPassword1,
      admin_password_2: adminPassword2,
      tipo_servicio: tipoServicio,
      ip_publica: tipoServicio === 'IPoE' ? ipPublica : '',
      rem_address: tipoServicio === 'IPoE' ? remAddress : '',
      rem_mascara: tipoServicio === 'IPoE' ? remMascara : ''
    };

    try {
      const response = await fetch(`${API_BASE}/guardar_vdsl.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      const resData = await response.json();
      if (response.ok && (resData.success || !resData.error)) {
        alert(resData.message || 'Configuración VDSL guardada con éxito.');
        fetchRecentConfigs();
      } else {
        alert(resData.error || 'Error al guardar la configuración VDSL.');
      }
    } catch (err) {
      console.error('Error saving VDSL config:', err);
      alert('Error de red al conectar con el servidor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen pt-24 pb-24 px-4 w-full">
      {/* Background video decorator */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <video autoPlay loop muted playsInline className="w-full h-full object-cover opacity-20">
          <source src={registerVideo} type="video/mp4" />
        </video>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 max-w-6xl mx-auto w-full bg-[#0F172A]/85 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-10 shadow-2xl"
      >
        {/* Header */}
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500 mb-4 shadow-[0_0_20px_rgba(234,179,8,0.3)]">
            <Network size={32} />
          </div>
          <h2 className="text-3xl font-display font-bold uppercase tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500">
            Configuración VDSL
          </h2>
          <a
            href="docs/CONFIGURACION EQUIPOS XDSL.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-white/10 text-yellow-500 hover:text-yellow-400 font-semibold py-2.5 px-5 rounded-xl text-xs transition-all shadow-[0_4px_12px_rgba(0,0,0,0.2)] active:scale-[0.98]"
          >
            <FileText size={14} />
            VER PDF CONFIGURACIÓN
          </a>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">

          {/* Main Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

            {/* LEFT COLUMN: Input Fields (4 Cols) */}
            <div className="lg:col-span-4 space-y-6 bg-white/5 border border-white/10 p-6 rounded-2xl">
              <h3 className="text-sm font-semibold uppercase tracking-wider text-yellow-500 border-b border-white/10 pb-2 mb-4">
                Parámetros Base
              </h3>

              {/* Contrato */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Contrato:</label>
                  {isContratoValid && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <input
                  required
                  type="text"
                  value={contrato}
                  onChange={(e) => setContrato(e.target.value.toUpperCase())}
                  pattern="^[GVA]-\d{5}$"
                  maxLength={7}
                  placeholder="V-45236"
                  className={`w-full bg-[#0A0F1E] border ${isContratoValid ? 'border-green-500/50' : 'border-white/10'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-white font-mono placeholder:text-gray-600`}
                />
                <span className="text-[10px] text-gray-500">Formato: G-12345, V-12345, A-12345</span>
              </div>

              {/* Fecha */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Fecha:</label>
                  {isFechaValid && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <div className="flex gap-2">
                  <input
                    required
                    type="date"
                    value={fecha}
                    onChange={(e) => setFecha(e.target.value)}
                    className="flex-1 bg-[#0A0F1E] border border-white/10 rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-white font-mono"
                  />
                  <button
                    type="button"
                    onClick={setToday}
                    className="bg-white/10 hover:bg-white/20 border border-white/10 px-3 rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                  >
                    <Calendar size={13} /> HOY
                  </button>
                </div>
              </div>

              {/* Nodo */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Nodo:</label>
                  {isNodoValid && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <input
                  required
                  type="text"
                  value={nodo}
                  onChange={(e) => setNodo(e.target.value.toLowerCase())}
                  placeholder="s1523"
                  className={`w-full bg-[#0A0F1E] border ${isNodoValid ? 'border-green-500/50' : 'border-white/10'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-white font-mono placeholder:text-gray-600`}
                />
              </div>

              {/* Puerto */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-gray-400 uppercase">Puerto:</label>
                  {isPuertoValid && <CheckCircle2 size={16} className="text-green-500" />}
                </div>
                <input
                  required
                  type="text"
                  value={puerto}
                  onChange={(e) => setPuerto(e.target.value.replace(/\D/g, ''))}
                  placeholder="1552"
                  className={`w-full bg-[#0A0F1E] border ${isPuertoValid ? 'border-green-500/50' : 'border-white/10'} rounded-xl py-2.5 px-4 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 transition-all text-white font-mono placeholder:text-gray-600`}
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 text-white py-2.5 px-4 rounded-xl text-xs font-bold transition-all text-center flex items-center justify-center gap-2"
                >
                  <RefreshCw size={14} />
                  Limpiar
                </button>
              </div>
            </div>

            {/* RIGHT COLUMN: Auto-Calculated Config sections (8 Cols) */}
            <div className="lg:col-span-8 space-y-6">

              {/* Selector de Tipo de Servicio */}
              <div className="bg-white/5 border border-white/10 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-semibold uppercase tracking-wider text-yellow-500">Tipo de Servicio WAN</h4>
                  <p className="text-xs text-gray-400">Seleccione si la conexión es PPPoE (Estándar) o IPoE (IP Pública / Especial)</p>
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setTipoServicio('PPPoE')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all ${
                      tipoServicio === 'PPPoE'
                        ? 'bg-red-500/20 border-red-500 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    PPPoE (Estándar)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTipoServicio('IPoE')}
                    className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wide border transition-all ${
                      tipoServicio === 'IPoE'
                        ? 'bg-blue-500/20 border-blue-500 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.2)]'
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                  >
                    IPoE (IP Pública)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* 1. Servicio WLAN (Blue Glow) */}
                <div className={`border rounded-2xl p-5 relative group transition-all shadow-[0_4px_20px_rgba(59,130,246,0.03)] ${
                  tipoServicio === 'IPoE' 
                    ? 'border-white/5 bg-white/5 opacity-40 cursor-not-allowed select-none' 
                    : 'border-blue-500/20 bg-blue-950/10 hover:border-blue-500/40'
                }`}>
                  <span className="absolute -top-3 left-4 px-2 bg-[#0F172A] text-xs font-semibold text-blue-400 flex items-center gap-1">
                    <Wifi size={13} /> Servicio WLAN {tipoServicio === 'IPoE' && '(BLOQUEADO)'}
                  </span>

                  <div className="mt-3 space-y-3">
                    {/* SSID 2.4G */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">SSID 2.4G</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={tipoServicio === 'IPoE'}
                          value={ssid24G}
                          onChange={(e) => setSsid24G(e.target.value)}
                          placeholder={tipoServicio === 'IPoE' ? "WIFI Bloqueado para IPoE" : "vw-XXXXX"}
                          className="flex-1 bg-[#0A0F1E] border border-blue-500/20 focus:border-blue-500/50 rounded-lg py-1.5 px-3 text-xs font-mono text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          disabled={tipoServicio === 'IPoE' || !ssid24G}
                          onClick={() => handleCopy(ssid24G, 'ssid24G')}
                          className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                        >
                          {copiedField === 'ssid24G' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* SSID 5G */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">SSID 5G</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          disabled={tipoServicio === 'IPoE'}
                          value={ssid5G}
                          onChange={(e) => setSsid5G(e.target.value)}
                          placeholder={tipoServicio === 'IPoE' ? "WIFI Bloqueado para IPoE" : "vw-XXXXX_5G"}
                          className="flex-1 bg-[#0A0F1E] border border-blue-500/20 focus:border-blue-500/50 rounded-lg py-1.5 px-3 text-xs font-mono text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <button
                          type="button"
                          disabled={tipoServicio === 'IPoE' || !ssid5G}
                          onClick={() => handleCopy(ssid5G, 'ssid5G')}
                          className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                        >
                          {copiedField === 'ssid5G' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>

                    {/* Contraseña */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Contraseña WLAN</label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <input
                            type={showWlanPassword ? 'text' : 'password'}
                            disabled={tipoServicio === 'IPoE'}
                            value={wlanPassword}
                            onChange={(e) => setWlanPassword(e.target.value)}
                            placeholder={tipoServicio === 'IPoE' ? "WIFI Bloqueado" : "Ingrese o genere clave"}
                            className="w-full bg-[#0A0F1E] border border-white/10 rounded-lg py-1.5 px-3 pr-8 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <button
                            type="button"
                            disabled={tipoServicio === 'IPoE'}
                            onClick={() => setShowWlanPassword(!showWlanPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 disabled:opacity-30"
                          >
                            {showWlanPassword ? <EyeOff size={13} /> : <Eye size={13} />}
                          </button>
                        </div>
                        <button
                          type="button"
                          disabled={tipoServicio === 'IPoE'}
                          onClick={generateWlanPassword}
                          className="px-2 py-1 bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 text-[10px] font-bold rounded border border-blue-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          Generar
                        </button>
                        <button
                          type="button"
                          disabled={tipoServicio === 'IPoE' || !wlanPassword}
                          onClick={() => handleCopy(wlanPassword, 'wlanPassword')}
                          className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                        >
                          {copiedField === 'wlanPassword' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. WAN Configuration (Red Glow for PPPoE, Blue Glow for IPoE) */}
                <div className={`border rounded-2xl p-5 relative group transition-colors shadow-[0_4px_20px_rgba(0,0,0,0.05)] ${
                  tipoServicio === 'PPPoE'
                    ? 'border-red-500/20 bg-red-950/10 hover:border-red-500/40 shadow-[0_4px_20px_rgba(239,68,68,0.03)]'
                    : 'border-blue-500/20 bg-blue-950/10 hover:border-blue-500/40 shadow-[0_4px_20px_rgba(59,130,246,0.03)]'
                }`}>
                  <span className={`absolute -top-3 left-4 px-2 bg-[#0F172A] text-xs font-semibold flex items-center gap-1 ${
                    tipoServicio === 'PPPoE' ? 'text-red-400' : 'text-blue-400'
                  }`}>
                    <Globe size={13} /> {tipoServicio === 'PPPoE' ? 'PPPoE WAN' : 'IPoE WAN (IP Pública)'}
                  </span>

                  <div className="mt-3 space-y-3">
                    {tipoServicio === 'PPPoE' ? (
                      <>
                        {/* Usuario */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Usuario PPPoE</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={pppoeUsuario}
                              placeholder="x-XXXXX@acelerate"
                              className="flex-1 bg-[#0A0F1E] border border-red-500/20 rounded-lg py-1.5 px-3 text-xs font-mono text-red-300"
                            />
                            <button
                              type="button"
                              disabled={!pppoeUsuario}
                              onClick={() => handleCopy(pppoeUsuario, 'pppoeUsuario')}
                              className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                            >
                              {copiedField === 'pppoeUsuario' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* Contraseña */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">Contraseña PPPoE</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value={pppoePassword}
                              placeholder="Calculada (nodo + puerto)"
                              className="flex-1 bg-[#0A0F1E] border border-red-500/20 rounded-lg py-1.5 px-3 text-xs font-mono text-red-300"
                            />
                            <button
                              type="button"
                              disabled={!pppoePassword}
                              onClick={() => handleCopy(pppoePassword, 'pppoePassword')}
                              className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                            >
                              {copiedField === 'pppoePassword' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* MTU */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">MTU</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value="1488"
                              className="flex-1 bg-[#0A0F1E] border border-red-500/20 rounded-lg py-1.5 px-3 text-xs font-mono text-red-300"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopy('1488', 'mtu')}
                              className="p-1.5 bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0"
                            >
                              {copiedField === 'mtu' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <>
                        {/* IP Pública */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">IP Pública</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required={tipoServicio === 'IPoE'}
                              value={ipPublica}
                              onChange={(e) => handleIpPublicaChange(e.target.value)}
                              placeholder="Ej: 200.105.211.120"
                              className="flex-1 bg-[#0A0F1E] border border-blue-500/20 focus:border-blue-500/50 rounded-lg py-1.5 px-3 text-xs font-mono text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              disabled={!ipPublica}
                              onClick={() => handleCopy(ipPublica, 'ipPublica')}
                              className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                            >
                              {copiedField === 'ipPublica' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* REM Address */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">REM Address (IP REM)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              required={tipoServicio === 'IPoE'}
                              value={remAddress}
                              onChange={(e) => setRemAddress(e.target.value)}
                              placeholder="Ej: 10.89.x.y"
                              className="flex-1 bg-[#0A0F1E] border border-blue-500/20 focus:border-blue-500/50 rounded-lg py-1.5 px-3 text-xs font-mono text-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                            <button
                              type="button"
                              disabled={!remAddress}
                              onClick={() => handleCopy(remAddress, 'remAddress')}
                              className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0 disabled:opacity-30"
                            >
                              {copiedField === 'remAddress' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>

                        {/* MASK RA */}
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wide">MASK RA (Mascara REM)</label>
                          <div className="flex gap-2">
                            <input
                              type="text"
                              readOnly
                              value="30 (255.255.255.252)"
                              className="flex-1 bg-[#0A0F1E]/50 border border-blue-500/10 rounded-lg py-1.5 px-3 text-xs font-mono text-blue-300/80 cursor-default"
                            />
                            <button
                              type="button"
                              onClick={() => handleCopy('30 (255.255.255.252)', 'remMascara')}
                              className="p-1.5 bg-white/5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-300 rounded border border-white/10 transition-all flex items-center justify-center shrink-0"
                            >
                              {copiedField === 'remMascara' ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                            </button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* 3. Servicio LAN (Light Blue Glow) */}
                <div className="border border-sky-500/20 bg-sky-950/10 rounded-2xl p-5 relative group hover:border-sky-500/40 transition-colors shadow-[0_4px_20px_rgba(14,165,233,0.03)] md:col-span-2">
                  <span className="absolute -top-3 left-4 px-2 bg-[#0F172A] text-xs font-semibold text-sky-400 flex items-center gap-1">
                    <Cpu size={13} /> Servicio LAN
                  </span>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {/* Puerta enlace */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Puerta de Enlace</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          readOnly={tipoServicio === 'PPPoE'}
                          value={puertaEnlace}
                          onChange={(e) => setPuertaEnlace(e.target.value)}
                          className="w-full bg-[#0A0F1E]/50 border border-sky-500/20 focus:border-sky-500/50 rounded px-2.5 py-1 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button type="button" onClick={() => handleCopy(puertaEnlace, 'puertaEnlace')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Máscara */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Máscara de Red</label>
                      <div className="flex gap-1.5">
                        {tipoServicio === 'PPPoE' ? (
                          <input
                            type="text"
                            readOnly
                            value={`${mascaraShort} (${mascara})`}
                            className="w-full bg-[#0A0F1E]/50 border border-sky-500/10 rounded px-2.5 py-1 text-xs font-mono text-sky-300/80 cursor-default"
                          />
                        ) : (
                          <select
                            value={mascaraShort}
                            onChange={(e) => setMascaraShort(e.target.value)}
                            className="w-full bg-[#0A0F1E] border border-sky-500/20 focus:border-sky-500/50 rounded px-2 py-1 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                          >
                            <option value="/24" className="bg-[#0F172A]">/24 ({netmaskMap['/24']})</option>
                            <option value="/25" className="bg-[#0F172A]">/25 ({netmaskMap['/25']})</option>
                            <option value="/26" className="bg-[#0F172A]">/26 ({netmaskMap['/26']})</option>
                            <option value="/27" className="bg-[#0F172A]">/27 ({netmaskMap['/27']})</option>
                            <option value="/28" className="bg-[#0F172A]">/28 ({netmaskMap['/28']})</option>
                            <option value="/29" className="bg-[#0F172A]">/29 ({netmaskMap['/29']})</option>
                            <option value="/30" className="bg-[#0F172A]">/30 ({netmaskMap['/30']})</option>
                          </select>
                        )}
                        <button type="button" onClick={() => handleCopy(mascara, 'mascara')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Inicio DHCP */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Inicio DHCP</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={inicioDhcp} className="w-full bg-[#0A0F1E]/50 border border-sky-500/10 rounded px-2.5 py-1 text-xs font-mono text-sky-300" />
                        <button type="button" onClick={() => handleCopy(inicioDhcp, 'inicioDhcp')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Fin DHCP */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Fin DHCP</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={finDhcp} className="w-full bg-[#0A0F1E]/50 border border-sky-500/10 rounded px-2.5 py-1 text-xs font-mono text-sky-300/80 cursor-default" />
                        <button type="button" onClick={() => handleCopy(finDhcp, 'finDhcp')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* DNS Primario */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">DNS Primario</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={dnsPrimario}
                          onChange={(e) => setDnsPrimario(e.target.value)}
                          className="w-full bg-[#0A0F1E]/50 border border-sky-500/25 rounded px-2.5 py-1 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button type="button" onClick={() => handleCopy(dnsPrimario, 'dnsPrimario')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* DNS Secundario */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">DNS Secundario</label>
                      <div className="flex gap-1.5">
                        <input
                          type="text"
                          value={dnsSecundario}
                          onChange={(e) => setDnsSecundario(e.target.value)}
                          className="w-full bg-[#0A0F1E]/50 border border-sky-500/25 rounded px-2.5 py-1 text-xs font-mono text-sky-300 focus:outline-none focus:ring-1 focus:ring-sky-500"
                        />
                        <button type="button" onClick={() => handleCopy(dnsSecundario, 'dnsSecundario')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-sky-500/20 text-gray-400 hover:text-sky-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* DNS Suggestions */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 pt-3 border-t border-white/5">
                      <span className="text-[9px] font-bold text-gray-500 uppercase tracking-wider block mb-2">Sugerencias DNS (Clic para aplicar):</span>
                      <div className="flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => { setDnsPrimario('200.105.128.41'); setDnsSecundario('200.105.128.40'); }}
                          className="text-[10px] bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/20 rounded-md py-1 px-2 text-sky-300 font-mono transition-all"
                        >
                          AXS (200.105.128.41 / .40)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDnsPrimario('1.1.1.1'); setDnsSecundario('1.0.0.1'); }}
                          className="text-[10px] bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/20 rounded-md py-1 px-2 text-sky-300 font-mono transition-all"
                        >
                          Cloudflare (1.1.1.1 / 1.0.0.1)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDnsPrimario('8.8.8.8'); setDnsSecundario('8.8.4.4'); }}
                          className="text-[10px] bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/20 rounded-md py-1 px-2 text-sky-300 font-mono transition-all"
                        >
                          Google (8.8.8.8 / 8.8.4.4)
                        </button>
                        <button
                          type="button"
                          onClick={() => { setDnsPrimario('9.9.9.9'); setDnsSecundario('149.112.112.112'); }}
                          className="text-[10px] bg-sky-950/40 hover:bg-sky-900/60 border border-sky-500/20 rounded-md py-1 px-2 text-sky-300 font-mono transition-all"
                        >
                          Quad9 (9.9.9.9 / 149.112.112.112)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Gestión Administrador (Green Glow) */}
                <div className="border border-green-500/20 bg-green-950/10 rounded-2xl p-5 relative group hover:border-green-500/40 transition-colors shadow-[0_4px_20px_rgba(34,197,94,0.03)] md:col-span-2">
                  <span className="absolute -top-3 left-4 px-2 bg-[#0F172A] text-xs font-semibold text-green-400 flex items-center gap-1">
                    <Shield size={13} /> Gestión Administrador
                  </span>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Usuario */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Usuario Admin</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={adminUsuario} className="w-full bg-[#0A0F1E]/50 border border-green-500/10 rounded px-2.5 py-1 text-xs font-mono text-green-300/80 cursor-default" />
                        <button type="button" onClick={() => handleCopy(adminUsuario, 'adminUsuario')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-green-500/20 text-gray-400 hover:text-green-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Por defecto */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Pass por Defecto</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={adminPasswordDefecto} className="w-full bg-[#0A0F1E]/50 border border-green-500/10 rounded px-2.5 py-1 text-xs font-mono text-green-300/80 cursor-default" />
                        <button type="button" onClick={() => handleCopy(adminPasswordDefecto, 'adminPasswordDefecto')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-green-500/20 text-gray-400 hover:text-green-300"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Contraseña (1) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Contraseña (1)</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={adminPassword1} placeholder="Calculada..." className="w-full bg-[#0A0F1E]/50 border border-green-500/15 rounded px-2.5 py-1 text-xs font-mono text-green-300" />
                        <button type="button" disabled={!adminPassword1} onClick={() => handleCopy(adminPassword1, 'adminPassword1')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-green-500/20 text-gray-400 hover:text-green-300 disabled:opacity-30"><Copy size={11} /></button>
                      </div>
                    </div>

                    {/* Contraseña (2) */}
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-gray-500 uppercase tracking-wider">Contraseña (2)</label>
                      <div className="flex gap-1.5">
                        <input type="text" readOnly value={adminPassword2} placeholder="Calculada..." className="w-full bg-[#0A0F1E]/50 border border-green-500/10 rounded px-2.5 py-1 text-xs font-mono text-green-300/80 cursor-default" />
                        <button type="button" disabled={!adminPassword2} onClick={() => handleCopy(adminPassword2, 'adminPassword2')} className="p-1 bg-white/5 rounded border border-white/10 hover:bg-green-500/20 text-gray-400 hover:text-green-300 disabled:opacity-30"><Copy size={11} /></button>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* Form Actions */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              disabled={isSubmitting || !isContratoValid || !isNodoValid || !isPuertoValid}
              type="submit"
              className="w-full sm:w-auto min-w-[200px] bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-400 hover:to-amber-500 text-slate-950 font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 shadow-lg shadow-yellow-500/10 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Save size={18} />
              {isSubmitting ? 'REGISTRANDO...' : 'REGISTRAR CONFIGURACIÓN'}
            </button>
            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="w-full sm:w-auto min-w-[150px] bg-slate-800 hover:bg-slate-700 text-white font-bold py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-3 border border-white/10 active:scale-[0.98]"
            >
              <LogOut size={18} />
              SALIR
            </button>
          </div>

        </form>

        {/* Recent VDSL Configurations Table */}
        <div className="mt-16 space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Database className="text-yellow-500" size={24} />
              <h3 className="text-xl font-display font-bold text-white">Historial de Configuración VDSL</h3>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={fetchRecentConfigs}
                className="p-1.5 hover:bg-white/5 rounded-lg border border-white/5 text-gray-400 hover:text-white transition-all"
              >
                <RefreshCw size={14} />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto bg-white/5 border border-white/5 rounded-2xl">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-5 py-4 font-semibold text-gray-400">Contrato</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Nodo</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Puerto</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">SSID 2.4G / 5G</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Tipo / Detalles Servicio</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Clave Admin (1)</th>
                  <th className="px-5 py-4 font-semibold text-gray-400">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-white">
                {recentConfigs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-8 text-center text-gray-500 italic">
                      No hay configuraciones VDSL registradas.
                    </td>
                  </tr>
                ) : (
                  recentConfigs.map((cfg, i) => (
                    <tr key={i} className="hover:bg-white/5 transition-colors">
                      <td className="px-5 py-4 font-bold text-yellow-500 font-mono">{cfg.contrato}</td>
                      <td className="px-5 py-4 text-gray-300 font-mono">{cfg.nodo}</td>
                      <td className="px-5 py-4 text-gray-300 font-mono">{cfg.puerto}</td>
                      <td className="px-5 py-4">
                        {cfg.tipo_servicio === 'IPoE' ? (
                          <span className="text-xs text-gray-500 italic">No Aplica (WIFI Bloqueado)</span>
                        ) : (
                          <>
                            <div className="text-[11px] font-mono text-blue-300">{cfg.ssid_24}</div>
                            <div className="text-[11px] font-mono text-blue-400/80">{cfg.ssid_5g}</div>
                          </>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        {cfg.tipo_servicio === 'IPoE' ? (
                          <div className="space-y-1">
                            <span className="inline-block bg-blue-500/20 text-blue-300 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                              IPoE (IP Pública)
                            </span>
                            <div className="text-[11px] font-mono text-gray-300">
                              <span className="text-gray-500">IP:</span> {cfg.ip_publica}
                            </div>
                            <div className="text-[11px] font-mono text-gray-300">
                              <span className="text-gray-500">REM:</span> {cfg.rem_address} ({cfg.rem_mascara ? `/${cfg.rem_mascara}` : '30'})
                            </div>
                            <div className="text-[11px] font-mono text-gray-300">
                              <span className="text-gray-500">GW:</span> {cfg.puerta_enlace} ({cfg.mascara})
                            </div>
                          </div>
                        ) : (
                          <div className="space-y-1">
                            <span className="inline-block bg-red-500/20 text-red-300 text-[10px] font-bold px-1.5 py-0.5 rounded mb-1">
                              PPPoE
                            </span>
                            <div className="text-[11px] font-mono text-red-300">
                              <span className="text-gray-500">U:</span> {cfg.pppoe_usuario}
                            </div>
                            <div className="text-[11px] font-mono text-red-400/80">
                              <span className="text-gray-500">P:</span> {cfg.pppoe_password}
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-green-300 font-mono text-[11px]">{cfg.admin_password_1}</td>
                      <td className="px-5 py-4 text-gray-500 font-mono text-xs">{cfg.fecha}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </motion.div>
    </div>
  );
}
