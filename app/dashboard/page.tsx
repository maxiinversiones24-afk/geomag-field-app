import Link from "next/link";

export default function Dashboard() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-lg bg-neutral-900/80 backdrop-blur border border-neutral-800 rounded-2xl p-8 shadow-xl">

        {/* Título */}
        <h1 className="text-2xl font-bold text-center mb-2">
          GeoMag Field
        </h1>

        {/* Subtítulo */}
        <p className="text-sm text-neutral-400 text-center mb-8">
          Registro y análisis de datos geofísicos en campo
        </p>

        {/* Acciones */}
        <div className="grid grid-cols-1 gap-4">

          <Link
            href="/dashboard/field"
            className="
              group flex items-center justify-between
              p-5 rounded-xl
              bg-neutral-800 hover:bg-blue-600/20
              border border-neutral-700 hover:border-blue-500
              transition
            "
          >
            <div>
              <div className="text-lg font-semibold">📍 Cargar datos</div>
              <div className="text-sm text-neutral-400 group-hover:text-blue-300">
                Registrar estaciones de campo
              </div>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition">→</span>
          </Link>

          <Link
            href="/dashboard/magnetic"
            className="
              group flex items-center justify-between
              p-5 rounded-xl
              bg-neutral-800 hover:bg-green-600/20
              border border-neutral-700 hover:border-green-500
              transition
            "
          >
            <div>
              <div className="text-lg font-semibold">🧲 Procesar magnetismo</div>
              <div className="text-sm text-neutral-400 group-hover:text-green-300">
                Calcular y analizar campo magnético
              </div>
            </div>
            <span className="text-xl group-hover:translate-x-1 transition">→</span>
          </Link>

        </div>

        {/* Footer mini */}
        <p className="text-xs text-neutral-500 text-center mt-8">
          Diseñado para trabajo de campo · Mobile first
        </p>
      </div>
    </main>
  );
}
