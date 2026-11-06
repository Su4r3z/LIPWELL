"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import {
  Phone,
  Calendar,
  ArrowRight,
  Loader2,
  CheckCircle,
  Heart,
  Activity,
  AlertCircle,
  Info,
  Layers,
  Zap,
  User,
  MapPin,
  ChevronRight,
} from "lucide-react";

type Step = 0 | 1 | 2 | 3 | 4;

const STAGES = [
  {
    value: "Suspeita",
    label: "Tenho Suspeita",
    description: "Ainda sem diagnóstico oficial, mas reconheço os sintomas.",
    icon: <Info className="w-5 h-5" />,
  },
  {
    value: "Estágio 1",
    label: "Estágio 1",
    description: "Pele lisa, tecido nodular abaixo da superfície.",
    icon: <Layers className="w-5 h-5" />,
  },
  {
    value: "Estágio 2",
    label: "Estágio 2",
    description: "Pele com nódulos maiores e irregularidades visíveis.",
    icon: <AlertCircle className="w-5 h-5" />,
  },
  {
    value: "Estágio 3",
    label: "Estágio 3",
    description: "Dobras de pele proeminentes, deformações e inchaço intenso.",
    icon: <Activity className="w-5 h-5" />,
  },
  {
    value: "Estágio 4",
    label: "Estágio 4 / Lipolinfedema",
    description: "Combinação de lipedema com linfedema severo.",
    icon: <Zap className="w-5 h-5" />,
  },
];

