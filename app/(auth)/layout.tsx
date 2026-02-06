export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative">
      {/* Card centrado */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-6xl overflow-hidden rounded-3xl shadow-2xl bg-[var(--miji-card)]">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* LEFT */}
            <div className="hidden lg:block lg:col-span-7 relative overflow-hidden min-h-[680px] bg-[var(--miji-surface)]">
              {/* Imagen detrás */}
              <img
                src="/images/login-illustration.jpg"
                alt="Background"
                className="absolute inset-0 h-full w-full object-cover object-center z-0"
              />

              {/* Overlay para legibilidad */}
              <div className="absolute inset-0 z-10 bg-white/25" />

              {/* Detalles suaves (opcionales) */}
              <div className="absolute inset-0 opacity-30 z-20 pointer-events-none">
                <div className="absolute top-10 left-10 size-14 rounded-full bg-black/10" />
                <div className="absolute top-32 left-40 size-10 rounded-full bg-black/10" />
                <div className="absolute bottom-24 left-24 size-12 rounded-full bg-black/10" />
              </div>

            </div>

            {/* RIGHT (verde oscuro + slot del formulario) */}
            <div className="lg:col-span-5 flex items-center justify-center p-6 sm:p-10 min-h-[640px]">
              <div className="w-full max-w-md">{children}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
