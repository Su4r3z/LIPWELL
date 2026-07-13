import { FoodCategory } from '@/types';

export interface FoodItem {
  id: string;
  name: string;
  category: FoodCategory;
  isAntiInflammatory: boolean;
}

export const FOOD_LIST: FoodItem[] = [
  // Proteínas
  { id: 'p1', name: 'Ovos', category: 'proteinas', isAntiInflammatory: true },
  { id: 'p2', name: 'Peixe (Salmão/Sardinha)', category: 'proteinas', isAntiInflammatory: true },
  { id: 'p3', name: 'Frango Grelhado', category: 'proteinas', isAntiInflammatory: true },
  { id: 'p4', name: 'Carne Magra', category: 'proteinas', isAntiInflammatory: false },
  { id: 'p5', name: 'Tofu / Soja', category: 'proteinas', isAntiInflammatory: true },
  { id: 'p6', name: 'Whey Protein Isolado', category: 'proteinas', isAntiInflammatory: true },
  { id: 'p7', name: 'Queijo Curado', category: 'proteinas', isAntiInflammatory: false },

  // Carboidratos Funcionais
  { id: 'c1', name: 'Batata Doce', category: 'carboidratos', isAntiInflammatory: true },
  { id: 'c2', name: 'Mandioca / Aipim', category: 'carboidratos', isAntiInflammatory: true },
  { id: 'c3', name: 'Arroz Integral', category: 'carboidratos', isAntiInflammatory: true },
  { id: 'c4', name: 'Quinoa', category: 'carboidratos', isAntiInflammatory: true },
  { id: 'c5', name: 'Aveia', category: 'carboidratos', isAntiInflammatory: true },
  { id: 'c6', name: 'Arroz Branco', category: 'carboidratos', isAntiInflammatory: false },
  { id: 'c7', name: 'Pão Integral', category: 'carboidratos', isAntiInflammatory: false },
  { id: 'c8', name: 'Pão Francês', category: 'carboidratos', isAntiInflammatory: false },
  { id: 'c9', name: 'Pão Sem Glúten', category: 'carboidratos', isAntiInflammatory: true },

  // Verduras e Legumes
  { id: 'v1', name: 'Brócolis', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v2', name: 'Couve-flor', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v3', name: 'Espinafre / Folhas Escuras', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v4', name: 'Cenoura', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v5', name: 'Abobrinha', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v6', name: 'Berinjela', category: 'verduras_legumes', isAntiInflammatory: true },
  { id: 'v7', name: 'Tomate', category: 'verduras_legumes', isAntiInflammatory: true }, // Pode gerar sensibilidade, mas entra como veg
  { id: 'v8', name: 'Alface', category: 'verduras_legumes', isAntiInflammatory: true },

  // Frutas (Foco antioxidante)
  { id: 'f1', name: 'Frutas Vermelhas (Morango, Mirtilo)', category: 'frutas', isAntiInflammatory: true },
  { id: 'f2', name: 'Maçã', category: 'frutas', isAntiInflammatory: true },
  { id: 'f3', name: 'Limão / Cítricas', category: 'frutas', isAntiInflammatory: true },
  { id: 'f4', name: 'Abacate', category: 'frutas', isAntiInflammatory: true },
  { id: 'f5', name: 'Coco', category: 'frutas', isAntiInflammatory: true },
  { id: 'f6', name: 'Banana', category: 'frutas', isAntiInflammatory: false },
  { id: 'f7', name: 'Mamão', category: 'frutas', isAntiInflammatory: true },
  { id: 'f8', name: 'Uva (Com casca)', category: 'frutas', isAntiInflammatory: true },

  // Gorduras Boas e Sementes
  { id: 'g1', name: 'Azeite de Oliva Extra Virgem', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g2', name: 'Semente de Chia', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g3', name: 'Semente de Linhaça', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g4', name: 'Semente de Abóbora', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g5', name: 'Castanha / Nozes', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g6', name: 'Óleo de Coco', category: 'gorduras_boas', isAntiInflammatory: true },
  { id: 'g7', name: 'Manteiga Ghee', category: 'gorduras_boas', isAntiInflammatory: true },

  // Líquidos
  { id: 'l1', name: 'Água', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l2', name: 'Água com Gás', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l3', name: 'Chá Verde', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l4', name: 'Chá de Cavalinha', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l5', name: 'Chá de Hibisco', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l6', name: 'Café (Puro)', category: 'liquidos', isAntiInflammatory: true }, // em moderação
  { id: 'l7', name: 'Kombucha', category: 'liquidos', isAntiInflammatory: true },
  { id: 'l8', name: 'Sucesso de Caixinha', category: 'liquidos', isAntiInflammatory: false },
  { id: 'l9', name: 'Refrigerante Normal', category: 'liquidos', isAntiInflammatory: false },
  { id: 'l10', name: 'Refrigerante Zero', category: 'liquidos', isAntiInflammatory: false },

  // Extras (Gatilhos comuns)
  { id: 'e1', name: 'Bolo / Doce Básico', category: 'extras', isAntiInflammatory: false },
  { id: 'e2', name: 'Chocolate Tradicional', category: 'extras', isAntiInflammatory: false },
  { id: 'e3', name: 'Chocolate de Alta % Cacau', category: 'extras', isAntiInflammatory: true },
  { id: 'e4', name: 'Fast Food', category: 'extras', isAntiInflammatory: false },
  { id: 'e5', name: 'Álcool (Vinho Tinto)', category: 'extras', isAntiInflammatory: false },
  { id: 'e6', name: 'Álcool (Cerveja/Destilados)', category: 'extras', isAntiInflammatory: false },
  { id: 'e7', name: 'Leite de Vaca', category: 'extras', isAntiInflammatory: false },
  { id: 'e8', name: 'Iogurte Natural', category: 'extras', isAntiInflammatory: true }
];

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  proteinas: 'Proteínas 🍳',
  carboidratos: 'Carboidratos Funcionais 🍠',
  verduras_legumes: 'Verduras e Legumes 🥦',
  frutas: 'Frutas 🍓',
  gorduras_boas: 'Gorduras Boas 🥑',
  liquidos: 'Líquidos 🫖',
  extras: 'Extras / Desejos 🍰'
};