const PAIN_AREAS = [
  {
    value: "Pernas Inteiras",
    label: "Pernas Inteiras",
    description: "Do quadril aos tornozelos.",
    emoji: "🦵",
  },
  {
    value: "Coxas/Culote",
    label: "Coxas e Culote",
    description: "Região do quadril e parte superior das pernas.",
    emoji: "🩱",
  },
  {
    value: "Panturrilhas/Tornozelo",
    label: "Panturrilhas e Tornozelos",
    description: "Do joelho para baixo.",
    emoji: "🦶",
  },
  {
    value: "Braços",
    label: "Braços",
    description: "Acúmulo nos braços e antebraços.",
    emoji: "💪",
  },
  {
    value: "Corpo Todo",
    label: "Corpo Todo",
    description: "Braços, pernas e tronco.",
    emoji: "🫂",
  },
];

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<Step>(0);

  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [stage, setStage] = useState("Suspeita");
  const [pain, setPain] = useState("Pernas Inteiras");

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace("/login");
      }
    });
  }, [supabase, router]);

  const handleFinish = async () => {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não encontrado.");

      const { error } = await supabase
        .from("profiles")
        .update({
          phone: phone,
          dob: dob || null, // "" quebra coluna DATE no Postgres
          lipedema_stage: stage,
          pain_concentration: pain,
          full_name: user.user_metadata?.full_name || "",
        })
        .eq("id", user.id);

      if (error) throw error;

      // Passo de sucesso
      setStep(4);
      setTimeout(() => {
        router.push("/dashboard");
      }, 2500);
    } catch (err) {
      console.error(err);
      alert("Ocorreu um erro ao salvar seus dados. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep((s) => (s + 1) as Step);
    else handleFinish();
  };
  const prevStep = () => {
    if (step > 1) setStep((s) => (s - 1) as Step);
  };

  // ── Passo 4: Sucesso ──────────────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-mint/20 via-white to-salmon/10 dark:from-dark dark:via-dark-card dark:to-dark flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6 animate-in zoom-in-95 fade-in duration-500">
          <div className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-teal to-mint flex items-center justify-center shadow-xl shadow-teal/30">
            <CheckCircle className="w-12 h-12 text-white" strokeWidth={1.5} />
          </div>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
              Tudo certo!
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Sua Coach IA está sendo personalizada para você...
            </p>
          </div>
          <div className="flex items-center justify-center gap-2 text-teal dark:text-mint">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-sm font-medium">Preparando seu painel</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-mint/10 via-white to-salmon/5 dark:from-dark dark:via-dark-card dark:to-dark flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* ── Passo 0: Boas-vindas ─────────────────────────────────────── */}
        {step === 0 && (
          <div className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* Logo / Ícone */}
            <div className="relative inline-block">
              <div className="w-28 h-28 mx-auto rounded-3xl bg-gradient-to-br from-salmon to-orange-300 shadow-2xl shadow-salmon/40 flex items-center justify-center">
                <Heart className="w-14 h-14 text-white fill-white" strokeWidth={1.5} />
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-teal dark:bg-mint flex items-center justify-center shadow-lg">
                <Zap className="w-5 h-5 text-white dark:text-teal" />
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white tracking-tight">
                Olá! Bem-vinda ao{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-salmon to-orange-400">
                  LipWell
                </span>
              </h1>
              <p className="text-gray-500 dark:text-gray-400 text-lg leading-relaxed max-w-sm mx-auto">
                Vamos preparar sua experiência personalizada para que a Coach IA cuide de você da melhor forma.
              </p>
            </div>

            {/* Bullets de valor */}
            <div className="grid grid-cols-1 gap-3 text-left max-w-xs mx-auto">
              {[
                { icon: <Activity className="w-4 h-4 text-teal" />, text: "Diário de saúde inteligente" },
                { icon: <Heart className="w-4 h-4 text-salmon" />, text: "Relatórios personalizados de IA" },
                { icon: <Zap className="w-4 h-4 text-amber-500" />, text: "Insights anti-inflamatórios" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 bg-white/70 dark:bg-white/5 rounded-2xl px-4 py-3 shadow-sm">
                  {item.icon}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{item.text}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <button
              onClick={() => setStep(1)}
              className="w-full max-w-xs mx-auto flex items-center justify-center gap-3 bg-gradient-to-r from-salmon to-orange-400 text-white font-bold text-lg py-4 rounded-2xl shadow-xl shadow-salmon/30 hover:opacity-90 active:scale-[0.98] transition-all"
            >
              Começar Minha Jornada
              <ChevronRight className="w-6 h-6" />
            </button>
            <p className="text-xs text-gray-400">Leva menos de 2 minutos ✨</p>
          </div>
        )}

        {/* ── Passos 1–3: Formulário ────────────────────────────────────── */}
        {step >= 1 && step <= 3 && (
          <div className="bg-white dark:bg-dark-card rounded-3xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Barra de progresso */}
            <div className="flex h-1.5 bg-gray-100 dark:bg-white/10">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`flex-1 transition-all duration-500 ${step >= s ? "bg-gradient-to-r from-salmon to-orange-400" : ""}`}
                />
              ))}
            </div>

            <div className="p-8">
              {/* Cabeçalho do passo */}
              <div className="mb-8 text-center">
                <span className="text-xs font-bold text-salmon uppercase tracking-widest">
                  Passo {step} de 3
                </span>
              </div>

              {/* ── Conteúdo do Passo 1 ── */}
              {step === 1 && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-400">
                  <div className="text-center space-y-1 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-salmon/10 flex items-center justify-center mx-auto mb-3">
                      <User className="w-6 h-6 text-salmon" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Seus dados básicos</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Usamos apenas para personalizar sua experiência.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">WhatsApp / Celular</label>
                    <div className="relative">
                      <Phone className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-salmon focus:outline-none focus:border-salmon transition-colors"
                        placeholder="(11) 99999-9999"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Data de Nascimento</label>
                    <div className="relative">
                      <Calendar className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl text-gray-800 dark:text-white focus:ring-2 focus:ring-salmon focus:outline-none focus:border-salmon transition-colors"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Conteúdo do Passo 2 ── */}
              {step === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
                  <div className="text-center space-y-1 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-teal/10 flex items-center justify-center mx-auto mb-3">
                      <Activity className="w-6 h-6 text-teal dark:text-mint" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Estágio do Lipedema</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Selecione o nível em que você se encontra hoje.</p>
                  </div>

                  {STAGES.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setStage(opt.value)}
                      className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 flex items-start gap-4 ${
                        stage === opt.value
                          ? "border-teal bg-teal/5 dark:bg-teal/10"
                          : "border-gray-100 dark:border-white/8 hover:border-teal/30 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                        stage === opt.value ? "bg-teal text-white" : "bg-gray-100 dark:bg-white/10 text-gray-400"
                      }`}>
                        {opt.icon}
                      </div>
                      <div>
                        <p className={`font-bold text-sm ${stage === opt.value ? "text-teal dark:text-mint" : "text-gray-700 dark:text-gray-200"}`}>
                          {opt.label}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 leading-snug">{opt.description}</p>
                      </div>
                      {stage === opt.value && (
                        <CheckCircle className="w-5 h-5 text-teal dark:text-mint ml-auto shrink-0 mt-2.5" />
                      )}
                    </button>
                  ))}
                </div>
              )}

              {/* ── Conteúdo do Passo 3 ── */}
              {step === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-400">
                  <div className="text-center space-y-1 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-salmon/10 flex items-center justify-center mx-auto mb-3">
                      <MapPin className="w-6 h-6 text-salmon" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Onde mais dói e incha?</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">A IA focará no combate à inflamação nessa região.</p>
                  </div>

                  <div className="grid grid-cols-1 gap-3">
                    {PAIN_AREAS.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => setPain(opt.value)}
                        className={`w-full text-left px-5 py-4 rounded-2xl border-2 transition-all duration-200 flex items-center gap-4 ${
                          pain === opt.value
                            ? "border-salmon bg-salmon/5 dark:bg-salmon/10"
                            : "border-gray-100 dark:border-white/8 hover:border-salmon/30 hover:bg-gray-50 dark:hover:bg-white/5"
                        }`}
                      >
                        <div className="text-2xl w-10 text-center shrink-0">{opt.emoji}</div>
                        <div className="flex-1">
                          <p className={`font-bold text-sm ${pain === opt.value ? "text-salmon" : "text-gray-700 dark:text-gray-200"}`}>
                            {opt.label}
                          </p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{opt.description}</p>
                        </div>
                        {pain === opt.value && (
                          <CheckCircle className="w-5 h-5 text-salmon ml-auto shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões de navegação */}
              <div className="mt-8 flex items-center justify-between gap-4">
                <button
                  onClick={prevStep}
                  disabled={step === 1 || loading}
                  className="px-6 py-3 rounded-xl font-bold text-gray-500 dark:text-gray-400 disabled:opacity-0 disabled:pointer-events-none hover:bg-gray-100 dark:hover:bg-white/5 transition-colors"
                >
                  Voltar
                </button>

                <button
                  onClick={nextStep}
                  disabled={loading}
                  className="flex-1 max-w-[220px] bg-gradient-to-r from-salmon to-orange-400 hover:opacity-90 text-white px-8 py-3.5 rounded-xl font-bold transition-all active:scale-95 flex items-center justify-center gap-2 shadow-lg shadow-salmon/30"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : step < 3 ? (
                    <>Avançar <ArrowRight className="w-5 h-5" /></>
                  ) : (
                    <>Concluir ✨</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
