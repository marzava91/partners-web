"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card";
import { Button } from "@/shared/ui/button";
import { Alert, AlertDescription } from "@/shared/ui/alert";

type MeResponse =
  | { session: null }
  | { session: { storeIds: string[]; defaultStoreId?: string | null } };

export default function SelectStorePage() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/partner";

  const [storeIds, setStoreIds] = useState<string[]>([]);
  const [selected, setSelected] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }
      const data = (await res.json()) as MeResponse;
      if (!("session" in data) || !data.session) {
        router.replace(`/login?next=${encodeURIComponent(next)}`);
        return;
      }

      const ids = data.session.storeIds ?? [];
      setStoreIds(ids);
      setSelected(data.session.defaultStoreId ?? ids[0] ?? "");
      setLoading(false);
    })();
  }, [router, next]);

  const canContinue = useMemo(() => !!selected && storeIds.includes(selected), [selected, storeIds]);

  const onContinue = async () => {
    if (!canContinue) return;

    setSaving(true);
    setError(null);

    const res = await fetch("/api/auth/select-store", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storeId: selected }),
    });

    setSaving(false);

    if (!res.ok) {
      setError("No se pudo seleccionar la tienda. Intenta nuevamente.");
      return;
    }

    router.replace(next);
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>Selecciona tu tienda</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* v1: lista simple por IDs. v1.1: reemplazar por nombres. */}
          <div className="space-y-2">
            {storeIds.map((id) => (
              <label key={id} className="flex items-center gap-2 text-sm">
                <input
                  type="radio"
                  name="store"
                  value={id}
                  checked={selected === id}
                  onChange={() => setSelected(id)}
                />
                <span>{id}</span>
              </label>
            ))}
          </div>

          <Button className="w-full" onClick={onContinue} disabled={!canContinue || saving}>
            {saving ? "Guardando..." : "Continuar"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
