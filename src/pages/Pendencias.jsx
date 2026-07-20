import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Pendencias() {
  const navigate = useNavigate();
  const { veiculoId } = useParams();
  
  const [pendencias, setPendencias] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPendencias = async () => {
      setLoading(true);
      try {
        let query = supabase.from('pendencias').select('*');
        if (veiculoId) {
          query = query.eq('veiculo_id', veiculoId);
        } else {
            const { data: { user } } = await supabase.auth.getUser();
            query = query.eq('user_id', user.id);
        }
        
        const { data, error } = await query;
        if (!error && data) {
          setPendencias(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPendencias();
  }, [veiculoId]);

  const vencidas = pendencias.filter(p => p.status === 'vencida' || p.status === 'atrasada');
  const proximas = pendencias.filter(p => p.status === 'proxima');
  const futuras = pendencias.filter(p => p.status === 'programada' || p.status === 'futura');

  const getIcon = (tipo) => {
    switch (tipo?.toLowerCase()) {
      case 'oleo': return { icon: 'fa-oil-can', color: 'text-red-500', bg: 'bg-red-500/10' };
      case 'revisao': return { icon: 'fa-shield-halved', color: 'text-app-accent', bg: 'bg-[#1c180b]' };
      case 'estetica': return { icon: 'fa-droplet', color: 'text-app-textMuted', bg: 'bg-app-cardInner' };
      case 'bateria': return { icon: 'fa-car-battery', color: 'text-app-textMuted', bg: 'bg-app-cardInner' };
      default: return { icon: 'fa-wrench', color: 'text-app-textMuted', bg: 'bg-app-cardInner' };
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
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">Pendências</h1>
                    <p className="text-[11px] text-app-textMuted font-medium">{veiculoId ? 'Veículo Específico' : 'Todos os Veículos'}</p>
                </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center transition active:scale-95 text-app-accent">
                <i className="fas fa-bell text-sm"></i>
            </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32">
            
            {/* Configurações de Alertas */}
            <div className="bg-app-card border border-app-border rounded-2xl p-4 mb-6 shadow-sm">
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-[13px] font-bold text-white flex items-center gap-2"><i className="fas fa-clock text-app-accent"></i> Alertas automáticos</h4>
                        <p className="text-[10px] text-app-textMuted mt-1">Notificar antes do vencimento</p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="w-10 h-6 bg-app-accent rounded-full flex items-center p-1 cursor-pointer transition-colors">
                        <div className="w-4 h-4 bg-black rounded-full shadow-md transform translate-x-4 transition-transform"></div>
                    </div>
                </div>
                <div className="h-px bg-app-border w-full my-3"></div>
                <div className="flex justify-between items-center">
                    <div>
                        <h4 className="text-[13px] font-bold text-white flex items-center gap-2"><i className="fas fa-rotate text-app-accent"></i> Auto-atualização</h4>
                        <p className="text-[10px] text-app-textMuted mt-1">Ajustar prazo pelo hodômetro atual</p>
                    </div>
                    {/* Toggle Switch */}
                    <div className="w-10 h-6 bg-app-accent rounded-full flex items-center p-1 cursor-pointer transition-colors">
                        <div className="w-4 h-4 bg-black rounded-full shadow-md transform translate-x-4 transition-transform"></div>
                    </div>
                </div>
            </div>

            {pendencias.length === 0 && (
              <div className="text-center py-10 bg-app-card/30 rounded-2xl border border-app-border border-dashed mb-6">
                  <p className="text-app-textMuted text-xs">Nenhuma pendência encontrada.</p>
              </div>
            )}

            {/* Vencidas / Críticas */}
            {vencidas.length > 0 && (
                <>
                    <h3 className="text-[11px] font-bold text-red-500 uppercase tracking-[0.15em] mb-3 flex items-center gap-2">
                        <i className="fas fa-triangle-exclamation"></i> Requer atenção
                    </h3>
                    <div className="flex flex-col gap-3 mb-6">
                        {vencidas.map(p => {
                            const conf = getIcon(p.tipo);
                            return (
                                <div key={p.id} className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex gap-4 items-center relative overflow-hidden transition active:scale-[0.98]">
                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500"></div>
                                    <div className={`w-11 h-11 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 flex-shrink-0`}>
                                        <i className={`fas ${conf.icon} text-lg`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="text-[9px] font-bold bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-widest">Atrasada</span>
                                        </div>
                                        <h4 className="font-bold text-white text-[14px]">{p.titulo}</h4>
                                        <p className="text-[11px] text-app-textMuted mt-1">{p.descricao || (p.vencimento_km ? `Venceu aos ${p.vencimento_km} km` : 'Atrasada')}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center transition active:scale-95 shadow-[0_0_10px_rgba(239,68,68,0.3)]">
                                        <i className="fas fa-check text-xs"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Próximas */}
            {proximas.length > 0 && (
                <>
                    <h3 className="text-[11px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-3">Próximas</h3>
                    <div className="flex flex-col gap-3 mb-6">
                        {proximas.map(p => {
                            const conf = getIcon(p.tipo);
                            return (
                                <div key={p.id} className="bg-app-card border border-app-border rounded-2xl p-4 flex gap-4 items-center transition active:scale-[0.98]">
                                    <div className={`w-11 h-11 rounded-full ${conf.bg} border border-app-accent/20 flex items-center justify-center ${conf.color} flex-shrink-0`}>
                                        <i className={`fas ${conf.icon} text-lg`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="text-[10px] font-bold text-app-accent uppercase tracking-widest">{p.tipo || 'Aviso'}</span>
                                        </div>
                                        <h4 className="font-bold text-white text-[14px]">{p.titulo}</h4>
                                        <p className="text-[11px] text-app-textMuted mt-1">{p.descricao}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95 text-app-textMuted hover:text-white">
                                        <i className="fas fa-ellipsis-v text-xs"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}

            {/* Futuro */}
            {futuras.length > 0 && (
                <>
                    <h3 className="text-[11px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-3">Futuro programado</h3>
                    <div className="flex flex-col gap-3">
                        {futuras.map(p => {
                            const conf = getIcon(p.tipo);
                            return (
                                <div key={p.id} className="bg-app-card border border-app-border rounded-2xl p-4 flex gap-4 items-center opacity-60 transition active:scale-[0.98] hover:opacity-100">
                                    <div className={`w-11 h-11 rounded-full ${conf.bg} border border-app-border flex items-center justify-center ${conf.color} flex-shrink-0`}>
                                        <i className={`fas ${conf.icon} text-lg`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start mb-0.5">
                                            <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">{p.tipo || 'Aviso'}</span>
                                        </div>
                                        <h4 className="font-bold text-white text-[14px]">{p.titulo}</h4>
                                        <p className="text-[11px] text-app-textMuted mt-1">{p.descricao}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95 text-app-textMuted hover:text-white">
                                        <i className="fas fa-ellipsis-v text-xs"></i>
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                </>
            )}
            
        </main>

        <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
            <button className="pointer-events-auto bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fas fa-plus text-base"></i>
                Nova pendência
            </button>
        </div>
    </>
  );
}
