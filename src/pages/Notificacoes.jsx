import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Notificacoes() {
  const navigate = useNavigate();

  const [notificacoes, setNotificacoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotificacoes();
  }, []);

  const fetchNotificacoes = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setNotificacoes(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLerTudo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('user_id', user.id)
        .eq('lida', false);
      
      fetchNotificacoes();
    } catch (err) {
      console.error(err);
    }
  };

  const getIcon = (tipo) => {
    switch(tipo?.toLowerCase()) {
      case 'alerta': return { icon: 'fa-triangle-exclamation', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-app-accent/30' };
      case 'info': return { icon: 'fa-bullhorn', color: 'text-blue-400', bg: 'bg-blue-500/10', border: 'border-app-border' };
      case 'sucesso': return { icon: 'fa-check-circle', color: 'text-green-500', bg: 'bg-green-500/10', border: 'border-app-border' };
      default: return { icon: 'fa-bell', color: 'text-app-accent', bg: 'bg-[#1c180b]', border: 'border-app-border' };
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app-bg text-app-accent">
        <i className="fas fa-spinner fa-spin text-3xl"></i>
      </div>
    );
  }

  return (
    <>
        <header className="flex justify-between items-center p-5 pt-6 bg-app-bg z-10 border-b border-app-border">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95">
                    <i className="fas fa-arrow-left text-white text-sm"></i>
                </button>
                <h1 className="text-lg font-bold text-white tracking-tight">Notificações</h1>
            </div>
            <button onClick={handleLerTudo} className="text-[10px] font-bold text-app-accent uppercase tracking-widest transition active:scale-95 hover:text-white">
                Ler tudo
            </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-20">
            {notificacoes.length === 0 && (
                <div className="text-center py-10 bg-app-card/30 rounded-2xl border border-app-border border-dashed mb-6">
                    <p className="text-app-textMuted text-xs">Nenhuma notificação.</p>
                </div>
            )}
            
            <div className="flex flex-col gap-3 mb-6">
                {notificacoes.map(n => {
                    const conf = getIcon(n.tipo);
                    const dataObj = n.created_at ? new Date(n.created_at) : new Date();
                    return (
                        <div key={n.id} className={`bg-app-card border ${!n.lida ? 'border-app-accent/30' : 'border-app-border opacity-70'} rounded-2xl p-4 flex gap-4 items-start relative transition active:scale-[0.98] hover:opacity-100`}>
                            {!n.lida && <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-app-accent"></div>}
                            
                            <div className={`w-10 h-10 rounded-full ${conf.bg} flex items-center justify-center ${conf.color} flex-shrink-0 mt-0.5`}>
                                <i className={`fas ${conf.icon} text-sm`}></i>
                            </div>
                            <div className="flex-1 pr-6">
                                <h4 className="font-bold text-white text-[13px] leading-tight mb-1">{n.titulo}</h4>
                                <p className="text-[11px] text-app-textMuted leading-relaxed">
                                    {n.mensagem}
                                </p>
                                <p className="text-[9px] text-app-textMuted mt-2 font-medium">{dataObj.toLocaleDateString('pt-BR')} às {dataObj.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
            
        </main>
    </>
  );
}
