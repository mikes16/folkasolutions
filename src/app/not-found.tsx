import Link from "next/link";

export default function RootNotFound() {
  return (
    <div className="flex-1 flex items-center justify-center py-32">
      <div className="text-center">
        <h1 className="text-6xl font-bold tracking-tight mb-4">404</h1>
        <p className="text-muted mb-8">Página no encontrada</p>
        <Link
          href="/"
          className="text-xs uppercase tracking-[2px] font-medium border-b border-foreground pb-1 hover:opacity-70 transition-opacity"
        >
          Ir al Inicio
        </Link>
      </div>
    </div>
  );
}
