'use client';

import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Pill, ToggleLeft, ToggleRight } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import toast from 'react-hot-toast';
import { Button } from '@/components/ui/Button';

interface Supplement {
  id: string;
  name: string;
  dosage: string | null;
  schedule: string | null;
  is_active: boolean;
}

const EMPTY: Omit<Supplement, 'id'> = { name: '', dosage: '', schedule: '', is_active: true };

export function SupplementsTab() {
  const supabase = createClient();
  const [items, setItems] = useState<Supplement[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Supplement | null>(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from('supplements')
      .select('id, name, dosage, schedule, is_active')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true });
    setItems(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s: Supplement) => { setEditing(s); setForm({ name: s.name, dosage: s.dosage ?? '', schedule: s.schedule ?? '', is_active: s.is_active }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Nome é obrigatório.'); return; }
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    if (editing) {
      const { error } = await supabase.from('supplements').update({
        name: form.name.trim(),
        dosage: form.dosage?.trim() || null,
        schedule: form.schedule?.trim() || null,
        is_active: form.is_active,
      }).eq('id', editing.id);
      if (error) toast.error('Erro ao salvar.');
      else { toast.success('Suplemento atualizado! ✅'); setModalOpen(false); await load(); }
    } else {
      const { error } = await supabase.from('supplements').insert({
        user_id: user.id,
        name: form.name.trim(),
        dosage: form.dosage?.trim() || null,
        schedule: form.schedule?.trim() || null,
        is_active: form.is_active,
      });
      if (error) toast.error('Erro ao salvar.');
      else { toast.success('Suplemento adicionado! 💊'); setModalOpen(false); await load(); }
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('supplements').delete().eq('id', id);
    if (error) toast.error('Erro ao excluir.');
    else { toast.success('Suplemento removido.'); setItems(prev => prev.filter(s => s.id !== id)); }
    setDeleteId(null);
  };

  const handleToggle = async (s: Supplement) => {
    const newVal = !s.is_active;
    await supabase.from('supplements').update({ is_active: newVal }).eq('id', s.id);
    setItems(prev => prev.map(x => x.id === s.id ? { ...x, is_active: newVal } : x));
  };

  if (loading) return <div className="py-12 text-center text-gray-400 text-sm">Carregando suplementos...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Suplementação</h2>
          <p className="text-sm text-gray-500 mt-1">Gerencie seus suplementos e horários.</p>
        </div>
        <Button variant="primary" size="sm" onClick={openAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Adicionar
        </Button>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-16 h-16 rounded-full bg-mint/20 flex items-center justify-center mx-auto">
            <Pill className="w-8 h-8 text-teal dark:text-mint" />
          </div>
          <p className="font-semibold text-gray-700 dark:text-gray-200">Nenhum suplemento cadastrado</p>
          <p className="text-sm text-gray-400">Adicione seus suplementos para acompanhar sua rotina.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map(s => (
            <div key={s.id} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${s.is_active ? 'bg-white dark:bg-white/5 border-gray-100 dark:border-white/10' : 'bg-gray-50 dark:bg-white/2 border-gray-100 dark:border-white/5 opacity-60'}`}>
              <button onClick={() => handleToggle(s)} className="shrink-0">
                {s.is_active
                  ? <ToggleRight className="w-8 h-8 text-teal dark:text-mint" />
                  : <ToggleLeft className="w-8 h-8 text-gray-300 dark:text-gray-600" />}
              </button>

              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{s.name}</p>
                <div className="flex gap-3 mt-0.5">
                  {s.dosage && <span className="text-xs text-gray-500">{s.dosage}</span>}
                  {s.schedule && <span className="text-xs text-teal dark:text-mint font-medium">🕐 {s.schedule}</span>}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button onClick={() => openEdit(s)} className="p-2 text-gray-400 hover:text-teal dark:hover:text-mint rounded-xl hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <Pencil className="w-4 h-4" />
                </button>
                <button onClick={() => setDeleteId(s.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Adicionar/Editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}>
          <div className="w-full sm:max-w-sm bg-white dark:bg-dark-card rounded-t-3xl sm:rounded-3xl p-6 space-y-4 animate-in slide-in-from-bottom-5 sm:zoom-in-95 duration-300" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-800 dark:text-white">{editing ? 'Editar Suplemento' : 'Novo Suplemento'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-gray-400"><X className="w-5 h-5" /></button>
            </div>

            {/* Nome */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome *</label>
              <input
                type="text"
                placeholder="Ex: Ômega 3"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark focus:ring-2 focus:ring-teal focus:outline-none dark:text-white"
              />
            </div>

            {/* Dosagem */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Dosagem</label>
              <input
                type="text"
                placeholder="Ex: 1000mg"
                value={form.dosage ?? ''}
                onChange={e => setForm(f => ({ ...f, dosage: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark focus:ring-2 focus:ring-teal focus:outline-none dark:text-white"
              />
            </div>

            {/* Horário */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Horário / Momento</label>
              <input
                type="text"
                placeholder="Ex: Manhã, 08:00, Após almoço"
                value={form.schedule ?? ''}
                onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-dark focus:ring-2 focus:ring-teal focus:outline-none dark:text-white"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancelar</Button>
              <Button variant="primary" onClick={handleSave} isLoading={saving} className="flex-1">
                {saving ? 'Salvando...' : 'Salvar'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Confirmação de Exclusão */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm" onClick={() => setDeleteId(null)}>
          <div className="bg-white dark:bg-dark-card max-w-xs w-full rounded-3xl p-6 space-y-4 animate-in zoom-in-95 duration-200 text-center" onClick={e => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6 text-red-500" />
            </div>
            <p className="font-semibold text-gray-800 dark:text-white">Excluir suplemento?</p>
            <p className="text-sm text-gray-500">Essa ação não pode ser desfeita.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-2xl border border-gray-200 dark:border-white/10 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">Cancelar</button>
              <button onClick={() => handleDelete(deleteId!)} className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold hover:bg-red-600 transition-colors">Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
