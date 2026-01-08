import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <h1 className="text-3xl font-bold mb-4">GeoMag Field App</h1>
      <p className="text-center mb-6">
        Herramienta para recolección de datos geofísicos en campo
      </p>

      <Link
        href="/dashboard"
        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
      >
        Ir al Dashboard
      </Link>
    </main>
  );
}
