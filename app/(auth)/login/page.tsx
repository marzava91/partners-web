"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";

import { loginSchema, type LoginFormValues } from "@/modules/auth/validators";

import { Input } from "@/shared/ui/input";
// import { Button } from "@/shared/ui/button"; // (AJUSTE #1) Lo dejamos comentado temporalmente para aislar el problema
import { Alert, AlertDescription } from "@/shared/ui/alert";
import { Tabs, TabsList, TabsTrigger } from "@/shared/ui/tabs";

export default function LoginPage() {
  const sp = useSearchParams();
  const next = sp.get("next") || "/partner/dashboard";

  const [error, setError] = useState<string | null>(null);
  const [showPwd, setShowPwd] = useState(false);

  // (AJUSTE #2) loading explícito (no dependemos de isSubmitting si el submit no dispara)
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifierType: "email", email: "", phone: "", password: "" },
    mode: "onSubmit",
  });

  const identifierType = form.watch("identifierType");

  const pillInput = useMemo(
    () =>
      "h-11 rounded-full px-5 bg-black/5 border border-black/10 text-[var(--miji-ink)] " +
      "placeholder:text-black/40 focus-visible:ring-2 focus-visible:ring-[var(--miji-orange)] focus-visible:ring-offset-0",
    []
  );

  const onInvalid = (errors: any) => {
    console.log("[login] RHF validation errors:", errors);
  };

  const onSubmit = async (values: LoginFormValues) => {
    // (AJUSTE #3) Logs para confirmar que el submit realmente se dispara
    console.log("[login] RHF onSubmit values:", values);

    setError(null);
    setIsLoading(true);

    const identifier =
      values.identifierType === "email"
        ? values.email?.trim()
        : values.phone?.trim();

    try {
      // (AJUSTE #4) Log antes del fetch para ver si llegamos a este punto
      console.log("[login] calling POST /api/auth/login", {
        identifierType: values.identifierType,
        identifier,
      });

      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          identifierType: values.identifierType,
          identifier,
          password: values.password,
        }),
      });

      console.log("[login] response status:", res.status);

      if (!res.ok) {
        const data = await res.json().catch(() => null);
        setError(data?.message ?? "Credenciales inválidas.");
        return;
      }

      // (AJUSTE #5) Full reload para que proxy.ts corra server-side leyendo cookies
      window.location.replace(next);
    } catch (e) {
      console.error("[login] fetch error:", e);
      setError("No se pudo conectar. Intenta nuevamente.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Logo */}
      <div className="mb-6 flex justify-center">
        <img src="/images/miji-logo.png" alt="MiJi Markets" className="h-20 w-auto" />
      </div>

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--miji-ink)]">
          Ingresar
        </h1>
        <p className="mt-1 text-sm text-[var(--miji-muted)]">
          Gestiona tus ventas y operaciones.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4">
          <Alert variant="destructive" className="border-black/10 bg-black/5 text-[var(--miji-ink)]">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      {/* Selector Email / Teléfono */}
      <Tabs
        value={identifierType}
        onValueChange={(v: string) => {
          const nextType = v as "email" | "phone";
          form.setValue("identifierType", nextType, { shouldValidate: true, shouldDirty: true });

          // Limpia el campo que no aplica
          if (nextType === "email") form.setValue("phone", "", { shouldDirty: true });
          else form.setValue("email", "", { shouldDirty: true });

          // Opcional: limpia errores del otro campo
          form.clearErrors(["email", "phone"]);
        }}
        className="mb-5"
      >
        <TabsList className="grid grid-cols-2 rounded-full bg-black/5 p-1">
          <TabsTrigger value="email" className="rounded-full data-[state=active]:bg-white">
            Email
          </TabsTrigger>
          <TabsTrigger value="phone" className="rounded-full data-[state=active]:bg-white">
            Teléfono
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* (AJUSTE #6) Handler nativo + RHF: imprime log SIEMPRE que se intente submit */}
      <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-4">
        {/* ✅ CORRECCIÓN CLAVE */}
        <input type="hidden" {...form.register("identifierType")} />

        {identifierType === "email" ? (
          <div className="space-y-2">
            <label className="text-sm text-[var(--miji-ink)]/80">Email</label>
            <Input type="email" autoComplete="email" {...form.register("email")} className={pillInput} />
            {form.formState.errors.email?.message && (
              <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            <label className="text-sm text-[var(--miji-ink)]/80">Teléfono</label>
            <Input
              inputMode="tel"
              autoComplete="tel"
              placeholder="+51 999 999 999"
              {...form.register("phone")}
              className={pillInput}
            />
            {form.formState.errors.phone?.message && (
              <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
            )}
          </div>
        )}

        {/* Password con show/hide */}
        <div className="space-y-2">
          <label className="text-sm text-[var(--miji-ink)]/80">Password</label>

          <div className="relative">
            <Input
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              {...form.register("password")}
              className={pillInput + " pr-12"}
            />
            <button
              type="button"
              onClick={() => setShowPwd((s) => !s)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full hover:bg-black/5"
              aria-label={showPwd ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPwd ? <EyeOff className="h-4 w-4 text-black/60" /> : <Eye className="h-4 w-4 text-black/60" />}
            </button>
          </div>

          {form.formState.errors.password?.message && (
            <p className="text-sm text-red-600">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="text-right">
          <a href="/reset-password" className="text-xs text-black/50 hover:text-black underline underline-offset-4">
            Olvidé mi contraseña
          </a>
        </div>

        {/* (AJUSTE #7) Botón nativo temporal (descarta que Button esté roto) */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full h-11 rounded-full bg-[var(--miji-orange)] text-white hover:bg-[var(--miji-orange-2)] disabled:opacity-60"
        >
          {isLoading ? "Ingresando..." : "Ingresar"}
        </button>

        {/* Luego, cuando confirmes que funciona, vuelves a usar:
            <Button type="submit" ...>...</Button>
            y arreglamos shared/ui/button.tsx
        */}

        <div className="pt-2 text-center text-sm text-black/60">
          ¿No tienes cuenta?{" "}
          <a href="#" className="text-[var(--miji-orange)] hover:underline underline-offset-4">
            Regístrate
          </a>
        </div>

        <div className="pt-6 text-center">
          <a href="#" className="text-xs text-black/40 hover:text-black/60 underline underline-offset-4">
            Términos y condiciones
          </a>
        </div>
      </form>

      <div className="mt-8 text-center text-xs text-black/40">
        ¿Problemas para ingresar?{" "}
        <a href="#" className="underline underline-offset-4 hover:text-black/60">
          Contactar soporte
        </a>
      </div>
    </div>
  );
}
