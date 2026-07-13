"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Mail, Lock, User as UserIcon, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        
        // Verifica se a usuária pulou o onboarding
        const { data: profile } = await supabase.from('profiles').select('lipedema_stage').eq('id', data.user.id).single();
        if (profile && (!profile.lipedema_stage || profile.lipedema_stage === '')) {
            router.push("/onboarding");
        } else {
            router.push("/dashboard");
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;
        
        // Se a configuração do Supabase exige confirmação por e-mail, pode não logar direto
        // Mas assumiremos que está logando direto para ir pro onboarding
        if (data.session) {
            router.push("/onboarding");
        } else {
            setError("Conta criada! Verifique seu email para confirmar.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Ocorreu um erro inesperado.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F8F9FA] dark:bg-dark-bg p-4 transition-colors">
      <div className="w-full max-w-4xl bg-white dark:bg-dark-card rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Lado Esquerdo - Decorativo */}
        <div className="w-full md:w-1/2 bg-gradient-to-br from-salmon to-rose-400 p-12 text-white flex flex-col justify-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">LipWell</h1>
            <p className="text-white/80">Seu aliado diário contra o lipedema.</p>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed">
              Monitore sintomas, descubra sua dieta ideal e converse com nossa inteligência artificial feita exclusivamente para o seu corpo.
            </p>
            <div className="flex items-center gap-4 text-sm font-medium bg-white/10 px-4 py-3 rounded-xl border border-white/20">
              ✨ Trial Automático de 5 Dias após o Cadastro!
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
            {isLogin ? "Bem-vinda de volta" : "Crie sua conta"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">
            {isLogin ? "Acesse seu diário e relatórios" : "Comece seus 5 dias grátis agora"}
          </p>

          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 p-3 rounded-lg text-sm border border-red-100 dark:border-red-800">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome Completo</label>
                <div className="relative">
                  <UserIcon className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-salmon focus:outline-none transition-colors"
                    placeholder="Maria Silva"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">E-mail</label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-salmon focus:outline-none transition-colors"
                  placeholder="seu@email.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Senha</label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute left-3 top-3.5 text-gray-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 dark:bg-dark/50 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-salmon focus:outline-none transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-salmon hover:bg-salmon/90 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center mt-6 disabled:opacity-70"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isLogin ? (
                "Entrar"
              ) : (
                "Começar 5 Dias Grátis"
              )}
            </button>
          </form>

          <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
            {isLogin ? "Ainda não tem conta?" : "Já tem uma conta?"}{" "}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-salmon font-bold hover:underline ml-1"
            >
              {isLogin ? "Comece aqui" : "Entre agora"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
