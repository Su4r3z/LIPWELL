export const LIPWELL_QUOTES = [
  {
    id: 1,
    text: "Pequenas mudanças no prato de hoje reduzem o inchaço de amanhã. O que vamos escolher?",
    author: "Coach LipWell"
  },
  {
    id: 2,
    text: "Não esconda a sobremesa da gente! Sejamos 100% sinceras para descobrirmos os seus verdadeiros gatilhos.",
    author: "Coach LipWell"
  },
  {
    id: 3,
    text: "Um dia com dor não apaga todo o progresso que você já fez. Mantenha a hidratação alta!",
    author: "Coach LipWell"
  },
  {
    id: 4,
    text: "Água é o principal combustível do sistema linfático. Já bebeu seus 2 litros hoje?",
    author: "Coach LipWell"
  },
  {
    id: 5,
    text: "Seu diário é o seu detetive particular. Anote tudo com sinceridade, mesmo que tenha saído da dieta.",
    author: "Coach LipWell"
  },
  {
    id: 6,
    text: "Inflamação não se mede em culpa, se mede em dados. O que você comeu hoje que te fez bem?",
    author: "Coach LipWell"
  },
  {
    id: 7,
    text: "O corpo leva tempo para curar o que levou anos para inflamar. Paciência e consistência!",
    author: "Coach LipWell"
  },
  {
    id: 8,
    text: "Registros precisos hoje são a diferença entre adivinhar e ter certeza amanhã.",
    author: "Coach LipWell"
  },
  {
    id: 9,
    text: "Me conte os furos na dieta! Sabendo a exceção, eu posso te proteger melhor nos relatórios.",
    author: "Coach LipWell"
  },
  {
    id: 10,
    text: "O descanso é tão anti-inflamatório quanto o melhor dos suplementos. Como está o seu sono?",
    author: "Coach LipWell"
  }
];

export const getDailyQuote = () => {
  // Pega uma frase pseudo-aleatória baseada no dia do ano
  const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 1000 / 60 / 60 / 24);
  return LIPWELL_QUOTES[dayOfYear % LIPWELL_QUOTES.length];
};
