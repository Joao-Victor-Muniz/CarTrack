import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

const formTypes = {
  combustivel: {
    title: 'Registrar combustível',
    subtitle: 'ABASTECIMENTO E CONSUMO',
    icon: 'fa-gas-pump',
    color: 'text-app-accent',
    bgCircle: 'bg-app-accent/20',
    bgGradient: 'from-[#2a2000]',
    borderColor: 'border-[#403000]'
  },
  manutencao: {
    title: 'Registrar manutenção',
    subtitle: 'REPAROS E PEÇAS',
    icon: 'fa-wrench',
    color: 'text-orange-400',
    bgCircle: 'bg-orange-400/20',
    bgGradient: 'from-[#2a1600]',
    borderColor: 'border-[#402000]'
  },
  lavagem: {
    title: 'Registrar lavagem',
    subtitle: 'LIMPEZA E ESTÉTICA',
    icon: 'fa-droplet',
    color: 'text-yellow-500',
    bgCircle: 'bg-yellow-500/20',
    bgGradient: 'from-[#2a2000]',
    borderColor: 'border-[#403000]'
  },
  revisao: {
    title: 'Registrar revisão',
    subtitle: 'PREVENTIVA OU PROGRAMADA',
    icon: 'fa-shield-halved',
    color: 'text-green-500',
    bgCircle: 'bg-green-500/20',
    bgGradient: 'from-[#0a1f10]',
    borderColor: 'border-[#103018]'
  }
};

