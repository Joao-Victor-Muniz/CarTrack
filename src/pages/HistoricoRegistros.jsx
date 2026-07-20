import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function HistoricoRegistros() {
  const navigate = useNavigate();
  const { veiculoId } = useParams();
  
  const [veiculo, setVeiculo] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState('Todos');

  useEffect(() => {
    fetchData();
  }, [veiculoId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (veiculoId) {
        // Fetch veiculo
        const { data: vData } = await supabase
          .from('veiculos')
          .select('*')
          .eq('id', veiculoId)
          .single();
        if (vData) setVeiculo(vData);

        // Fetch registros
        const { data: rData } = await supabase
          .from('registros')
          .select('*')
          .eq('veiculo_id', veiculoId)
          .order('data', { ascending: false });
        if (rData) setRegistros(rData);
      } else {
        // Fetch ALL registros if no veiculoId
        const { data: { user } } = await supabase.auth.getUser();
        const { data: rData } = await supabase
          .from('registros')
          .select('*')
          .eq('user_id', user.id)
          .order('data', { ascending: false });
        if (rData) setRegistros(rData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRegistros = registros.filter(r => {
    if (filterType === 'Todos') return true;
    return r.tipo.toLowerCase() === filterType.toLowerCase();
  });

  const totalValor = filteredRegistros.reduce((acc, r) => acc + (r.valor || 0), 0);

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'combustivel': return { icon: 'fa-gas-pump', color: 'text-app-accent', bg: 'bg-[#1c180b]', border: 'border-app-accent/20' };
      case 'manutencao': return { icon: 'fa-wrench', color: 'text-orange-400', bg: 'bg-app-cardInner', border: 'border-app-border' };
      case 'lavagem': return { icon: 'fa-droplet', color: 'text-yellow-600', bg: 'bg-app-cardInner', border: 'border-app-border' };
      case 'revisao': return { icon: 'fa-shield-halved', color: 'text-green-500', bg: 'bg-[#0a1f10]', border: 'border-green-500/20' };
      default: return { icon: 'fa-file', color: 'text-white', bg: 'bg-app-cardInner', border: 'border-app-border' };
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
                    <h1 className="text-lg font-bold text-white tracking-tight">Histórico</h1>
                    {veiculo && <p className="text-[11px] text-app-textMuted font-medium">{veiculo.marca} {veiculo.modelo}</p>}
                    {!veiculo && <p className="text-[11px] text-app-textMuted font-medium">Todos os veículos</p>}
                </div>
            </div>
            <button className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center transition active:scale-95">
                <i className="fas fa-filter text-app-textMuted text-sm"></i>
            </button>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-32">
            <div className="bg-gradient-to-br from-[#1a1a1a] to-app-card border border-app-border rounded-2xl p-4 mb-6 flex justify-between items-center shadow-lg">
                <div>
                    <p className="text-[10px] text-app-textMuted font-semibold uppercase tracking-widest mb-1">Gasto Total (Filtro)</p>
                    <p className="font-bold text-xl text-white">
                        {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalValor)}
                    </p>
                </div>
                <div className="text-right">
                    <p className="text-[10px] text-app-textMuted font-semibold uppercase tracking-widest mb-1">Registros</p>
                    <p className="font-bold text-xl text-white">{filteredRegistros.length}</p>
                </div>
            </div>

            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
                {['Todos', 'Combustível', 'Manutenção', 'Lavagem', 'Revisão'].map(f => (
                  <button 
                    key={f}
                    onClick={() => setFilterType(f)}
                    className={`px-4 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap border ${filterType === f ? 'bg-app-card border-app-accent text-white' : 'bg-app-bg border-app-border text-app-textMuted'}`}
                  >
                    {f}
                  </button>
                ))}
            </div>

            <div className="flex flex-col gap-4">
                {filteredRegistros.length === 0 ? (
                  <div className="text-center py-10 bg-app-card/30 rounded-2xl border border-app-border border-dashed">
                      <p className="text-app-textMuted text-xs">Nenhum registro encontrado.</p>
                  </div>
                ) : (
                  filteredRegistros.map((registro, idx) => {
                    const conf = getIcon(registro.tipo);
                    const isCombustivel = registro.tipo === 'combustivel';
                    const dataObj = new Date(registro.data);
                    // Prevent timezone offset issue
                    const dataLocal = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);

                    return (
                      <div key={registro.id} className="relative timeline-item">
                          {idx !== filteredRegistros.length - 1 && (
                            <div className="absolute left-[38px] -bottom-4 w-px h-4 bg-app-border z-0 timeline-connector"></div>
                          )}
                          <div className="relative z-10 bg-app-card border border-app-border rounded-2xl p-4 shadow-sm">
                              <div className="flex gap-3 mb-3">
                                  <div className={`w-11 h-11 rounded-full ${conf.bg} border ${conf.border} flex items-center justify-center ${conf.color} flex-shrink-0`}>
                                      <i className={`fas ${conf.icon} text-sm`}></i>
                                  </div>
                                  <div className="flex-1">
                                      <div className="flex justify-between items-start">
                                          <div className="flex items-center gap-2">
                                              <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">{registro.tipo}</span>
                                          </div>
                                          <div className="text-right">
                                              <p className="font-bold text-[15px] text-white">
                                                {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(registro.valor)}
                                              </p>
                                          </div>
                                      </div>
                                      <div className="flex justify-between items-start mt-0.5">
                                          <h4 className="font-bold text-white text-[13px] leading-tight mt-0.5">
                                            {registro.servico_executado || registro.tipo_lavagem || (isCombustivel ? `Abastecimento ${registro.tipo_combustivel || ''}` : 'Registro')}
                                          </h4>
                                          <p className="text-[10px] text-app-textMuted whitespace-nowrap ml-2 mt-0.5">
                                            {dataLocal.toLocaleDateString('pt-BR')}
                                          </p>
                                      </div>
                                      
                                      {/* Specific details */}
                                      {isCombustivel && registro.litros && (
                                        <p className="text-[11px] text-app-textMuted mt-0.5">{registro.litros} L {registro.preco_litro ? `• R$ ${registro.preco_litro.toFixed(2).replace('.', ',')}/L` : ''}</p>
                                      )}
                                      {!isCombustivel && registro.local && (
                                        <p className="text-[11px] text-app-textMuted mt-0.5">{registro.local}</p>
                                      )}
                                  </div>
                              </div>
                              
                              {(registro.observacoes || (isCombustivel && registro.local)) && (
                                <div className="bg-[#0A0A0A]/80 rounded-xl p-2.5 flex items-center gap-2 text-[11px] text-app-textMuted font-medium border border-white/5">
                                    <i className="fas fa-location-dot text-app-accent"></i>
                                    <span>{registro.observacoes || registro.local}</span>
                                </div>
                              )}
                          </div>
                      </div>
                    );
                  })
                )}
            </div>
        </main>

        <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
            <Link to={veiculoId ? `/novo-registro/${veiculoId}` : '/'} className="pointer-events-auto bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2">
                <i className="fas fa-plus text-base"></i>
                Novo registro
            </Link>
        </div>
    </>
  );
}
