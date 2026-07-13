'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, Search, ChevronDown, ChevronUp, Check, Plus, Loader2, Star, Clock } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { CATEGORY_LABELS, FOOD_LIST, FoodItem } from '@/lib/constants/foods';
import { FoodCategory, MealName } from '@/types';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';

interface MealModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (selectedItems: FoodItem[]) => Promise<void> | void; // Optional if modal handles save
  initialItems?: FoodItem[];
  title?: string;
  // Para salvar no Supabase nativamente pelo Modal:
  mealName?: MealName;
  diaryEntryId?: string;
  mealOrder?: number;
}

export function MealModal({ isOpen, onClose, onSave, initialItems = [], title = 'Refeição', mealName, diaryEntryId, mealOrder = 1 }: MealModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [openCategory, setOpenCategory] = useState<FoodCategory | null>('proteinas');
  const [isSaving, setIsSaving] = useState(false);
  
  const [favorites, setFavorites] = useState<FoodItem[]>([]);
  const [recents, setRecents] = useState<FoodItem[]>([]);
  const [isFetchingMetadata, setIsFetchingMetadata] = useState(false);
  
  const supabase = createClient();

  const [customFoods, setCustomFoods] = useState<FoodItem[]>([]);
  const [isCustomFoodsOpen, setIsCustomFoodsOpen] = useState(true);

  // Reseta estado e busca favoritos ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSelectedItems(initialItems);
      setSearchTerm('');
      fetchFavoritesAndRecents();
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, initialItems]);

  const fetchFavoritesAndRecents = async () => {
    setIsFetchingMetadata(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setIsFetchingMetadata(false); return; }

    // Busca alimentos customizados criados pela usuária
    const { data: customData } = await supabase
      .from('custom_foods')
      .select('id, name, category, is_anti_inflammatory')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (customData) {
      const mapped: FoodItem[] = customData.slice(0, 5).map(f => ({
        id: `custom-${f.id}`,
        name: f.name,
        category: f.category as FoodItem['category'],
        isAntiInflammatory: f.is_anti_inflammatory,
      }));
      setCustomFoods(mapped);
    }

    setIsFetchingMetadata(false);
  };



  const filteredSearch = useMemo(() => {
    if (!searchTerm) return [];
    const term = searchTerm.toLowerCase();
    
    // Itens da lista padrão que batem com a busca
    const fromList = FOOD_LIST.filter(f => f.name.toLowerCase().includes(term));
    
    // Alimentos customizados da usuária que batem com a busca
    const fromCustom = customFoods.filter(f => f.name.toLowerCase().includes(term));
    
    // Merge: customizados primeiro, depois lista padrão (sem duplicatas)
    const merged = [...fromCustom];
    fromList.forEach(item => {
      if (!merged.some(m => m.name.toLowerCase() === item.name.toLowerCase())) merged.push(item);
    });
    
    return merged;
  }, [searchTerm, customFoods]);

  if (!isOpen) return null;

  const toggleItem = (item: FoodItem) => {
    if (selectedItems.find(i => i.id === item.id)) {
      setSelectedItems(prev => prev.filter(i => i.id !== item.id));
    } else {
      setSelectedItems(prev => [...prev, item]);
    }
  };

  const handleAddCustomItem = async (name: string) => {
    const trimmed = name.trim();
    const custom: FoodItem = {
      id: `custom-${Date.now()}`,
      name: trimmed,
      category: 'extras',
      isAntiInflammatory: false,
    };
    setSelectedItems(prev => [...prev, custom]);
    setCustomFoods(prev => [custom, ...prev.filter(f => f.name.toLowerCase() !== trimmed.toLowerCase())]);
    setSearchTerm('');

    // Salva no banco e classifica com IA
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // 1. Salva primeiro (is_anti_inflammatory=false como default)
      await supabase.from('custom_foods').upsert({
        user_id: user.id,
        name: trimmed,
        category: 'extras',
        is_anti_inflammatory: false,
      }, { onConflict: 'user_id,name' });

      // 2. Chama IA para classificar
      const classRes = await fetch('/api/ai/food-check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ foodName: trimmed, category: 'extras' }),
      });

      if (classRes.ok) {
        const { is_anti_inflammatory, reason } = await classRes.json();

        // 3. Atualiza no banco com a classificação real da IA
        await supabase.from('custom_foods')
          .update({ is_anti_inflammatory })
          .eq('user_id', user.id)
          .eq('name', trimmed);

        // 4. Atualiza em memória para mostrar badge imediatamente
        const classified: FoodItem = { ...custom, isAntiInflammatory: is_anti_inflammatory };
        setSelectedItems(prev => prev.map(i => i.id === custom.id ? classified : i));
        setCustomFoods(prev => prev.map(f => f.id === custom.id ? classified : f));


      }
    } catch (e) {
      console.error('Erro ao salvar alimento customizado:', e);
    }
  };

  const handleSaveWrapper = async () => {
    setIsSaving(true);
    try {
      if (onSave) {
        await onSave(selectedItems);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm sm:p-4 transition-all">
      <div 
        className="w-full h-[90vh] sm:h-auto sm:max-h-[85vh] sm:max-w-xl flex flex-col bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl shadow-modal overflow-hidden animate-in slide-in-from-bottom-5 sm:slide-in-from-bottom-0 sm:fade-in-0 duration-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-dark-border px-5 shrink-0">
          <h2 className="text-xl font-bold text-teal dark:text-mint">{title}</h2>
          <button 
            onClick={onClose}
            className="p-2 -mr-2 text-gray-400 hover:text-salmon dark:hover:text-[#ff9a9e] transition-colors rounded-full hover:bg-gray-100 dark:hover:bg-white/5"
            disabled={isSaving}
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Selected Area */}
        {selectedItems.length > 0 && (
          <div className="bg-mint/10 dark:bg-mint/5 p-4 border-b border-teal/10 shrink-0">
            <p className="text-xs font-bold text-teal uppercase tracking-wider mb-2">Composisão do prato:</p>
            <div className="flex gap-2 flex-wrap max-h-[120px] overflow-y-auto pr-2 custom-scrollbar">
              {selectedItems.map(item => (
                <div 
                  key={`sel-${item.id}`} 
                  onClick={() => toggleItem(item)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-mint text-teal font-medium rounded-full text-sm cursor-pointer shadow-sm active:scale-95 transition-transform"
                >
                  {item.name}
                  <X className="w-4 h-4 ml-1 opacity-60" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="p-4 shrink-0">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text"
              placeholder="Buscar alimento ou bebida..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-12 pr-4 bg-gray-100 dark:bg-dark text-gray-800 dark:text-gray-100 placeholder-gray-500 rounded-2xl border-2 border-transparent focus:border-teal focus:bg-white dark:focus:bg-dark-card focus:outline-none transition-colors"
            />
          </div>
        </div>

        {/* Categories / Search Results - scrollable body */}
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          
          {/* Resultados de Busca */}
          {searchTerm ? (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-gray-500 ml-1">Resultados para "{searchTerm}":</h3>
              {filteredSearch.length === 0 ? (
                <div className="text-center py-10 animate-in fade-in">
                  <p className="text-gray-400 mb-4">Ainda não temos "{searchTerm}" cadastrado.</p>
                  <Button variant="outline" className="border-dashed border-teal/50 text-teal hover:bg-teal/5" onClick={() => handleAddCustomItem(searchTerm)}>
                    <Plus className="w-4 h-4 mr-2"/>
                    Criar "{searchTerm}" e Salvar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {filteredSearch.map(item => {
                      const isSelected = selectedItems.some(i => i.id === item.id);
                      return (
                        <Chip 
                          key={item.id} 
                          selected={isSelected} 
                          onClick={() => toggleItem(item)}
                        >
                          {isSelected && <Check className="w-3.5 h-3.5 mr-1 inline" />}
                          {!isSelected && <Plus className="w-3.5 h-3.5 mr-1 inline opacity-50" />}
                          {item.name}
                        </Chip>
                      );
                    })}
                  </div>
                  
                  {/* Botão de adicionar item customizado se a busca não for perfeitamente exata */}
                  {!filteredSearch.some(f => f.name.toLowerCase() === searchTerm.toLowerCase()) && (
                    <div className="pt-3 border-t border-gray-100 dark:border-white/5 mt-4">
                      <Button variant="ghost" className="w-full text-teal hover:text-teal font-medium hover:bg-teal/5" onClick={() => handleAddCustomItem(searchTerm)}>
                        Não achou exatamente o que queria? <br className="sm:hidden" /> Criar "{searchTerm}"
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4 pb-10">
              
              {/* Usados Recentemente (últimos 5 customizados) */}
              {customFoods.length > 0 && (
                <div className="bg-salmon/5 dark:bg-salmon/10 rounded-2xl overflow-hidden transition-all duration-200">
                  <button
                    onClick={() => setIsCustomFoodsOpen(p => !p)}
                    className="w-full p-4 flex items-center justify-between font-semibold text-salmon"
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Usados Recentemente
                    </span>
                    {isCustomFoodsOpen
                      ? <ChevronUp className="w-5 h-5" />
                      : <ChevronDown className="w-5 h-5" />}
                  </button>
                  {isCustomFoodsOpen && (
                    <div className="px-4 pb-4 pt-1 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="flex flex-wrap gap-2">
                        {customFoods.map(item => {
                          const isSelected = selectedItems.some(i => i.name.toLowerCase() === item.name.toLowerCase());
                          return (
                            <Chip key={item.id} selected={isSelected} onClick={() => toggleItem(item)}>
                              {isSelected && <Check className="w-3.5 h-3.5 mr-1 inline" />}
                              {!isSelected && <Plus className="w-3.5 h-3.5 mr-1 inline opacity-50" />}
                              {item.name}
                            </Chip>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Lista de Categorias (Accordion) */}
              {(Object.keys(CATEGORY_LABELS) as FoodCategory[]).map(category => {
                const isOpen = openCategory === category;
                const itemsInCategory = FOOD_LIST.filter(f => f.category === category);
                
                return (
                  <div key={category} className="bg-gray-50 dark:bg-white/5 rounded-2xl overflow-hidden transition-all duration-200">
                    <button
                      onClick={() => setOpenCategory(isOpen ? null : category)}
                      className="w-full p-4 flex items-center justify-between text-left font-semibold text-gray-700 dark:text-gray-200"
                    >
                      <span>{CATEGORY_LABELS[category]}</span>
                      {isOpen ? (
                        <ChevronUp className="w-5 h-5 text-teal" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                    
                    {isOpen && (
                      <div className="px-4 pb-5 pt-1 animate-in fade-in slide-in-from-top-2 duration-300">
                        <div className="flex flex-wrap gap-2">
                          {itemsInCategory.map(item => {
                            const isSelected = selectedItems.some(i => i.id === item.id);
                            return (
                              <Chip 
                                key={item.id} 
                                selected={isSelected} 
                                onClick={() => toggleItem(item)}
                              >
                                {isSelected && <Check className="w-3.5 h-3.5 mr-1 inline" />}
                                {!isSelected && <Plus className="w-3.5 h-3.5 mr-1 inline opacity-50" />}
                                {item.name}
                              </Chip>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-dark-border bg-white dark:bg-dark-card shrink-0">
          <Button 
            className="w-full h-14 text-lg rounded-2xl bg-teal shadow-btn-fixed"
            onClick={handleSaveWrapper}
            isLoading={isSaving}
          >
            Salvar {selectedItems.length > 0 ? `(${selectedItems.length}) Itens` : 'Refeição em Branco'} ✅
          </Button>
        </div>
        
      </div>
    </div>
  );
}
