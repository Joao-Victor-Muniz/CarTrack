import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function CadastroVeiculo() {
  const navigate = useNavigate();
  
  const [placa, setPlaca] = useState('');
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [hodometro, setHodometro] = useState('');
  const [combustivel_base, setCombustivelBase] = useState('Flex');
  const [tanque, setTanque] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePlacaChange = (e) => {
    let value = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (value.length > 3) {
      value = value.substring(0, 3) + '-' + value.substring(3, 7);
    }
    setPlaca(value);
  };

  const handleSalvar = async () => {
    if (!placa || !marca || !modelo || !ano || !cor || !hodometro) {
      setError('Preencha os campos obrigatórios (marca, modelo, placa, ano, cor e hodômetro).');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Você precisa estar logado.");

      const { error: dbError } = await supabase.from('veiculos').insert([{
        user_id: user.id,
        placa,
        marca,
        modelo,
        ano: parseInt(ano),
        cor,
        hodometro: parseInt(hodometro),
        combustivel_base,
        tanque_litros: tanque ? parseInt(tanque) : null
      }]);

      if (dbError) throw dbError;

      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Cabeçalho (Header) */}
      <header className="flex justify-between items-center p-5 pt-6 bg-app-bg z-10">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-app-cardInner border border-app-border flex items-center justify-center transition active:scale-95">
          <i className="fas fa-arrow-left text-white text-sm"></i>
        </button>
        <div className="text-center">
          <h1 className="text-[15px] font-bold text-white tracking-tight leading-tight">Adicionar veículo</h1>
          <p className="text-[10px] text-app-textMuted font-medium mt-0.5">Nova frota</p>
        </div>
        <div className="w-10 h-10"></div> {/* Placeholder para balancear */}
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-2 pb-28">
        
        {/* Avatar / Foto do Veículo */}
        <div className="flex flex-col items-center justify-center mt-2 mb-6">
          <div className="relative group cursor-pointer transition active:scale-95">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1a1a1a] to-[#0a0a0a] border border-app-border flex items-center justify-center text-app-textMuted shadow-lg">
              <i className="fas fa-car text-3xl opacity-50 group-hover:text-app-accent transition-colors"></i>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-app-accent text-black flex items-center justify-center border-[3px] border-app-bg transition shadow-[0_0_10px_rgba(250,204,21,0.3)]">
              <i className="fas fa-camera text-[11px] font-bold"></i>
            </button>
          </div>
          <span className="text-[9px] text-app-textMuted font-bold mt-3 uppercase tracking-[0.15em]">Foto do veículo</span>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-xs">
            <i className="fas fa-exclamation-circle mr-2"></i>{error}
          </div>
        )}

        <form className="flex flex-col gap-4" onSubmit={(e) => e.preventDefault()}>
          
          {/* BLOCO 1: Identificação Básica */}
          <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm">
            
            {/* Placa */}
            <div className="py-3.5 border-b border-app-border">
              <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                <i className="fas fa-address-card text-app-accent"></i> Placa
              </label>
              <input 
                type="text" 
                placeholder="EX: ABC-1D23" 
                value={placa}
                onChange={handlePlacaChange}
                className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] uppercase" 
              />
            </div>
            
            {/* Marca e Modelo (Lado a Lado) */}
            <div className="flex">
              <div className="py-3.5 flex-1 border-r border-app-border pr-5">
                <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Marca</label>
                <div className="relative">
                  <select value={marca} onChange={(e) => setMarca(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] cursor-pointer outline-none appearance-none">
                    <option value="" disabled hidden>Selecione</option>
                    <option value="Toyota">Toyota</option>
                    <option value="Honda">Honda</option>
                    <option value="Volkswagen">Volkswagen</option>
                    <option value="Chevrolet">Chevrolet</option>
                    <option value="Hyundai">Hyundai</option>
                    <option value="Fiat">Fiat</option>
                    <option value="Outra">Outra</option>
                  </select>
                  <i className="fas fa-chevron-down text-white text-[10px] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                </div>
              </div>
              <div className="py-3.5 flex-1 pl-5 border-b border-app-border">
                <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Modelo</label>
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Ex: Corolla" 
                    value={modelo}
                    onChange={(e) => setModelo(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" 
                  />
                </div>
              </div>
            </div>
            {/* Acerto de borda inferior da Marca (devido ao flex) */}
            <div className="w-1/2 border-b border-app-border -mt-[1px]"></div>

            {/* Ano e Cor (Lado a Lado) */}
            <div className="flex">
              <div className="py-3.5 flex-1 border-r border-app-border pr-5">
                <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Ano</label>
                <input 
                  type="number" 
                  placeholder="Ex: 2023" 
                  value={ano}
                  onChange={(e) => setAno(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" 
                />
              </div>
              <div className="py-3.5 flex-1 pl-5">
                <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Cor</label>
                <input 
                  type="text" 
                  placeholder="Ex: Preto" 
                  value={cor}
                  onChange={(e) => setCor(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" 
                />
              </div>
            </div>
          </div>

          {/* BLOCO 2: Dados de Controle */}
          <div className="bg-app-card border border-app-border rounded-3xl px-5 flex flex-col shadow-sm mb-6">
            
            {/* Hodômetro Inicial */}
            <div className="py-3.5 border-b border-app-border">
              <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                <i className="fas fa-gauge-high text-app-accent"></i> Hodômetro atual
              </label>
              <div className="flex items-center justify-between">
                <input 
                  type="number" 
                  placeholder="Ex: 15000" 
                  value={hodometro}
                  onChange={(e) => setHodometro(e.target.value)}
                  className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" 
                />
                <span className="text-[11px] text-app-textMuted font-medium">km</span>
              </div>
            </div>

            {/* Combustível Principal e Tanque */}
            <div className="flex">
              <div className="py-3.5 flex-[1.5] border-r border-app-border pr-5">
                <label className="flex items-center gap-1.5 text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">
                  <i className="fas fa-gas-pump text-app-accent"></i> Combustível Base
                </label>
                <div className="relative">
                  <select value={combustivel_base} onChange={(e) => setCombustivelBase(e.target.value)} className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px] cursor-pointer outline-none appearance-none">
                    <option value="Flex">Flex</option>
                    <option value="Gasolina">Gasolina</option>
                    <option value="Etanol">Etanol</option>
                    <option value="Diesel">Diesel</option>
                    <option value="GNV">GNV</option>
                    <option value="Elétrico">Elétrico</option>
                    <option value="Híbrido">Híbrido</option>
                  </select>
                  <i className="fas fa-chevron-down text-white text-[10px] absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none"></i>
                </div>
              </div>
              <div className="py-3.5 flex-1 pl-5">
                <label className="block text-[9px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-1.5">Tanque</label>
                <div className="flex items-center justify-between">
                  <input 
                    type="number" 
                    placeholder="Ex: 50" 
                    value={tanque}
                    onChange={(e) => setTanque(e.target.value)}
                    className="bg-transparent w-full focus:outline-none text-white font-semibold text-[15px]" 
                  />
                  <span className="text-[10px] font-bold text-app-textMuted ml-1">L</span>
                </div>
              </div>
            </div>
          </div>

        </form>
      </main>

      {/* BOTTOM BAR FIXA */}
      <div className="absolute bottom-0 left-0 w-full px-5 py-5 bg-gradient-to-t from-app-bg via-app-bg to-transparent flex gap-3 z-20">
        <button onClick={() => navigate(-1)} disabled={loading} className="flex-1 bg-app-cardInner border border-app-border hover:bg-app-border text-white font-bold text-sm py-3.5 rounded-full transition-all active:scale-95 disabled:opacity-50">
          Cancelar
        </button>
        <button 
          onClick={handleSalvar}
          disabled={loading}
          className="flex-[1.5] bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-3.5 rounded-full transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(250,204,21,0.15)] disabled:opacity-70 disabled:scale-100"
        >
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check text-base"></i>}
          {loading ? 'Salvando...' : 'Salvar veículo'}
        </button>
      </div>
    </>
  );
}
