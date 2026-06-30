"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/admin/auth-context";
import { Lock, ShieldAlert } from "lucide-react";

export function LoginScreen() {
  const { signIn, configured } = useAuth();
  const [loading, setLoading] = useState(false);

  async function handleSignIn() {
    setLoading(true);
    try {
      await signIn();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-md border-border/60">
        <CardHeader className="space-y-2 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-secondary">
            <Lock className="size-5 text-foreground" />
          </div>
          <CardTitle className="text-xl">LumarSoft · Panel interno</CardTitle>
          <CardDescription>Acceso exclusivo para el equipo.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!configured ? (
            <div className="flex gap-3 rounded-lg border border-border bg-secondary/40 p-3 text-sm text-muted-foreground">
              <ShieldAlert className="mt-0.5 size-4 shrink-0 text-brand" />
              <p>
                Falta configurar Firebase. Copiá{" "}
                <code className="text-foreground">.env.local.example</code> a{" "}
                <code className="text-foreground">.env.local</code> y completá
                las variables{" "}
                <code className="text-foreground">NEXT_PUBLIC_FIREBASE_*</code>.
              </p>
            </div>
          ) : null}
          <Button
            onClick={handleSignIn}
            disabled={loading || !configured}
            className="w-full"
            size="lg"
          >
            {loading ? "Entrando…" : "Entrar con Google"}
          </Button>
          <p className="text-center text-xs text-muted-foreground">
            Solo los mails autorizados del equipo pueden entrar.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
