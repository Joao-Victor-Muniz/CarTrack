import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Relatorios() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [registros, setRegistros] = useState([]);
  const [filtro, setFiltro] = useState('Tudo'); // 'Mes', 'Ano', '12M', 'Tudo'

  useEffect(() => {
    fetchDados();
  }, []);

  const fetchDados = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id);

      if (!error && data) {
        setRegistros(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRegistros = () => {
    const now = new Date();
    return registros.filter(r => {
      if (!r.data_registro) return false;
      const dataReg = new Date(r.data_registro);
      if (filtro === 'Mes') {
        return dataReg.getMonth() === now.getMonth() && dataReg.getFullYear() === now.getFullYear();
      }
      if (filtro === 'Ano') {
        return dataReg.getFullYear() === now.getFullYear();
      }
      if (filtro === '12M') {
        const twelveMonthsAgo = new Date();
        twelveMonthsAgo.setFullYear(now.getFullYear() - 1);
        return dataReg >= twelveMonthsAgo;
      }
      return true; // Tudo
    });
  };

  const currentRegistros = getFilteredRegistros();
  const total = currentRegistros.reduce((acc, r) => acc + (r.valor || 0), 0);

  const totalCombustivel = currentRegistros.filter(r => r.tipo === 'combustivel').reduce((acc, r) => acc + (r.valor || 0), 0);
  const totalManutencao = currentRegistros.filter(r => r.tipo === 'manutencao' || r.tipo === 'revisao').reduce((acc, r) => acc + (r.valor || 0), 0);
  const totalServicos = currentRegistros.filter(r => r.tipo === 'lavagem').reduce((acc, r) => acc + (r.valor || 0), 0);
  
  // Custom types could go here (like 'despesas'). For now we assume others go to Upgrades/Outros.
  const totalOutros = total - (totalCombustivel + totalManutencao + totalServicos);

  const getPerc = (val) => total > 0 ? (val / total * 100) : 0;

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
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95">
                <i className="fas fa-arrow-left text-white text-sm"></i>
            </button>
            <div className="text-center">
                <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">Relatório financeiro</h1>
                <p className="text-[10px] text-app-textMuted font-medium mt-0.5">Frota completa</p>
            </div>
            <button className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center transition active:scale-95 text-app-accent">
                <i className="fas fa-file-arrow-down text-sm"></i>
            </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32">
            <div className="flex items-center justify-center gap-2 mb-6 overflow-x-auto no-scrollbar pb-1">
                {['Mes', 'Ano', '12M', 'Tudo'].map(f => (
                    <button 
                        key={f}
                        onClick={() => setFiltro(f)}
                        className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition active:scale-95 ${filtro === f ? 'text-black bg-app-accent shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'text-app-textMuted bg-app-cardInner border border-transparent'}`}
                    >
                        {f === 'Mes' ? 'Este Mês' : f === 'Ano' ? 'Este Ano' : f === '12M' ? '12 meses' : 'Tudo'}
                    </button>
                ))}
            </div>

            <div className="bg-gradient-to-br from-[#1c1a15] to-app-card border border-app-border rounded-3xl p-5 mb-6 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                    <p className="text-[10px] text-app-textMuted font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <i className="fas fa-wallet text-app-accent"></i> Custo Total
                    </p>
                </div>
                <h2 className="font-bold text-[32px] text-white tracking-tight leading-none mb-1">
                    {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(total)}
                </h2>
                <p className="text-[11px] text-app-textMuted">No período selecionado</p>

                <div className="mt-6">
                    <div className="flex justify-between text-[9px] font-bold text-app-textMuted uppercase tracking-wider mb-2">
                        <span>Distribuição de gastos</span>
                        <span>100%</span>
                    </div>
                    
                    <div className="w-full h-3 rounded-full flex overflow-hidden bg-app-cardInner border border-[#333]">
                        <div className="bg-app-accent h-full progress-bar" style={{width: `${getPerc(totalCombustivel)}%`}}></div>
                        <div className="bg-orange-500 h-full progress-bar" style={{width: `${getPerc(totalManutencao)}%`}}></div>
                        <div className="bg-blue-500 h-full progress-bar" style={{width: `${getPerc(totalServicos)}%`}}></div>
                        <div className="bg-purple-500 h-full progress-bar" style={{width: `${getPerc(totalOutros)}%`}}></div>
                    </div>
                    
                    <div className="flex justify-between mt-3 px-1">
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-0.5">
                                <div className="w-2 h-2 rounded-full bg-app-accent"></div>
                                <span className="text-[9px] font-bold text-white">{getPerc(totalCombustivel).toFixed(0)}%</span>
                            </div>
                            <span className="text-[8px] text-app-textMuted">Combustível</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-0.5">
                                <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                                <span className="text-[9px] font-bold text-white">{getPerc(totalManutencao).toFixed(0)}%</span>
                            </div>
                            <span className="text-[8px] text-app-textMuted">Manutenção</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-0.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-[9px] font-bold text-white">{getPerc(totalServicos).toFixed(0)}%</span>
                            </div>
                            <span className="text-[8px] text-app-textMuted">Serviços</span>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="flex items-center gap-1 mb-0.5">
                                <div className="w-2 h-2 rounded-full bg-purple-500"></div>
                                <span className="text-[9px] font-bold text-white">{getPerc(totalOutros).toFixed(0)}%</span>
                            </div>
                            <span className="text-[8px] text-app-textMuted">Outros</span>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-[11px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-4">Detalhamento por categoria</h3>
            
            <div className="flex flex-col gap-3">
                {/* Combustível */}
                <div className="bg-app-card border border-app-border rounded-[20px] p-4 relative overflow-hidden transition active:scale-[0.98]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-app-accent"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#1c180b] border border-app-accent/20 flex items-center justify-center text-app-accent">
                                <i className="fas fa-gas-pump text-sm"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] text-white">Combustível</h4>
                                <p className="text-[10px] text-app-textMuted">{currentRegistros.filter(r => r.tipo === 'combustivel').length} registros</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[15px] text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalCombustivel)}</p>
                            <p className="text-[10px] text-app-accent font-medium">{getPerc(totalCombustivel).toFixed(1)}% do total</p>
                        </div>
                    </div>
                </div>

                {/* Manutenção */}
                <div className="bg-app-card border border-app-border rounded-[20px] p-4 relative overflow-hidden transition active:scale-[0.98]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-orange-500"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-900/20 border border-orange-500/20 flex items-center justify-center text-orange-400">
                                <i className="fas fa-wrench text-sm"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] text-white">Manutenções</h4>
                                <p className="text-[10px] text-app-textMuted">{currentRegistros.filter(r => r.tipo === 'manutencao' || r.tipo === 'revisao').length} registros</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[15px] text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalManutencao)}</p>
                            <p className="text-[10px] text-orange-400 font-medium">{getPerc(totalManutencao).toFixed(1)}% do total</p>
                        </div>
                    </div>
                </div>

                {/* Serviços */}
                <div className="bg-app-card border border-app-border rounded-[20px] p-4 relative overflow-hidden transition active:scale-[0.98]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-900/20 border border-blue-500/20 flex items-center justify-center text-blue-400">
                                <i className="fas fa-droplet text-sm"></i>
                            </div>
                            <div>
                                <h4 className="font-bold text-[13px] text-white">Serviços Gerais</h4>
                                <p className="text-[10px] text-app-textMuted">{currentRegistros.filter(r => r.tipo === 'lavagem').length} registros</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="font-bold text-[15px] text-white">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalServicos)}</p>
                            <p className="text-[10px] text-blue-400 font-medium">{getPerc(totalServicos).toFixed(1)}% do total</p>
                        </div>
                    </div>
                </div>
            </div>
        </main>

        <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
            <button className="pointer-events-auto bg-app-cardInner border border-app-border hover:bg-app-border text-white font-bold text-sm py-3.5 px-8 rounded-full shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fas fa-download text-app-accent text-base"></i>
                Baixar relatório em PDF
            </button>
        </div>
    </>
  );
}
