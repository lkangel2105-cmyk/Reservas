import React, { useState } from 'react';
import {
  BookOpen,
  Calendar,
  Clock,
  Database,
  Layers,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
  CheckCircle2,
  AlertTriangle,
  Send,
  Zap,
  Cpu,
  ChevronRight,
  Copy,
  Check,
  FileText,
  Sliders
} from 'lucide-react';

interface ServiceItem {
  id: string;
  name: string;
  category: 'manicure' | 'pedicure' | 'complement';
  durationMin: number;
  bufferMin: number;
  stationType: 'manicure_desk' | 'pedicure_chair';
  requiresSpecialistSkill: string;
  allowSimultaneousWithOpposite: boolean;
  basePrice: number;
}

const SERVICES_CATALOG: ServiceItem[] = [
  { id: 'mani_basic', name: 'Manicure Básico Tradicional', category: 'manicure', durationMin: 40, bufferMin: 10, stationType: 'manicure_desk', requiresSpecialistSkill: 'basic_nail', allowSimultaneousWithOpposite: true, basePrice: 22 },
  { id: 'mani_spa', name: 'Manicure Spa Exfoliante & Hidratante', category: 'manicure', durationMin: 60, bufferMin: 15, stationType: 'manicure_desk', requiresSpecialistSkill: 'spa_treatments', allowSimultaneousWithOpposite: true, basePrice: 35 },
  { id: 'mani_gel', name: 'Manicure Ruso con Esmaltado Semipermanente (Gel)', category: 'manicure', durationMin: 75, bufferMin: 15, stationType: 'manicure_desk', requiresSpecialistSkill: 'gel_polish', allowSimultaneousWithOpposite: true, basePrice: 45 },
  { id: 'mani_acrylic_new', name: 'Uñas Acrílicas Esculpidas (Set Completo)', category: 'manicure', durationMin: 120, bufferMin: 20, stationType: 'manicure_desk', requiresSpecialistSkill: 'acrylic_sculpting', allowSimultaneousWithOpposite: false, basePrice: 65 },
  { id: 'mani_acrylic_refill', name: 'Mantenimiento / Retoque Acrílico', category: 'manicure', durationMin: 90, bufferMin: 15, stationType: 'manicure_desk', requiresSpecialistSkill: 'acrylic_sculpting', allowSimultaneousWithOpposite: false, basePrice: 45 },
  { id: 'pedi_basic', name: 'Pedicure Clínico Básico', category: 'pedicure', durationMin: 45, bufferMin: 15, stationType: 'pedicure_chair', requiresSpecialistSkill: 'basic_pedi', allowSimultaneousWithOpposite: true, basePrice: 28 },
  { id: 'pedi_spa', name: 'Pedicure Spa Jelly & Mascarilla Térmica', category: 'pedicure', durationMin: 75, bufferMin: 20, stationType: 'pedicure_chair', requiresSpecialistSkill: 'spa_treatments', allowSimultaneousWithOpposite: true, basePrice: 48 },
  { id: 'pedi_gel', name: 'Pedicure Spa con Esmaltado Semipermanente', category: 'pedicure', durationMin: 90, bufferMin: 15, stationType: 'pedicure_chair', requiresSpecialistSkill: 'gel_polish', allowSimultaneousWithOpposite: true, basePrice: 55 },
  { id: 'rem_acrylic', name: 'Retiro Seguro de Sistema Acrílico / GelX', category: 'complement', durationMin: 35, bufferMin: 10, stationType: 'manicure_desk', requiresSpecialistSkill: 'removal', allowSimultaneousWithOpposite: true, basePrice: 15 },
  { id: 'rem_gel', name: 'Retiro de Esmalte Semipermanente', category: 'complement', durationMin: 20, bufferMin: 5, stationType: 'manicure_desk', requiresSpecialistSkill: 'removal', allowSimultaneousWithOpposite: true, basePrice: 10 },
  { id: 'nail_art_simple', name: 'Nail Art Francés / Minimalista (10 uñas)', category: 'complement', durationMin: 20, bufferMin: 5, stationType: 'manicure_desk', requiresSpecialistSkill: 'nail_art', allowSimultaneousWithOpposite: false, basePrice: 12 },
  { id: 'nail_art_advanced', name: 'Nail Art 3D / Cristales / Mano Alzada', category: 'complement', durationMin: 45, bufferMin: 10, stationType: 'manicure_desk', requiresSpecialistSkill: 'advanced_art', allowSimultaneousWithOpposite: false, basePrice: 25 },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'srs' | 'simulator' | 'api' | 'db'>('srs');
  const [copied, setCopied] = useState(false);

  // Simulator state
  const [selectedServices, setSelectedServices] = useState<string[]>(['mani_gel', 'pedi_spa']);
  const [executionMode, setExecutionMode] = useState<'sequential' | 'simultaneous'>('simultaneous');

  const handleToggleService = (id: string) => {
    setSelectedServices(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectedItems = SERVICES_CATALOG.filter(s => selectedServices.includes(s.id));
  
  // Calculate duration metrics
  const hasMani = selectedItems.some(s => s.category === 'manicure' || s.stationType === 'manicure_desk');
  const hasPedi = selectedItems.some(s => s.category === 'pedicure' || s.stationType === 'pedicure_chair');
  const canSimultaneous = hasMani && hasPedi && selectedItems.every(s => s.allowSimultaneousWithOpposite || s.category === 'complement');

  let totalServiceTime = 0;
  let totalBufferTime = 0;
  let requiredSpecialists = 1;

  if (executionMode === 'simultaneous' && canSimultaneous) {
    requiredSpecialists = 2;
    const maniTime = selectedItems
      .filter(s => s.category === 'manicure' || s.category === 'complement')
      .reduce((acc, curr) => acc + curr.durationMin, 0);
    const pediTime = selectedItems
      .filter(s => s.category === 'pedicure')
      .reduce((acc, curr) => acc + curr.durationMin, 0);
    totalServiceTime = Math.max(maniTime, pediTime);
    totalBufferTime = 20; // Parallel sanitization buffer max
  } else {
    requiredSpecialists = 1;
    totalServiceTime = selectedItems.reduce((acc, curr) => acc + curr.durationMin, 0);
    totalBufferTime = selectedItems.reduce((acc, curr) => acc + curr.bufferMin, 0);
  }

  const totalPrice = selectedItems.reduce((acc, curr) => acc + curr.basePrice, 0);

  const copyMarkdown = () => {
    navigator.clipboard.writeText(SRS_MARKDOWN_EXPORT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-pink-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-4 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-pink-500 to-rose-400 flex items-center justify-center shadow-lg shadow-pink-500/20 text-white font-black text-lg">
            💅
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-white tracking-tight">NailSalon Engine</h1>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 font-medium">
                SRS & Arch v1.0
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Especificación de Requerimientos y Diseño de Sistema para Salón de Manicure & Pedicure
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60 text-xs">
          <button
            onClick={() => setActiveTab('srs')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'srs'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Especificación SRS
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'simulator'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Simulador de Tiempos & Buffers
          </button>
          <button
            onClick={() => setActiveTab('db')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'db'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Modelo Relacional (DDL)
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center gap-1.5 ${
              activeTab === 'api'
                ? 'bg-pink-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            API RESTful Endpoints
          </button>
        </div>

        {/* Quick action button */}
        <button
          onClick={copyMarkdown}
          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? '¡Copiado al portapapeles!' : 'Copiar SRS Completo (MD)'}
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 lg:p-8">
        {/* TAB 1: FULL SRS DOCUMENTATION */}
        {activeTab === 'srs' && (
          <div className="space-y-8 animate-fadeIn">
            {/* Banner summary */}
            <div className="rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-pink-950/20 to-slate-900 border border-pink-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-pink-400 font-bold">Documento Arquitectónico</span>
                <h2 className="text-2xl font-black text-white mt-1">Especificación de Requerimientos de Software (SRS)</h2>
                <p className="text-sm text-slate-300 mt-1 max-w-3xl">
                  Diseño de arquitectura técnica determinista para plataforma web y móvil de agendamiento automatizado,
                  especializado en salón de uñas (Manicure y Pedicure), con cálculo de slot, buffers sanitarios y locking transaccional.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Anti-Double Booking
                </span>
                <span className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-pink-500/10 text-pink-400 border border-pink-500/30">
                  <Zap className="w-3.5 h-3.5" /> A 4 Manos Engine
                </span>
              </div>
            </div>

            {/* Quick summary grid of the 6 pillars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                  <Users className="w-4 h-4" /> 1. Requerimientos Modulares
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Panel Cliente (PWA/Mobile), Panel Especialista (Agenda & turnos) y Panel Admin (Métricas, inventario de cabinas, staff).
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
                  <Clock className="w-4 h-4" /> 2. Catálogo & Reglas de Buffer
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Buffers de 5 a 20 min obligatorios para autoclave, desinfección UV y ventilación de químicos monómeros.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                  <Database className="w-4 h-4" /> 3. PostgreSQL & Locks
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Constraints `EXCLUDE USING gist` sobre `tstzrange` para garantía matemática de cero colisiones horarias.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
                  <Calendar className="w-4 h-4" /> 4. Flujo & HOLD Temporal
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Reserva con lock temporal (TTL 10 min en Redis) durante checkout, webhooks WhatsApp Cloud API y confirmación.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
                  <Server className="w-4 h-4" /> 5. Endpoints RESTful
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Rutas con validación estricta Zod/JSON Schema, idempotency keys en pagos y respuestas estructuradas RFC 7807.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
                <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                  <Cpu className="w-4 h-4" /> 6. Stack & Escalabilidad
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Node.js/Fastify o NestJS, PostgreSQL administrado, Redis BullMQ para tareas en segundo plano y CDN Cloudflare.
                </p>
              </div>
            </div>

            {/* In-depth Sections */}
            <div className="space-y-6 text-slate-300">
              {/* Section 1 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-black">1</span>
                  Requerimientos Funcionales y No Funcionales
                </h3>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-bold text-pink-400 flex items-center gap-1.5">
                      <Users className="w-4 h-4" /> Panel Cliente (Móvil & Web)
                    </h4>
                    <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                      <li>Autenticación por OTP móvil (WhatsApp/SMS) o Google OAuth con perfil instantáneo.</li>
                      <li>Selector de servicios multinivel (Servicio principal + Retiro previo + Nail Art adicional).</li>
                      <li>Algoritmo de preferencia: Selección de especialista favorita o opción "Cualquiera disponible".</li>
                      <li>Opción de servicio simultáneo "A 4 manos" (Manicure + Pedicure al mismo tiempo).</li>
                      <li>Calendario reactivo de disponibilidad en tiempo real con granularidad de 15 minutos.</li>
                      <li>Checkout con bloqueo temporal (10 min) y pago de anticipo/seña o pago en salón.</li>
                      <li>Gestión de citas activas: Cancelación o reprogramación con ventana límite de 12 horas.</li>
                      <li>Historial de citas con ficha de tonalidad/colores y fotos del resultado previo.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-bold text-rose-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Panel Especialista
                    </h4>
                    <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                      <li>Vista diaria/semanal en formato agenda con desglose visual de tiempo de servicio vs buffer.</li>
                      <li>Check-in de cita: Transición de estados (En Espera → En Proceso → Finalizado → No-Show).</li>
                      <li>Bloqueo manual de indisponibilidad (pausas personales, capacitaciones o licencias).</li>
                      <li>Visualización de notas técnicas del cliente (ej. uñas quebradizas, alergia al látex).</li>
                      <li>Liquidación y cálculo automático de comisiones por servicio y venta de productos.</li>
                    </ul>
                  </div>

                  <div className="space-y-3 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    <h4 className="text-sm font-bold text-purple-400 flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4" /> Panel Administrador
                    </h4>
                    <ul className="text-xs space-y-2 list-disc list-inside text-slate-300">
                      <li>Matriz de configuración de estaciones físicas (Puestos de Manicure vs Sillones Spa Pedicure).</li>
                      <li>Gestión de matriz de habilidades por especialista (matriz de certificación técnica).</li>
                      <li>Overbooking prevention & reglas de penalización por inasistencia (No-Show).</li>
                      <li>Reportes operacionales: Tasa de ocupación de sillones, ticket promedio y horas valle.</li>
                      <li>Gestión de campañas de recordatorio masivo vía WhatsApp Business Cloud API.</li>
                    </ul>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-xl bg-slate-950/80 border border-slate-800">
                  <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Requerimientos No Funcionales (SLA & Arquitectura)</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block font-mono">Disponibilidad (SLA):</span>
                      <strong className="text-white">99.9% Uptime</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Latencia de Slots:</span>
                      <strong className="text-white">&lt; 150ms P95</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Concurrencia:</span>
                      <strong className="text-white">Pessimistic Redis Lock (TTL 600s)</strong>
                    </div>
                    <div>
                      <span className="text-slate-400 block font-mono">Cumplimiento:</span>
                      <strong className="text-white">GDPR & Tokenización PCI-DSS</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2 */}
              <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
                <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                  <span className="w-7 h-7 rounded-lg bg-pink-500/20 text-pink-400 flex items-center justify-center text-sm font-black">2</span>
                  Catálogo de Servicios y Reglas de Negocio Operativas
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed">
                  En un salón de uñas, el tiempo ocupado por cita no es solo la aplicación estética. La sanitización de cubetas,
                  esterilización de instrumental en autoclave grado médico y la evaporación de vapores de monómeros exigen un
                  <strong> Buffer Obligatorio Inamovible</strong>. Además, la simultaneidad requiere que la estación física (sillón spa)
                  tenga espacio ergonómico para que dos especialistas trabajen en paralelo.
                </p>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-700 bg-slate-800/60 text-slate-200">
                        <th className="py-2.5 px-3 font-semibold">Servicio</th>
                        <th className="py-2.5 px-3 font-semibold">Categoría</th>
                        <th className="py-2.5 px-3 font-semibold">Duración Neta</th>
                        <th className="py-2.5 px-3 font-semibold">Buffer Limpieza</th>
                        <th className="py-2.5 px-3 font-semibold">Estación Fisiológica</th>
                        <th className="py-2.5 px-3 font-semibold">Simultáneo Permitido</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 text-slate-300 font-mono text-[11px]">
                      {SERVICES_CATALOG.map((serv) => (
                        <tr key={serv.id} className="hover:bg-slate-800/30">
                          <td className="py-2 px-3 font-sans font-medium text-white">{serv.name}</td>
                          <td className="py-2 px-3 capitalize">{serv.category}</td>
                          <td className="py-2 px-3 text-pink-400 font-bold">{serv.durationMin} min</td>
                          <td className="py-2 px-3 text-amber-400">+{serv.bufferMin} min</td>
                          <td className="py-2 px-3">{serv.stationType === 'manicure_desk' ? 'Mesa Manicure' : 'Sillón Spa Pedi'}</td>
                          <td className="py-2 px-3">
                            {serv.allowSimultaneousWithOpposite ? (
                              <span className="text-emerald-400 font-sans font-semibold">Sí (A 4 manos)</span>
                            ) : (
                              <span className="text-slate-500 font-sans">No (Exclusivo)</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Deterministic business rules */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider mb-2">Regla de Buffer y Esterilización</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      El buffer no puede ser ocupado bajo ninguna circunstancia por otra cita. Si un servicio termina a las 11:15 con un buffer
                      de 15 minutos, el slot del especialista y de la cabina se libera exactamente a las 11:30. El buffer absorbe hasta 10 min
                      de retraso del cliente sin perjudicar la cita subsiguiente.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800">
                    <h4 className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Regla de Simultaneidad "A 4 Manos"</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      Si el cliente selecciona Manicure + Pedicure y activa "Simultáneo":
                      <br />• Se reservan <strong>2 especialistas distintos</strong> en el mismo rango horario.
                      <br />• La estación física asignada es obligatoriamente el <strong>Sillón Spa Pedicure</strong> con banqueta de manicurista auxiliar.
                      <br />• La duración del turno se calcula como: <code className="text-pink-300">MAX(Duración_Mani, Duración_Pedi) + Buffer_Pedi</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: INTERACTIVE TIME & BUFFER SIMULATOR */}
        {activeTab === 'simulator' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-pink-400" />
                    Simulador del Motor de Cálculo de Tiempos y Buffers
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Comprueba en vivo cómo el algoritmo resuelve duraciones, sanitización y compatibilidad física para 1 o 2 especialistas.
                  </p>
                </div>
                <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
                  <button
                    onClick={() => setExecutionMode('sequential')}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      executionMode === 'sequential'
                        ? 'bg-slate-800 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    1 Especialista (Consecutivo)
                  </button>
                  <button
                    onClick={() => setExecutionMode('simultaneous')}
                    disabled={!canSimultaneous}
                    className={`px-3 py-1.5 rounded-lg font-medium transition ${
                      executionMode === 'simultaneous'
                        ? 'bg-pink-600 text-white shadow'
                        : canSimultaneous
                        ? 'text-slate-400 hover:text-slate-200'
                        : 'text-slate-600 cursor-not-allowed opacity-50'
                    }`}
                  >
                    2 Especialistas (A 4 Manos)
                  </button>
                </div>
              </div>

              {/* Service Selection Checkboxes */}
              <div className="py-6 space-y-3">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Selecciona la combinación de servicios:
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {SERVICES_CATALOG.map((serv) => {
                    const isSelected = selectedServices.includes(serv.id);
                    return (
                      <div
                        key={serv.id}
                        onClick={() => handleToggleService(serv.id)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-pink-950/20 border-pink-500/60 shadow-sm shadow-pink-500/10'
                            : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                              {serv.category}
                            </span>
                            <h4 className="text-xs font-semibold text-white mt-1.5">{serv.name}</h4>
                          </div>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'bg-pink-500 border-pink-500 text-white' : 'border-slate-600'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>

                        <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                          <span className="text-pink-400">{serv.durationMin} min (+{serv.bufferMin}b)</span>
                          <span className="text-white font-bold">${serv.basePrice} USD</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Calculation Output Card */}
              <div className="mt-4 p-5 rounded-xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-700">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-pink-400 flex items-center gap-1.5">
                    <Zap className="w-4 h-4" /> Resultado del Algoritmo de Turno
                  </h4>
                  <span className="text-xs font-mono text-slate-400">
                    Modo: <strong className="text-white">{executionMode === 'simultaneous' ? 'Simultáneo (A 4 Manos)' : 'Consecutivo (1 Especialista)'}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Duración con Cliente:</span>
                    <span className="text-xl font-black text-pink-400">{totalServiceTime} min</span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Buffer Sanitario:</span>
                    <span className="text-xl font-black text-amber-400">+{totalBufferTime} min</span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Tiempo Total Bloqueado:</span>
                    <span className="text-xl font-black text-white">{totalServiceTime + totalBufferTime} min</span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Especialistas Necesarios:</span>
                    <span className="text-xl font-black text-purple-400">{requiredSpecialists} persona(s)</span>
                  </div>

                  <div className="bg-slate-900/90 p-3 rounded-lg border border-slate-800">
                    <span className="text-[11px] text-slate-400 block font-mono">Precio Total Estimado:</span>
                    <span className="text-xl font-black text-emerald-400">${totalPrice} USD</span>
                  </div>
                </div>

                {/* Timeline visual bar */}
                <div className="mt-5 space-y-1.5">
                  <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                    <span>Cronograma del Turno</span>
                    <span>100% Slot = Trabajo ({totalServiceTime}m) + Desinfección & Autoclave ({totalBufferTime}m)</span>
                  </div>
                  <div className="w-full h-7 rounded-lg overflow-hidden flex font-mono text-[10px] text-white font-bold">
                    <div
                      style={{ width: `${(totalServiceTime / (totalServiceTime + totalBufferTime)) * 100}%` }}
                      className="bg-gradient-to-r from-pink-600 to-rose-500 flex items-center justify-center transition-all duration-300"
                    >
                      Servicio Activo ({totalServiceTime} min)
                    </div>
                    <div
                      style={{ width: `${(totalBufferTime / (totalServiceTime + totalBufferTime)) * 100}%` }}
                      className="bg-amber-600/80 flex items-center justify-center transition-all duration-300"
                    >
                      Buffer Limpieza ({totalBufferTime} min)
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: RELATIONAL DATA MODEL (POSTGRESQL DDL) */}
        {activeTab === 'db' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Database className="w-5 h-5 text-purple-400" />
                    Modelo de Datos Relacional (PostgreSQL 16)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Esquema de base de datos normalizado con extensiones <code className="text-purple-300 font-mono">btree_gist</code> para exclusión estricta de solapamiento de rangos de tiempo.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                  GIST Exclusion Constraint
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="text-pink-400 font-bold border-b border-slate-800 pb-1">
                    1. users & specialists
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_number VARCHAR(20) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  full_name VARCHAR(120) NOT NULL,
  role VARCHAR(20) DEFAULT 'client' CHECK (role IN ('client', 'specialist', 'admin')),
  notes_contraindications TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE specialists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  commission_percentage NUMERIC(5,2) DEFAULT 40.00,
  skills TEXT[] NOT NULL, -- ['gel_polish', 'acrylic', 'spa']
  is_active BOOLEAN DEFAULT TRUE
);`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2">
                  <div className="text-rose-400 font-bold border-b border-slate-800 pb-1">
                    2. services & stations (Mobiliario)
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`CREATE TABLE stations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) NOT NULL, -- 'Sillón Pedicure 01', 'Mesa 02'
  type VARCHAR(30) NOT NULL CHECK (type IN ('manicure_desk', 'pedicure_chair')),
  is_operational BOOLEAN DEFAULT TRUE
);

CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  category VARCHAR(30) NOT NULL,
  duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
  buffer_minutes INT NOT NULL DEFAULT 15,
  station_type VARCHAR(30) NOT NULL,
  base_price NUMERIC(10,2) NOT NULL,
  allow_simultaneous BOOLEAN DEFAULT FALSE
);`}
                  </pre>
                </div>

                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs space-y-2 md:col-span-2">
                  <div className="text-emerald-400 font-bold border-b border-slate-800 pb-1">
                    3. appointments & slots (Con Garantía de Cero Solapamiento GIST)
                  </div>
                  <pre className="text-slate-300 overflow-x-auto text-[11px] leading-relaxed">
{`CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID NOT NULL REFERENCES users(id),
  total_price NUMERIC(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'HOLD' 
    CHECK (status IN ('HOLD', 'CONFIRMED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW')),
  hold_expires_at TIMESTAMPTZ, -- Lock TTL 10 min
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Turnos individuales (1 cita puede tener 2 especialistas en modo A 4 Manos)
CREATE TABLE appointment_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
  specialist_id UUID NOT NULL REFERENCES specialists(id),
  station_id UUID NOT NULL REFERENCES stations(id),
  service_id UUID NOT NULL REFERENCES services(id),
  time_slot TSTZRANGE NOT NULL, -- Incluye [start_time, end_time_with_buffer)
  
  -- REGLA DETERMINISTA: Un especialista no puede tener dos servicios en el mismo rango
  CONSTRAINT no_overlapping_specialist_slots 
    EXCLUDE USING gist (specialist_id WITH =, time_slot WITH &&)
    WHERE (status NOT IN ('CANCELLED')),

  -- REGLA DETERMINISTA: Una estación física no puede ocuparse dos veces al mismo tiempo
  CONSTRAINT no_overlapping_station_slots 
    EXCLUDE USING gist (station_id WITH =, time_slot WITH &&)
    WHERE (status NOT IN ('CANCELLED'))
);`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: API RESTFUL ENDPOINTS */}
        {activeTab === 'api' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-cyan-400" />
                    Especificación de Endpoints API RESTful
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Contratos de entrada/salida para el motor de reservas, bloqueo con TTL y orquestación de notificaciones.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono">
                  OpenAPI 3.1 Compatible
                </span>
              </div>

              <div className="space-y-4">
                {/* Endpoint 1 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                        GET
                      </span>
                      <code className="text-xs text-white font-mono">/api/v1/availability/slots</code>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Público / Cliente</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Calcula los bloques horarios libres calculando simultaneidad, buffers sanitarios y disponibilidad de estaciones.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-slate-300">
                    <span className="text-slate-500 block">Query Params:</span>
                    date=2026-10-20 & service_ids=mani_gel,pedi_spa & mode=simultaneous & specialist_id=optional_uuid
                  </div>
                </div>

                {/* Endpoint 2 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">
                        POST
                      </span>
                      <code className="text-xs text-white font-mono">/api/v1/appointments/hold</code>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Pessimistic Locking (TTL 600s)</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Crea un bloqueo temporal del turno en Redis y PostgreSQL con estado <code className="text-amber-400">HOLD</code> mientras el usuario completa el pago del anticipo.
                  </p>
                  <div className="bg-slate-900 p-2.5 rounded-lg text-[11px] font-mono text-slate-300">
                    <span className="text-slate-500 block">Response (201 Created):</span>
                    {`{ "hold_id": "c1f8a8...", "expires_in_seconds": 600, "checkout_url": "https://pay...", "total_deposit": 20.00 }`}
                  </div>
                </div>

                {/* Endpoint 3 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30">
                        POST
                      </span>
                      <code className="text-xs text-white font-mono">/api/v1/appointments/:id/confirm</code>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Webhook Pasarela / Admin</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Valida el pago de seña, pasa el estado a <code className="text-emerald-400">CONFIRMED</code> y encola jobs en BullMQ para disparar mensajes interactivos en WhatsApp Cloud API.
                  </p>
                </div>

                {/* Endpoint 4 */}
                <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30">
                        PATCH
                      </span>
                      <code className="text-xs text-white font-mono">/api/v1/specialists/:id/schedule-overrides</code>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono">Especialista / Admin</span>
                  </div>
                  <p className="text-xs text-slate-300">
                    Bloquea turnos por descansos, incapacidades o ausencias imprevistas, recalculando citas afectadas automáticamente.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-500">
        Nail Salon Architecture Engine • Software Requirements Specification & Technical Design Portal
      </footer>
    </div>
  );
}

const SRS_MARKDOWN_EXPORT = `# ESPECIFICACIÓN TÉCNICA Y FUNCIONAL (SRS)
## SISTEMA DE GESTIÓN Y RESERVAS AUTOMATIZADAS PARA SALÓN DE BELLEZA (MANICURE & PEDICURE)

---

### 1. REQUERIMIENTOS FUNCIONALES Y NO FUNCIONALES

#### 1.1. Módulos Esenciales y Requerimientos Funcionales

##### A. Panel Cliente (Web App & PWA Móvil)
- **RF-CLI-01: Autenticación Passwordless & Social:** Registro e inicio de sesión mediante verificación OTP vía WhatsApp/SMS o Google OAuth 2.0.
- **RF-CLI-02: Selector de Servicios Multinivel:** Posibilidad de concatenar servicio principal (manicure/pedicure), retiro previo (gel/acrílico) y adicionales (nail art por nivel de complejidad).
- **RF-CLI-03: Asignación de Especialista:** Selección voluntaria de especialista preferente o asignación algorítmica por "Cualquiera disponible" (priorizando optimización de huecos de agenda).
- **RF-CLI-04: Reserva Simultánea "A 4 Manos":** Opción para agendar manicure y pedicure ejecutados en paralelo por dos profesionales distintos en un sillón spa.
- **RF-CLI-05: Motor de Disponibilidad en Tiempo Real:** Visualización de slots libres en intervalos de 15 minutos, excluyendo automáticamente turnos y buffers.
- **RF-CLI-06: Bloqueo Temporal (HOLD Lock):** Reserva provisional de 10 minutos (TTL) mientras el cliente ingresa pasarela de pagos.
- **RF-CLI-07: Gestión de Citas y Cancelaciones:** Auto-reprogramación y cancelación con política restrictiva (máximo hasta 12 horas previas a la cita).

##### B. Panel Especialista
- **RF-ESP-01: Agenda Operativa Dinámica:** Vista de turnos diarios/semanales con diferenciación de color entre tiempo de atención al cliente y buffer de desinfección/esterilización.
- **RF-ESP-02: Control de Estados de Turno:** Registro de check-in: *Esperando Cliente*, *En Proceso*, *Completado*, *No-Show* (Inasistencia) y *Cancelado*.
- **RF-ESP-03: Bloqueo de Tiempos Personales:** Declaración de pausas activas, descansos y permisos extraordinarios con propagación inmediata a la disponibilidad.
- **RF-ESP-04: Ficha Técnica de Uñas:** Historial del cliente con notas de contraindicaciones (ej. onicomicosis, alergia a acrilatos) y fotos de trabajos previos.
- **RF-ESP-05: Liquidación de Honorarios:** Desglose automatizado de comisiones acumuladas por servicios y propinas.

##### C. Panel Administrador
- **RF-ADM-01: Gestión de Estaciones Físicas (Capacidad Instalada):** Inventario de mesas de manicure y sillones spa con especificación de capacidad simultánea.
- **RF-ADM-02: Matriz de Certificaciones (Skills):** Mapeo de qué especialistas están capacitadas para acrílico esculpido, manicura rusa o nail art avanzado.
- **RF-ADM-03: Políticas de No-Show y Pagos:** Configuración del valor de anticipo/seña obligatoria (ej. 30% del servicio) para validar la reserva.
- **RF-ADM-04: Reportes de Productividad:** Ocupación de sillones por franja horaria, ticket promedio y rendimiento por colaboradora.

#### 1.2. Requerimientos No Funcionales (RNF)
- **RNF-01: Disponibilidad y SLA:** 99.9% de operatividad anual en la capa de agendamiento.
- **RNF-02: Rendimiento y Latencia:** Cálculo de slots disponibles en menos de 150 ms para un horizonte de 30 días calendario.
- **RNF-03: Consistencia y Concurrencia:** Cero probabilidad de *double-booking* mediante locks pesimistas distribuidos en Redis y restricciones de exclusión GiST a nivel de base de datos.
- **RNF-04: Seguridad:** Cumplimiento de OWASP Top 10, hashing bcrypt para credenciales y aislamiento de datos de pago conforme a normativa PCI-DSS (Stripe/Wompi tokenization).

---

### 2. CATÁLOGO DE SERVICIOS Y REGLAS DE NEGOCIO

#### 2.1. Matriz de Servicios, Tiempos y Buffers

| Código | Servicio | Categoría | Duración Neta | Buffer Sanitario | Estación Requerida | Skill Especialista | Simultáneo Permitido |
| :--- | :--- | :--- | :---: | :---: | :--- | :--- | :---: |
| **MAN-BAS** | Manicure Tradicional | Manicure | 40 min | 10 min | Mesa Manicure | \`basic_nails\` | Sí |
| **MAN-RUS** | Manicure Ruso + Gel | Manicure | 75 min | 15 min | Mesa Manicure | \`gel_polish\` | Sí |
| **MAN-ACR** | Uñas Acrílicas Esculpidas | Manicure | 120 min | 20 min | Mesa con Extractor | \`acrylic_pro\` | No (Ergonomía/Vapor) |
| **MAN-RET** | Retoque de Acrílico | Manicure | 90 min | 15 min | Mesa con Extractor | \`acrylic_pro\` | No |
| **PED-BAS** | Pedicure Clínico Básico | Pedicure | 45 min | 15 min | Sillón Spa Pedicure | \`basic_pedi\` | Sí |
| **PED-SPA** | Pedicure Spa Jelly | Pedicure | 75 min | 20 min | Sillón Spa Pedicure | \`spa_care\` | Sí |
| **PED-GEL** | Pedicure Spa + Gel | Pedicure | 90 min | 15 min | Sillón Spa Pedicure | \`gel_polish\` | Sí |
| **ADD-REM** | Retiro de Sistema Previo | Complemento | 30 min | 10 min | Mesa / Sillón | \`removal\` | Sí |
| **ADD-ART** | Nail Art Avanzado | Complemento | 40 min | 10 min | Mesa Manicure | \`advanced_art\` | No |

#### 2.2. Reglas de Negocio Operativas Deterministas

1. **Inviolabilidad del Buffer Sanitario:**
   - Todo servicio lleva un buffer indivisible posterior para autoclave de instrumental metálico, sanitización de tina y desinfección de superficies con virucida hospitalario.
   - El slot ocupado por un servicio se define como:
     $$\text{SlotTotal} = \text{DuraciónNeta} + \text{Buffer}$$
   - Si el cliente llega con hasta 10 minutos de retraso, el tiempo se descuenta de la sesión de nail art o pulido para garantizar que el buffer comience a tiempo. Si excede 15 minutos, la cita se cancela con estatus *NO_SHOW*.

2. **Regla de Simultaneidad ("A 4 Manos"):**
   - Válida únicamente al combinar 1 servicio de Manicure elegible + 1 servicio de Pedicure elegible.
   - Requiere la reserva simultánea de **2 especialistas independientes** y **1 Sillón Spa con brazo auxiliar**.
   - Cálculo de duración total del turno a 4 manos:
     $$\text{DuraciónBloqueo} = \max(\text{DuraciónMani}, \text{DuraciónPedi}) + \max(\text{BufferMani}, \text{BufferPedi})$$

3. **Restricción de Recursos Físicos:**
   - Ninguna cita puede confirmarse si no hay simultáneamente disponible:
     1. La especialista cualificada.
     2. La estación física requerida (Mesa con extractor o Sillón Spa).

---

### 3. MODELO DE DATOS RELACIONAL (POSTGRESQL)

\`\`\`sql
-- Extensiones requeridas para rangos temporales y llaves UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "btree_gist";

-- Tipos enumerados
CREATE TYPE user_role AS ENUM ('client', 'specialist', 'admin');
CREATE TYPE appointment_status AS ENUM ('HOLD', 'CONFIRMED', 'IN_SERVICE', 'COMPLETED', 'CANCELLED', 'NO_SHOW');
CREATE TYPE station_type AS ENUM ('manicure_desk', 'pedicure_chair');

-- 1. Tabla Usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(255) UNIQUE,
    full_name VARCHAR(120) NOT NULL,
    role user_role DEFAULT 'client',
    contraindications TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Tabla Especialistas
CREATE TABLE specialists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    skills TEXT[] NOT NULL, -- ['gel_polish', 'acrylic_pro', 'spa_care']
    commission_rate NUMERIC(5,2) DEFAULT 40.00,
    is_active BOOLEAN DEFAULT TRUE,
    CONSTRAINT unique_specialist_user UNIQUE (user_id)
);

-- 3. Horarios y Disponibilidad Base de Especialistas
CREATE TABLE specialist_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    specialist_id UUID NOT NULL REFERENCES specialists(id) ON DELETE CASCADE,
    day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0=Domingo, 6=Sábado
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    lunch_break_start TIME,
    lunch_break_end TIME,
    CONSTRAINT valid_work_hours CHECK (start_time < end_time)
);

-- 4. Estaciones Físicas (Capacidad del Local)
CREATE TABLE stations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(30) NOT NULL UNIQUE, -- 'SILLON-SPA-01', 'MESA-ACR-02'
    type station_type NOT NULL,
    has_chemical_extractor BOOLEAN DEFAULT FALSE,
    is_operational BOOLEAN DEFAULT TRUE
);

-- 5. Catálogo de Servicios
CREATE TABLE services (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) NOT NULL UNIQUE,
    name VARCHAR(120) NOT NULL,
    category VARCHAR(40) NOT NULL,
    duration_minutes INT NOT NULL CHECK (duration_minutes > 0),
    buffer_minutes INT NOT NULL DEFAULT 15,
    required_station station_type NOT NULL,
    base_price NUMERIC(10,2) NOT NULL,
    allow_simultaneous BOOLEAN DEFAULT FALSE
);

-- 6. Cabecera de Cita
CREATE TABLE appointments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID NOT NULL REFERENCES users(id),
    status appointment_status DEFAULT 'HOLD',
    is_four_hands BOOLEAN DEFAULT FALSE,
    total_amount NUMERIC(10,2) NOT NULL,
    deposit_amount NUMERIC(10,2) NOT NULL,
    deposit_payment_id VARCHAR(100),
    hold_expires_at TIMESTAMPTZ, -- Expiración del lock temporal
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Turnos Desglosados (Appointment Slots) con Protección Anti-Solapamiento GIST
CREATE TABLE appointment_slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    appointment_id UUID NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    specialist_id UUID NOT NULL REFERENCES specialists(id),
    station_id UUID NOT NULL REFERENCES stations(id),
    service_id UUID NOT NULL REFERENCES services(id),
    time_window TSTZRANGE NOT NULL, -- [start_timestamp, end_timestamp_with_buffer)

    -- Evita que la especialista sea reservada en 2 citas a la misma hora
    CONSTRAINT prevent_specialist_overlap 
    EXCLUDE USING gist (
        specialist_id WITH =,
        time_window WITH &&
    ) WHERE (status NOT IN ('CANCELLED')),

    -- Evita que la estación física (sillón/mesa) sea ocupada por 2 citas a la misma hora
    CONSTRAINT prevent_station_overlap 
    EXCLUDE USING gist (
        station_id WITH =,
        time_window WITH &&
    ) WHERE (status NOT IN ('CANCELLED'))
);

CREATE INDEX idx_appointment_slots_window ON appointment_slots USING gist (time_window);
\`\`\`

---

### 4. FLUJO DE RESERVA PASO A PASO

\`\`\`
[1. Selección]      -> Cliente elige servicios (ej. Manicure Ruso + Pedicure Spa) y modo (Individual o A 4 Manos).
[2. Cálculo Slots]  -> El motor consulta turnos libres intersectando: Horario Especialista - Citas Activas - Disponibilidad de Sillón.
[3. Creación HOLD]  -> Se genera cita con status 'HOLD' y time_window en Redis/Postgres. Se bloquea el cupo durante 10 minutos.
[4. Anticipo/Pago]  -> Pasarela procesa depósito (30%). 
                       - Si falla o expira TTL (10 min): Se libera el lock automáticamente.
                       - Si es exitoso: Webhook cambia status a 'CONFIRMED'.
[5. Notificación]   -> Worker asíncrono despacha mensaje estructurado vía WhatsApp Cloud API y correo con archivo .ics (Google/Apple Calendar).
[6. Recordatorios]  -> T-24h y T-2h: Worker dispara confirmación interactiva por WhatsApp (Botón: "Confirmar Asistencia" / "Reprogramar").
\`\`\`

---

### 5. ESPECIFICACIÓN DE ENDPOINTS API RESTFUL

| Método | Endpoint | Parámetros Principales | Códigos HTTP | Descripción / Función |
| :--- | :--- | :--- | :---: | :--- |
| **GET** | \`/api/v1/services\` | \`category\`, \`allow_simultaneous\` | 200, 400 | Retorna catálogo activo con duraciones y buffers. |
| **GET** | \`/api/v1/availability/slots\` | \`date\`, \`service_ids[]\`, \`mode\`, \`specialist_id\` | 200, 422 | Genera matriz de slots libres disponibles en intervalos de 15m. |
| **POST** | \`/api/v1/appointments/hold\` | \`client_id\`, \`service_ids[]\`, \`slot_start\`, \`mode\` | 201, 409, 422 | Aplica bloqueo pesimista temporal (10 min TTL) y retorna checkout. |
| **POST** | \`/api/v1/appointments/:id/confirm\` | \`payment_intent_id\`, \`idempotency_key\` | 200, 400, 404 | Valida pago de anticipo, confirma cita y activa webhook de mensajería. |
| **PATCH** | \`/api/v1/appointments/:id/cancel\` | \`cancellation_reason\` | 200, 403, 404 | Cancela turno liberando la estación y la especialista. Aplica política de reembolso. |
| **GET** | \`/api/v1/specialists/:id/agenda\` | \`start_date\`, \`end_date\` | 200, 401 | Vista operativa para la colaboradora con desglose de servicios y descansos. |
| **POST** | \`/api/v1/webhooks/whatsapp\` | Payload WhatsApp Cloud API | 200 | Procesa respuestas interactivas de confirmación del cliente. |

---

### 6. STACK TECNOLÓGICO SUGERIDO PARA MVP ESCALABLE

- **Backend Runtime:** Node.js con TypeScript sobre Fastify (mínimo overhead de latencia y validación JSON nativa con TypeBox/Zod).
- **Base de Datos Principal:** PostgreSQL 16 administrado (con extensión \`btree_gist\` activa para exclusión matemática de citas solapadas).
- **Capa de Concurrencia y Cache:** Redis v7 para locks distribuidos (\`Redlock\` para los 10 minutos de checkout temporal) y sesiones.
- **Cola de Trabajos en Segundo Plano:** BullMQ (Redis-backed) para el despacho asíncrono de recordatorios, cancelación de holds expirados y webhooks.
- **Frontend & App Móvil:** React 19 / Next.js con Tailwind CSS para web responsive; empaquetable como PWA o React Native (Expo) para aplicaciones nativas iOS/Android.
- **Infraestructura Cloud:** Contenedores en AWS ECS Fargate o Google Cloud Run con escalado automático de instancias y Cloudflare como CDN/WAF.
- **Canal de Notificaciones:** Meta WhatsApp Cloud API Oficial con plantillas interactivas aprobadas y Resend / SendGrid para confirmaciones transaccionales vía Email.
`;
