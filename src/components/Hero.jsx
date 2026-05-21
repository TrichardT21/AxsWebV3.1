import { motion } from 'motion/react';
import { ArrowRight, Shield, Zap, Globe } from 'lucide-react';
import homeVideo from './assets/home.mp4';

export default function Hero({ onStart }) {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <video 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="absolute top-0 left-0 w-full h-full object-cover opacity-30"
        >
          <source src={homeVideo} type="video/mp4" />
        </video>
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-blue-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-blue-500/10 rounded-full blur-[120px] animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full opacity-20 bg-[radial-gradient(#ffffff10_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="inline-block py-1.5 px-4 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-semibold uppercase tracking-widest mb-6">
            Gestión de Infraestructura AXS
          </span>
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">
            Potenciando la <br />
            <span className="text-blue-500 italic">Conectividad</span> Digital
          </h1>
          <p className="text-gray-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-light leading-relaxed">
            Plataforma centralizada para el seguimiento de casos técnicos, gestión de equipos y monitorización de red de fibra óptica.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={() => onStart('registrar-caso')}
              className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 group"
            >
              Comenzar Ahora
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => onStart('ver-registros')}
              className="px-8 py-4 rounded-full font-semibold border border-white/10 hover:bg-white/5 transition-all"
            >
              Soporte Técnico
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          {[
            { icon: <Zap size={24} />, title: "Respuesta Rápida", desc: "Gestión automatizada de incidencias críticas." },
            { icon: <Shield size={24} />, title: "Seguridad Robusta", desc: "Protocolos de acceso y cifrado de datos." },
            { icon: <Globe size={24} />, title: "Red Nacional", desc: "Monitoreo en tiempo real de nodos principales." }
          ].map((feature, idx) => (
            <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all text-left">
              <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center text-blue-500 mb-4">
                {feature.icon}
              </div>
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
