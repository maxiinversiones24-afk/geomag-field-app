"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/dashboard");
    });

    return () => subscription.unsubscribe();
  }, [router, supabase]);

  const login = async () => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const register = async () => {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  };

  const loginWithGoogle = () =>
  supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });


  async function handle(action: () => Promise<void>, msg: string) {
    try {
      await action();
      alert(msg);
    } catch (e: any) {
      alert(e.message);
    }
  }

  return (
    <div className="min-h-screen flex justify-center items-center bg-background px-4">
      <div className="w-full max-w-sm bg-card border rounded-2xl p-8 shadow-xl">

        <h2 className="text-center text-xl font-semibold mb-6">
          {mode === "login" ? "Iniciar sesión" : "Crear cuenta"}
        </h2>

        <input
          type="email"
          placeholder="Email"
          className="w-full px-4 py-2 mb-3 rounded bg-muted"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Contraseña"
            className="w-full px-4 py-2 rounded bg-muted pr-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-0.5"
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>

        {mode === "login" ? (
          <>
            <button
              className="w-full py-2 rounded bg-green-600 text-white mb-3"
              onClick={() => handle(login, "Bienvenido")}
            >
              Iniciar sesión
            </button>

            <button
              className="w-full flex justify-center items-center gap-2 py-2 rounded border"
              onClick={loginWithGoogle}
            >
              <FcGoogle size={22} />
              Google
            </button>

            <p className="text-center text-sm mt-4">
              ¿No tenés cuenta?{" "}
              <button className="text-green-500" onClick={() => setMode("register")}>
                Registrate
              </button>
            </p>
          </>
        ) : (
          <>
            <button
              className="w-full py-2 rounded bg-green-600 text-white"
              onClick={() => handle(register, "Revisá tu mail para confirmar")}
            >
              Crear cuenta
            </button>

            <p className="text-center text-sm mt-4">
              ¿Ya tenés cuenta?{" "}
              <button className="text-green-500" onClick={() => setMode("login")}>
                Iniciar sesión
              </button>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
