"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { loginSchema, type LoginFormValues } from "@/modules/auth/validators";
import type { Session } from "@/modules/auth/types";

import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";

export default function LoginPage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/partner";

  const [error, setError] = useState<string | null>(null);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
    mode: "onSubmit",
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);

    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    if (res.status === 401) return setError("Credenciales inválidas.");
    if (res.status === 429) return setError("Demasiados intentos. Intenta en unos minutos.");
    if (!res.ok) return setError("No se pudo iniciar sesión. Intenta nuevamente.");

    const data = (await res.json()) as { session: Session };

    const s = data.session;
    const needsStoreSelect = (s.storeIds?.length ?? 0) > 1 && !s.defaultStoreId;

    if (needsStoreSelect) {
      router.replace(`/select-store?next=${encodeURIComponent(next)}`);
    } else {
      router.replace(next);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-12">
      {/* Left hero (hidden on small screens) */}
      <div className="hidden md:flex md:col-span-7 relative items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[url('/images/login-bg-placeholder.svg')] bg-cover bg-center" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f3b33]/85 to-transparent" />

        {/* big white curved card inside hero (placeholder) */}
        <div className="relative z-10 w-full h-full flex items-center">
          <div className="ml-16 max-w-2xl text-white">
            <div className="w-44 mb-6">
              <img src="/images/logo-placeholder.svg" alt="logo" className="w-full h-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-semibold leading-tight mb-3">Bienvenido a Partners</h1>
            <p className="text-lg text-white/80 max-w-lg">Administra tus tiendas fácilmente desde un solo panel.</p>
          </div>

          {/* curved white panel with illustration */}
          <div className="absolute left-0 bottom-8 ml-8 w-2/3 max-w-2xl pointer-events-none">
            <img src="/images/card-white-curved-placeholder.svg" alt="card white" className="w-full h-auto rounded-3xl shadow-2xl" />
          </div>

          {/* small floating illustration */}
          <div className="absolute left-20 bottom-36 w-36 opacity-90">
            <img src="/images/card-illustration-placeholder.svg" alt="illustration" className="w-full h-auto" />
          </div>
        </div>
      </div>

      {/* Right form */}
      <div className="col-span-1 md:col-span-5 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white auth-card border border-gray-100">
            <CardHeader>
              <CardTitle className="text-lg">Partners · Iniciar sesión</CardTitle>
              <p className="text-sm text-muted-foreground">Ingresa con tu cuenta para continuar</p>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
                <div className="space-y-1">
                  <label className="text-sm">Email</label>
                  <Input type="email" autoComplete="email" {...form.register("email")} />
                  {form.formState.errors.email?.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-1">
                  <label className="text-sm">Password</label>
                  <Input type="password" autoComplete="current-password" {...form.register("password")} />
                  {form.formState.errors.password?.message && (
                    <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full bg-black text-white hover:bg-black/90" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Ingresando..." : "Ingresar"}
                </Button>

                <div className="flex justify-between items-center text-sm text-muted-foreground">
                  <a className="underline" href="#">Olvidé mi contraseña</a>
                  <a className="underline" href="#">Registrarme</a>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            ¿Problemas para ingresar? <a href="#" className="underline">Contactar soporte</a>
          </div>
        </div>
      </div>
    </div>
  );
}
