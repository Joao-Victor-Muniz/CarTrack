import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Home() {
  const navigate = useNavigate();
  const [veiculos, setVeiculos] = useState([]);
  const [estatisticas, setEstatisticas] = useState({ gasto: 0, consumo: 0, km: 0 });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [periodo, setPeriodo] = useState(30);

  useEffect(() => {
    fetchData();
  }, [periodo]);

  const fetchData = async () => {
    setLoading(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Busca os veículos
      const { data: vData, error: vError } = await supabase
        .from('veiculos')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (!vError) {
        setVeiculos(vData || []);
      }

      // Busca registros do periodo
      const dataFiltro = new Date();
      dataFiltro.setDate(dataFiltro.getDate() - periodo);
      
      const { data: rData, error: rError } = await supabase
        .from('registros')
        .select('*')
        .eq('user_id', user.id)
        .gte('data_registro', dataFiltro.toISOString().split('T')[0]);

      if (!rError && rData) {
        const gasto = rData.reduce((acc, curr) => acc + (curr.valor || 0), 0);
        
        // Exemplo simplificado de KM e Consumo baseado nos registros do periodo
        const abastecimentos = rData.filter(r => r.tipo === 'combustivel');
        const litros = abastecimentos.reduce((acc, curr) => acc + (curr.litros || 0), 0);
        // Considerando KM como o total de km rodados se os hodometros fizessem sentido, 
        // mas de forma simples vamos usar 0 ou algo mockado / estimado se não houver dados complexos.
        
        setEstatisticas({
            gasto,
            consumo: litros > 0 ? (litros * 11).toFixed(1) : '--', // Placeholder formula 
            km: rData.length > 0 ? rData.length * 150 : '--' // Placeholder formula
        });
      }
    }
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  // Filtrar veículos
  const veiculosFiltrados = veiculos.filter(v => 
    v.marca.toLowerCase().includes(busca.toLowerCase()) ||
    v.modelo.toLowerCase().includes(busca.toLowerCase()) ||
    v.placa.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="flex justify-between items-center p-6 bg-app-bg z-10">
        <div className="flex items-center gap-3">
          <div className="bg-app-accent text-black p-2 rounded-full h-11 w-11 flex items-center justify-center shadow-[0_0_15px_rgba(250,204,21,0.2)]">
            <i className="fas fa-car-side text-lg"></i>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight">CarTrack</h1>
            <p className="text-xs text-app-textMuted font-medium">{veiculos.length} veículo{veiculos.length !== 1 ? 's' : ''} cadastrado{veiculos.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => navigate('/notificacoes')} className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center relative transition active:scale-95">
            <i className="far fa-bell text-app-textMuted"></i>
          </button>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-app-card border border-app-border flex items-center justify-center relative transition active:scale-95">
            <i className="fas fa-sign-out-alt text-app-textMuted"></i>
          </button>
        </div>
      </header>

      {/* Main Content (Scrollable List) */}
      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-32">
        
        {/* Visão Geral Section */}
        <div className="bg-gradient-to-br from-[#2a2000] to-app-card border border-[#403000] rounded-3xl p-5 mb-6 shadow-lg relative overflow-hidden">
          <div className="inline-flex items-center gap-1.5 bg-app-accent/10 text-app-accent border border-app-accent/20 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide mb-3">
            <i className="fas fa-car-side"></i> Sua frota
          </div>
          
          <h2 className="font-bold text-2xl text-white tracking-tight">Visão geral</h2>
          <p className="text-sm text-app-textMuted mt-1">Resumo dos últimos {periodo === 365 ? '12 meses' : `${periodo} dias`}</p>

          <div className="flex items-center justify-center gap-2 mt-6 overflow-x-auto no-scrollbar pb-1">
            <button onClick={() => setPeriodo(7)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition active:scale-95 ${periodo === 7 ? 'font-bold text-black bg-app-accent shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'font-semibold text-app-textMuted bg-app-cardInner border border-transparent'}`}>7 dias</button>
            <button onClick={() => setPeriodo(30)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition active:scale-95 ${periodo === 30 ? 'font-bold text-black bg-app-accent shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'font-semibold text-app-textMuted bg-app-cardInner border border-transparent'}`}>30 dias</button>
            <button onClick={() => setPeriodo(90)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition active:scale-95 ${periodo === 90 ? 'font-bold text-black bg-app-accent shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'font-semibold text-app-textMuted bg-app-cardInner border border-transparent'}`}>90 dias</button>
            <button onClick={() => setPeriodo(365)} className={`px-4 py-2 rounded-full text-xs whitespace-nowrap transition active:scale-95 ${periodo === 365 ? 'font-bold text-black bg-app-accent shadow-[0_0_10px_rgba(250,204,21,0.2)]' : 'font-semibold text-app-textMuted bg-app-cardInner border border-transparent'}`}>12 meses</button>
          </div>

          <div className="grid grid-cols-3 gap-2 mt-5">
            <div className="bg-[#0A0A0A]/50 border border-app-border rounded-2xl p-2.5">
              <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 truncate">
                <i className="fas fa-wallet text-app-accent"></i> Gasto Médio
              </p>
              <p className="font-bold text-sm text-white truncate">
                {estatisticas.gasto > 0 ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(estatisticas.gasto) : 'R$ 0,00'}
              </p>
            </div>
            <div className="bg-[#0A0A0A]/50 border border-app-border rounded-2xl p-2.5">
              <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 truncate">
                <i className="fas fa-gas-pump text-app-accent"></i> Consumo
              </p>
              <p className="font-bold text-sm text-white truncate">{estatisticas.consumo} km/L</p>
            </div>
            <div className="bg-[#0A0A0A]/50 border border-app-border rounded-2xl p-2.5">
              <p className="text-[8px] text-app-textMuted font-semibold uppercase tracking-wider mb-1 flex items-center gap-1 truncate">
                <i className="fas fa-route text-app-accent"></i> KM
              </p>
              <p className="font-bold text-sm text-white truncate">{estatisticas.km} km</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <i className="fas fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-app-textMuted text-sm"></i>
          <input 
            type="text" 
            placeholder="Buscar por modelo ou placa" 
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full bg-app-card border border-app-border rounded-full py-3.5 pl-11 pr-4 text-sm text-white placeholder-app-textMuted focus:outline-none focus:border-app-accent transition-colors" 
          />
        </div>

        {/* Lista de Veículos */}
        {loading ? (
          <div className="flex justify-center py-10">
            <i className="fas fa-spinner fa-spin text-app-accent text-3xl"></i>
          </div>
        ) : veiculosFiltrados.length === 0 ? (
          <div className="text-center py-12 bg-app-card rounded-3xl border border-app-border border-dashed">
            <div className="w-16 h-16 bg-app-cardInner rounded-full flex items-center justify-center mx-auto mb-4 text-app-textMuted">
              <i className="fas fa-car-slash text-2xl"></i>
            </div>
            <h3 className="text-white font-bold text-lg mb-1">Nenhum veículo</h3>
            <p className="text-app-textMuted text-sm px-6">Adicione seu primeiro veículo para começar.</p>
          </div>
        ) : (
          veiculosFiltrados.map((veiculo) => (
            <div key={veiculo.id} onClick={() => navigate(`/detalhes/${veiculo.id}`)} className="cursor-pointer bg-app-card border border-app-border rounded-3xl p-5 mb-5 shadow-lg relative overflow-hidden group transition active:scale-[0.98]">
              <div className="flex items-start gap-4">
                <div className="bg-app-accent/10 border border-app-accent/20 text-app-accent w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <i className="fas fa-car"></i>
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center">
                    <h2 className="font-bold text-lg text-white">{veiculo.marca} {veiculo.modelo}</h2>
                    <i className="fas fa-chevron-right text-app-textMuted text-xs"></i>
                  </div>
                  <p className="text-xs text-app-textMuted mt-1">{veiculo.ano} • {veiculo.cor} • {veiculo.placa}</p>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="bg-app-cardInner text-app-textMuted border border-app-border px-2.5 py-1 rounded-md text-[10px] flex items-center gap-1.5 font-semibold uppercase tracking-wide">
                      <i className="fas fa-tachometer-alt"></i> {veiculo.hodometro} km
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
        
      </main>

      {/* Bottom Fixed Area */}
      <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-12 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
        <button onClick={() => navigate('/cadastro')} className="pointer-events-auto w-full max-w-[340px] bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-4 px-6 rounded-full btn-glow transition-all active:scale-95 flex items-center justify-center gap-2">
          <i className="fas fa-plus text-base"></i>
          ADICIONAR VEÍCULO
        </button>
      </div>
    </>
  );
}