export default function NovoRegistro() {
  const navigate = useNavigate();
  const location = useLocation();
  const { veiculoId } = useParams();
  
  const [selectedType, setSelectedType] = useState(location.state?.type || 'combustivel');
  const config = formTypes[selectedType];

  // Common state
  const [dataRegistro, setDataRegistro] = useState(new Date().toISOString().split('T')[0]);
  const [hodometro, setHodometro] = useState('');
  const [valor, setValor] = useState('');
  const [local, setLocal] = useState('');
  const [observacoes, setObservacoes] = useState('');

  // Specific states
  const [tipoCombustivel, setTipoCombustivel] = useState('Gasolina comum');
  const [litros, setLitros] = useState('');
  const [precoLitro, setPrecoLitro] = useState('');

  const [servicoExecutado, setServicoExecutado] = useState('');
  const [garantiaAte, setGarantiaAte] = useState('');

  const [tipoLavagem, setTipoLavagem] = useState('Simples');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Calcula litros automaticamente
  useEffect(() => {
    if (selectedType === 'combustivel' && valor && precoLitro) {
      const v = parseFloat(valor.toString().replace(',', '.'));
      const p = parseFloat(precoLitro.toString().replace(',', '.'));
      if (!isNaN(v) && !isNaN(p) && p > 0) {
        setLitros((v / p).toFixed(2));
      }
    }
  }, [valor, precoLitro, selectedType]);

  const handleSalvar = async () => {
    if (!veiculoId) {
      setError("Veículo não especificado.");
      return;
    }
    if (!dataRegistro || !valor) {
      setError("Data e Valor são obrigatórios.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const payload = {
        veiculo_id: veiculoId,
        user_id: user.id,
        tipo: selectedType,
        data_registro: dataRegistro,
        hodometro: hodometro ? parseInt(hodometro) : null,
        valor: parseFloat(valor.replace(',', '.')),
        local,
        observacoes
      };

      if (selectedType === 'combustivel') {
        payload.tipo_combustivel = tipoCombustivel;
        payload.litros = litros ? parseFloat(litros.replace(',', '.')) : null;
        payload.preco_litro = precoLitro ? parseFloat(precoLitro.replace(',', '.')) : null;
      } else if (selectedType === 'manutencao' || selectedType === 'revisao') {
        payload.servico_executado = servicoExecutado;
        payload.garantia_ate = garantiaAte || null;
      } else if (selectedType === 'lavagem') {
        payload.tipo_lavagem = tipoLavagem;
      }

      const { error: dbError } = await supabase.from('registros').insert([payload]);
      
      if (dbError) throw dbError;

      navigate(`/detalhes/${veiculoId}`);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Erro ao salvar registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="flex justify-between items-center p-5 pt-6 bg-app-bg z-10">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95">
              <i className="fas fa-arrow-left text-white text-sm"></i>
          </button>
          <div className="text-center">
              <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">Novo registro</h1>
          </div>
          <div className="w-10 h-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-4 pb-28">
          <h3 className="text-[10px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-4">Tipo de registro</h3>
          <div className="flex justify-between items-center gap-1.5 sm:gap-2.5 mb-6 w-full">
              <button onClick={() => setSelectedType('combustivel')} className={`flex-1 type-btn flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl transition-all active:scale-95 border ${selectedType === 'combustivel' ? 'border-app-accent bg-app-accent/5' : 'border-app-border bg-app-card'}`}>
                  <i className={`fas fa-gas-pump text-base sm:text-lg ${selectedType === 'combustivel' ? 'text-app-accent' : 'text-app-textMuted'}`}></i>
                  <span className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-tight truncate w-full text-center ${selectedType === 'combustivel' ? 'text-white' : 'text-app-textMuted'}`}>Combustível</span>
              </button>
              <button onClick={() => setSelectedType('manutencao')} className={`flex-1 type-btn flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl transition-all active:scale-95 border ${selectedType === 'manutencao' ? 'border-app-accent bg-app-accent/5' : 'border-app-border bg-app-card'}`}>
                  <i className={`fas fa-wrench text-base sm:text-lg ${selectedType === 'manutencao' ? 'text-orange-400' : 'text-app-textMuted'}`}></i>
                  <span className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-tight truncate w-full text-center ${selectedType === 'manutencao' ? 'text-white' : 'text-app-textMuted'}`}>Manutenção</span>
              </button>
              <button onClick={() => setSelectedType('lavagem')} className={`flex-1 type-btn flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl transition-all active:scale-95 border ${selectedType === 'lavagem' ? 'border-app-accent bg-app-accent/5' : 'border-app-border bg-app-card'}`}>
                  <i className={`fas fa-droplet text-base sm:text-lg ${selectedType === 'lavagem' ? 'text-yellow-500' : 'text-app-textMuted'}`}></i>
                  <span className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-tight truncate w-full text-center ${selectedType === 'lavagem' ? 'text-white' : 'text-app-textMuted'}`}>Lavagem</span>
              </button>
              <button onClick={() => setSelectedType('revisao')} className={`flex-1 type-btn flex flex-col items-center justify-center gap-2 py-3 px-1 rounded-2xl transition-all active:scale-95 border ${selectedType === 'revisao' ? 'border-app-accent bg-app-accent/5' : 'border-app-border bg-app-card'}`}>
                  <i className={`fas fa-shield-halved text-base sm:text-lg ${selectedType === 'revisao' ? 'text-green-500' : 'text-app-textMuted'}`}></i>
                  <span className={`text-[7px] sm:text-[9px] font-bold uppercase tracking-tight truncate w-full text-center ${selectedType === 'revisao' ? 'text-white' : 'text-app-textMuted'}`}>Revisão</span>
              </button>
          </div>

          <div className={`bg-gradient-to-r ${config.bgGradient} to-app-card border ${config.borderColor} rounded-3xl p-4 mb-6 flex items-center gap-4 transition-all duration-300`}>
              <div className={`w-[52px] h-[52px] rounded-full flex items-center justify-center flex-shrink-0 ${config.bgCircle} ${config.color}`}>
                  <i className={`fas ${config.icon} text-xl`}></i>
              </div>
              <div>
                  <p className="text-[8px] text-app-textMuted font-bold uppercase tracking-[0.15em] mb-1">{config.subtitle}</p>
                  <h2 className="font-bold text-[19px] leading-tight text-white">{config.title}</h2>
                  <p className="text-[10px] text-app-textMuted mt-0.5">Preencha os dados abaixo</p>
              </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-xs">
              <i className="fas fa-exclamation-circle mr-2"></i>{error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={e => e.preventDefault()}>
              <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
                  <div className="py-3.5 border-b border-app-border">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                          <i className={`far fa-calendar-alt ${config.color}`}></i> Data
                      </label>
                      <div className="flex items-center justify-between">
                          <input type="date" value={dataRegistro} onChange={e => setDataRegistro(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" />
                      </div>
                  </div>
                  <div className="py-3.5 border-b border-app-border">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                          <i className={`fas fa-gauge-high ${config.color}`}></i> Hodômetro
                      </label>
                      <div className="flex items-center justify-between">
                          <input type="number" value={hodometro} onChange={e => setHodometro(e.target.value)} placeholder="0" className="bg-transparent w-full focus:outline-none text-neutral-600 font-semibold text-[15px] placeholder-neutral-600" />
                          <span className="text-[11px] text-app-textMuted font-medium">km</span>
                      </div>
                  </div>
                  <div className="py-3.5">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                          <i className={`fas fa-file-invoice-dollar ${config.color}`}></i> Valor
                      </label>
                      <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-bold text-neutral-600 mt-0.5">R$</span>
                          <input type="number" step="0.01" value={valor} onChange={e => setValor(e.target.value)} placeholder="0.00" className="bg-transparent w-full focus:outline-none text-neutral-600 font-semibold text-[15px] placeholder-neutral-600" />
                      </div>
                  </div>
              </div>

              {selectedType === 'combustivel' && (
                  <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
                      <div className="py-3.5 border-b border-app-border">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                              <i className="fas fa-gas-pump text-app-accent"></i> Combustível
                          </label>
                          <div className="relative">
                              <select value={tipoCombustivel} onChange={e => setTipoCombustivel(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] cursor-pointer outline-none appearance-none">
                                  <option value="Gasolina comum">Gasolina comum</option>
                                  <option value="Gasolina aditivada">Gasolina aditivada</option>
                                  <option value="Etanol">Etanol</option>
                                  <option value="Diesel">Diesel</option>
                                  <option value="Elétrico">Elétrico</option>
                              </select>
                              <i className="fas fa-chevron-down text-white text-[10px] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                          </div>
                      </div>
                      <div className="flex">
                          <div className="py-3.5 flex-1 border-r border-app-border pr-5">
                              <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Preço/L</label>
                              <div className="flex items-center gap-1">
                                  <span className="text-[10px] font-bold text-neutral-600 mt-0.5">R$</span>
                                  <input type="number" step="0.01" value={precoLitro} onChange={e => setPrecoLitro(e.target.value)} placeholder="0.00" className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                              </div>
                          </div>
                          <div className="py-3.5 flex-1 pl-5">
                              <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Litros</label>
                              <div className="flex items-center justify-between">
                                  <input type="number" step="0.01" value={litros} onChange={e => setLitros(e.target.value)} placeholder="0" className="bg-transparent w-full focus:outline-none text-app-accent font-semibold text-[15px] placeholder-neutral-600" />
                                  <span className="text-[10px] font-bold text-neutral-600 ml-1">L</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {selectedType === 'manutencao' && (
                  <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
                      <div className="py-3.5 border-b border-app-border">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                              <i className="fas fa-wrench text-orange-400"></i> Serviço Executado
                          </label>
                          <input type="text" value={servicoExecutado} onChange={e => setServicoExecutado(e.target.value)} placeholder="Ex: Troca de pastilhas" className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                      </div>
                      <div className="py-3.5">
                          <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Garantia Até</label>
                          <div className="flex items-center justify-between">
                              <input type="date" value={garantiaAte} onChange={e => setGarantiaAte(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                          </div>
                      </div>
                  </div>
              )}

              {selectedType === 'lavagem' && (
                  <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
                      <div className="py-3.5">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                              <i className="fas fa-droplet text-yellow-500"></i> Tipo de Lavagem
                          </label>
                          <div className="relative">
                              <select value={tipoLavagem} onChange={e => setTipoLavagem(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] cursor-pointer outline-none appearance-none">
                                  <option value="Simples">Simples</option>
                                  <option value="Completa">Completa</option>
                                  <option value="Com Cera">Com Cera</option>
                                  <option value="Detalhada">Detalhada</option>
                              </select>
                              <i className="fas fa-chevron-down text-white text-[10px] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                          </div>
                      </div>
                  </div>
              )}

              {selectedType === 'revisao' && (
                  <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
                      <div className="py-3.5 border-b border-app-border">
                          <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                              <i className="fas fa-shield-halved text-green-500"></i> Serviço Executado
                          </label>
                          <input type="text" value={servicoExecutado} onChange={e => setServicoExecutado(e.target.value)} placeholder="Ex: Revisão 50.000 km" className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                      </div>
                      <div className="py-3.5">
                          <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Garantia Até</label>
                          <div className="flex items-center justify-between">
                              <input type="date" value={garantiaAte} onChange={e => setGarantiaAte(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                          </div>
                      </div>
                  </div>
              )}

              <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm mb-6">
                  <div className="py-3.5 border-b border-app-border">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                          <i className={`fas fa-location-dot ${config.color}`}></i> Local
                      </label>
                      <input type="text" value={local} onChange={e => setLocal(e.target.value)} placeholder="Ex: Posto Shell Centro" className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                  </div>
                  <div className="py-3.5">
                      <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                          <i className={`fas fa-file-lines ${config.color}`}></i> Observações
                      </label>
                      <input type="text" value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Anotações adicionais (opcional)" className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] placeholder-neutral-600" />
                  </div>
              </div>

          </form>
      </main>

      <div className="absolute bottom-0 left-0 w-full px-5 py-5 bg-app-bg border-t border-app-border flex gap-3 z-20">
          <button onClick={() => navigate(-1)} disabled={loading} className="flex-1 bg-transparent border border-app-border hover:bg-app-cardInner text-white font-bold text-sm py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-50">
              Cancelar
          </button>
          <button onClick={handleSalvar} disabled={loading} className="flex-1 bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-3.5 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:scale-100">
              {loading ? <i className="fas fa-spinner fa-spin text-base"></i> : <i className="fas fa-check text-base"></i>}
              {loading ? 'Salvando...' : 'Salvar registro'}
          </button>
      </div>
    </>
  );
}
