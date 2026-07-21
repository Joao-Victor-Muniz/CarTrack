import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function DetalhesVeiculo() {
  const navigate = useNavigate();
  const { id } = useParams();
  
  const [veiculo, setVeiculo] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchVeiculo();
  }, [id]);

  const fetchVeiculo = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('veiculos')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setVeiculo(data);

      const { data: rData } = await supabase
        .from('registros')
        .select('*')
        .eq('veiculo_id', id)
        .order('data_registro', { ascending: false });
        
      if (rData) setRegistros(rData);
    } catch (err) {
      console.error(err);
      setError('Erro ao carregar detalhes do veículo.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app-bg text-app-accent">
        <i className="fas fa-spinner fa-spin text-3xl"></i>
      </div>
    );
  }

  if (error || !veiculo) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-app-bg px-5">
        <i className="fas fa-car-burst text-app-textMuted text-5xl mb-4"></i>
        <h2 className="text-white text-xl font-bold mb-2">Veículo não encontrado</h2>
        <button onClick={() => navigate('/')} className="text-app-accent font-bold mt-4 underline">
          Voltar para Home
        </button>
      </div>
    );
  }

  const getIcon = (tipo) => {
    switch (tipo) {
      case 'combustivel': return { icon: 'fa-gas-pump', color: 'text-app-accent', bg: 'bg-[#1c180b]', border: 'border-app-accent/20' };
      case 'manutencao': return { icon: 'fa-wrench', color: 'text-orange-400', bg: 'bg-app-cardInner', border: 'border-app-border' };
      case 'lavagem': return { icon: 'fa-droplet', color: 'text-yellow-600', bg: 'bg-app-cardInner', border: 'border-app-border' };
      case 'revisao': return { icon: 'fa-shield-halved', color: 'text-green-500', bg: 'bg-[#0a1f10]', border: 'border-green-500/20' };
      default: return { icon: 'fa-file', color: 'text-white', bg: 'bg-app-cardInner', border: 'border-app-border' };
    }
  };

  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const registrosMes = registros.filter(r => {
    if(!r.data_registro) return false;
    const d = new Date(r.data_registro);
    // Prevent timezone offset issue
    const dLocal = new Date(d.getTime() + d.getTimezoneOffset() * 60000);
    return dLocal.getMonth() === currentMonth && dLocal.getFullYear() === currentYear;
  });
  
  const gastoMes = registrosMes.reduce((acc, r) => acc + (r.valor || 0), 0);
  const calculateRealConsumo = (regs) => {
    const abastecimentos = regs
      .filter(r => r.tipo === 'combustivel' && r.hodometro && r.litros)
      .sort((a, b) => a.hodometro - b.hodometro);
      
    let startOdo = null;
    let totalKm = 0;
    let totalLiters = 0;
    let accLiters = 0;

    for (const r of abastecimentos) {
      if (r.tanque_cheio) {
        if (startOdo !== null && r.hodometro > startOdo) {
          totalKm += (r.hodometro - startOdo);
          totalLiters += accLiters + r.litros;
        }
        startOdo = r.hodometro;
        accLiters = 0;
      } else {
        if (startOdo !== null) {
          accLiters += r.litros;
        }
      }
    }
    
    if (totalLiters > 0 && totalKm > 0) {
      return (totalKm / totalLiters).toFixed(1);
    }
    return '--';
  };

  const consumoMedio = calculateRealConsumo(registros);

  return (
    <>
      {/* Cabeçalho (Header) */}
      <header className="flex justify-between items-center p-5 pt-6 bg-app-bg z-10">
          <div className="flex items-center gap-3">
              <button 
                onClick={() => navigate('/')} 
                className="w-10 h-10 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95"
              >
                  <i className="fas fa-arrow-left text-white text-sm"></i>
              </button>
              <div>
                  <h1 className="text-lg font-bold text-white tracking-tight">{veiculo.marca} {veiculo.modelo}</h1>
                  <p className="text-[11px] text-app-textMuted font-medium uppercase tracking-wider">{veiculo.placa}</p>
              </div>
          </div>
          <button onClick={() => navigate('/notificacoes')} className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center relative transition active:scale-95">
              <i className="far fa-bell text-app-textMuted text-sm"></i>
              {/* <span className="absolute top-2 right-2 w-2 h-2 bg-app-accent rounded-full border border-app-card"></span> */}
          </button>
      </header>

      {/* Conteúdo Principal */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-32">
          
          {/* Cartão Principal do Veículo */}
          <div className="bg-gradient-to-br from-[#2a2000] to-app-card border border-[#403000] rounded-3xl p-5 mb-4 shadow-lg relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                  {/* Etiqueta de Ativo */}
                  <div className="inline-flex items-center gap-1.5 bg-green-500/10 text-green-500 border border-green-500/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Veículo Ativo
                  </div>
                  <button onClick={() => navigate(`/editar-veiculo/${veiculo.id}`)} className="w-8 h-8 rounded-full bg-black/30 flex items-center justify-center transition active:scale-95 hover:bg-black/50">
                      <i className="fas fa-sliders-h text-app-textMuted text-xs"></i>
                  </button>
              </div>
              
              <h2 className="font-bold text-2xl text-white tracking-tight">{veiculo.marca} {veiculo.modelo}</h2>
              <p className="text-xs text-app-textMuted mt-1">{veiculo.ano} • {veiculo.cor} • {veiculo.placa}</p>

              {/* 3 Blocos de Informação */}
              <div className="grid grid-cols-3 gap-2 mt-6">
                  <div className="bg-[#0A0A0A]/60 rounded-2xl p-3 border border-white/5">
                      <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1">Hodômetro</p>
                      <p className="font-bold text-sm text-white">{veiculo.hodometro} <span className="text-[10px] font-normal text-app-textMuted">km</span></p>
                  </div>
                  <div className="bg-[#0A0A0A]/60 rounded-2xl p-3 border border-white/5">
                      <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1">Combustível</p>
                      <p className="font-bold text-sm text-white truncate">{veiculo.combustivel_base}</p>
                  </div>
                  <div className="bg-[#0A0A0A]/60 rounded-2xl p-3 border border-white/5">
                      <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1">Tanque</p>
                      <p className="font-bold text-sm text-white">{veiculo.tanque_litros || '--'} <span className="text-[10px] font-normal text-app-textMuted">L</span></p>
                  </div>
              </div>
          </div>

          {/* Gasto e Consumo */}
          <div className="grid grid-cols-2 gap-3 mb-6">
              {/* Gasto */}
              <div className="bg-app-card border border-app-border rounded-2xl p-4">
                  <p className="text-[10px] text-app-textMuted font-semibold flex items-center gap-1.5 mb-2">
                      <i className="fas fa-arrow-trend-up text-app-accent"></i> Gasto do mês
                  </p>
                  <p className="font-bold text-xl text-white mb-1">
                    {gastoMes > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(gastoMes) : 'R$ --'}
                  </p>
              </div>
              {/* Consumo */}
              <div className="bg-app-card border border-app-border rounded-2xl p-4">
                  <p className="text-[10px] text-app-textMuted font-semibold flex items-center gap-1.5 mb-2">
                      <i className="fas fa-gas-pump text-app-accent"></i> Consumo médio
                  </p>
                  <p className="font-bold text-xl text-white mb-1">{consumoMedio} km/L</p>
              </div>
          </div>

          {/* Secção: REGISTRAR */}
          <div className="mb-8">
              <h3 className="text-[11px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-3">Registrar</h3>
              <div className="grid grid-cols-4 gap-2">
                  <button onClick={() => navigate(`/novo-registro/${veiculo.id}`, { state: { type: 'combustivel' } })} className="flex flex-col items-center gap-2 group">
                      <div className="w-[70px] h-[60px] bg-app-card border border-app-border rounded-2xl flex items-center justify-center transition group-active:scale-95">
                          <i className="fas fa-gas-pump text-app-accent text-lg"></i>
                      </div>
                      <span className="text-[10px] font-semibold text-white">Combustível</span>
                  </button>
                  <button onClick={() => navigate(`/novo-registro/${veiculo.id}`, { state: { type: 'manutencao' } })} className="flex flex-col items-center gap-2 group">
                      <div className="w-[70px] h-[60px] bg-app-card border border-app-border rounded-2xl flex items-center justify-center transition group-active:scale-95">
                          <i className="fas fa-wrench text-orange-400 text-lg"></i>
                      </div>
                      <span className="text-[10px] font-semibold text-white">Manutenção</span>
                  </button>
                  <button onClick={() => navigate(`/novo-registro/${veiculo.id}`, { state: { type: 'lavagem' } })} className="flex flex-col items-center gap-2 group">
                      <div className="w-[70px] h-[60px] bg-app-card border border-app-border rounded-2xl flex items-center justify-center transition group-active:scale-95">
                          <i className="fas fa-hand-holding-water text-yellow-600 text-lg"></i>
                      </div>
                      <span className="text-[10px] font-semibold text-white">Lavagem</span>
                  </button>
                  <button onClick={() => navigate(`/novo-registro/${veiculo.id}`, { state: { type: 'revisao' } })} className="flex flex-col items-center gap-2 group">
                      <div className="w-[70px] h-[60px] bg-app-card border border-app-border rounded-2xl flex items-center justify-center transition group-active:scale-95">
                          <i className="fas fa-shield-halved text-green-500 text-lg"></i>
                      </div>
                      <span className="text-[10px] font-semibold text-white">Revisão</span>
                  </button>
              </div>
          </div>

          {/* Secção: Histórico (Em breve será dinâmico) */}
          <div className="mb-4">
              <div className="flex justify-between items-end mb-5">
                  <div>
                      <h3 className="text-lg font-bold text-white">Histórico</h3>
                      <p className="text-[11px] text-app-textMuted">Todos os eventos do seu veículo</p>
                  </div>
                  <button onClick={() => navigate(`/historico/${veiculo.id}`)} className="text-[11px] text-app-accent font-semibold transition">Ver tudo</button>
              </div>

              {/* Lista em Linha do Tempo */}
              <div className="flex flex-col gap-3">
                  {registros.length === 0 ? (
                    <div className="text-center py-6 bg-app-card/30 rounded-2xl border border-app-border border-dashed">
                      <p className="text-app-textMuted text-xs">Nenhum histórico registrado ainda.</p>
                    </div>
                  ) : (
                    registros.slice(0, 3).map((registro, idx) => {
                      const conf = getIcon(registro.tipo);
                      const isCombustivel = registro.tipo === 'combustivel';
                      const dataObj = new Date(registro.data_registro);
                      const dataLocal = new Date(dataObj.getTime() + dataObj.getTimezoneOffset() * 60000);
                      
                      return (
                        <div key={registro.id} onClick={() => navigate(`/historico/${veiculo.id}`)} className="relative timeline-item cursor-pointer group active:scale-[0.98] transition">
                            {idx !== Math.min(registros.length, 3) - 1 && (
                              <div className="absolute left-[38px] -bottom-4 w-px h-4 bg-app-border z-0 timeline-connector"></div>
                            )}
                            <div className="relative z-10 bg-app-card border border-app-border rounded-2xl p-4 shadow-sm group-hover:border-white/10">
                                <div className="flex gap-3">
                                    <div className={`w-11 h-11 rounded-full ${conf.bg} border ${conf.border} flex items-center justify-center ${conf.color} flex-shrink-0`}>
                                        <i className={`fas ${conf.icon} text-sm`}></i>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-bold text-app-textMuted uppercase tracking-widest">{registro.tipo}</span>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-[14px] text-white">
                                                  {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(registro.valor)}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex justify-between items-start mt-0.5">
                                            <h4 className="font-bold text-white text-[12px] leading-tight mt-0.5">
                                              {registro.servico_executado || registro.tipo_lavagem || (isCombustivel ? `Abastecimento ${registro.tipo_combustivel || ''}` : 'Registro')}
                                            </h4>
                                            <p className="text-[9px] text-app-textMuted whitespace-nowrap ml-2 mt-0.5">
                                              {dataLocal.toLocaleDateString('pt-BR')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                      );
                    })
                  )}
              </div>
          </div>

      </main>

      {/* Botão Flutuante (Novo Registro) */}
      <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
          <button onClick={() => navigate(`/novo-registro/${veiculo.id}`)} className="pointer-events-auto bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-3.5 px-8 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2">
              <i className="fas fa-plus text-base"></i>
              Novo registro
          </button>
      </div>
    </>
  );
}
