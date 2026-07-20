import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function EditarVeiculo() {
  const navigate = useNavigate();
  const { id } = useParams();

  const [veiculo, setVeiculo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [marca, setMarca] = useState('');
  const [modelo, setModelo] = useState('');
  const [ano, setAno] = useState('');
  const [cor, setCor] = useState('');
  const [placa, setPlaca] = useState('');
  const [combustivel_base, setCombustivelBase] = useState('');

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
      
      // Populate form
      setMarca(data.marca);
      setModelo(data.modelo);
      setAno(data.ano.toString());
      setCor(data.cor);
      setPlaca(data.placa);
      setCombustivelBase(data.combustivel_base);

    } catch (err) {
      console.error(err);
      setError('Erro ao carregar veículo.');
    } finally {
      setLoading(false);
    }
  };

  const handleSalvar = async () => {
    if (!marca || !modelo || !ano || !cor || !placa) {
      setError('Preencha os campos obrigatórios.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const { error } = await supabase
        .from('veiculos')
        .update({
          marca,
          modelo,
          ano: parseInt(ano),
          cor,
          placa,
          combustivel_base
        })
        .eq('id', id);

      if (error) throw error;
      navigate(`/detalhes/${id}`);
    } catch (err) {
      console.error(err);
      setError('Erro ao salvar veículo.');
    } finally {
      setSaving(false);
    }
  };

  const handleExcluir = async () => {
    const confirmar = window.confirm("Tem certeza que deseja excluir este veículo permanentemente?");
    if (!confirmar) return;

    setSaving(true);
    try {
      const { error } = await supabase.from('veiculos').delete().eq('id', id);
      if (error) throw error;
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Erro ao excluir veículo.');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-app-bg text-app-accent">
        <i className="fas fa-spinner fa-spin text-3xl"></i>
      </div>
    );
  }

  if (error && !veiculo) {
    return (
      <div className="flex flex-col h-screen w-full items-center justify-center bg-app-bg px-5">
        <p className="text-white mb-4">{error}</p>
        <button onClick={() => navigate(-1)} className="text-app-accent font-bold underline">Voltar</button>
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
                <h1 className="text-lg font-bold text-white tracking-tight">Editar Veículo</h1>
            </div>
        </header>

        <main className="flex-1 overflow-y-auto no-scrollbar px-5 pt-6 pb-32">
            
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-2xl mb-4 text-xs">
                <i className="fas fa-exclamation-circle mr-2"></i>{error}
              </div>
            )}

            {/* Foto / Ícone */}
            <div className="flex flex-col items-center mb-8">
                <div className="w-20 h-20 rounded-full bg-[#1c180b] border-2 border-app-accent flex items-center justify-center mb-3 relative">
                    <i className="fas fa-car-side text-app-accent text-3xl"></i>
                    <button className="absolute bottom-0 right-0 w-7 h-7 bg-app-cardInner border border-app-border rounded-full flex items-center justify-center text-white shadow-md active:scale-95 transition-transform">
                        <i className="fas fa-camera text-[10px]"></i>
                    </button>
                </div>
                <h2 className="text-sm font-bold text-white">{veiculo?.marca} {veiculo?.modelo}</h2>
                <p className="text-[11px] text-app-textMuted uppercase tracking-wider">{veiculo?.placa}</p>
            </div>

            {/* Informações Básicas */}
            <h3 className="text-[10px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-4 ml-1">Informações Básicas</h3>
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Marca</label>
                        <input type="text" value={marca} onChange={e => setMarca(e.target.value)} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Modelo</label>
                        <input type="text" value={modelo} onChange={e => setModelo(e.target.value)} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors" />
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Ano</label>
                        <input type="text" value={ano} onChange={e => setAno(e.target.value)} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Cor</label>
                        <input type="text" value={cor} onChange={e => setCor(e.target.value)} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors" />
                    </div>
                </div>
            </div>

            {/* Documentação */}
            <h3 className="text-[10px] font-bold text-app-textMuted uppercase tracking-[0.15em] mb-4 ml-1">Identificação</h3>
            <div className="flex flex-col gap-4 mb-8">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Placa</label>
                        <input type="text" value={placa} onChange={e => setPlaca(e.target.value.toUpperCase())} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white uppercase focus:outline-none focus:border-app-accent transition-colors" />
                    </div>
                    <div className="flex-1">
                        <label className="block text-[11px] font-medium text-app-textMuted mb-1.5 ml-1">Combustível</label>
                        <select value={combustivel_base} onChange={e => setCombustivelBase(e.target.value)} className="w-full bg-app-card border border-app-border rounded-2xl py-3.5 px-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors appearance-none">
                            <option value="Flex">Flex</option>
                            <option value="Gasolina">Gasolina</option>
                            <option value="Etanol">Etanol</option>
                            <option value="Diesel">Diesel</option>
                            <option value="GNV">GNV</option>
                            <option value="Elétrico">Elétrico</option>
                            <option value="Híbrido">Híbrido</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Zona de Perigo */}
            <h3 className="text-[10px] font-bold text-red-500 uppercase tracking-[0.15em] mb-4 ml-1 flex items-center gap-1.5">
                <i className="fas fa-triangle-exclamation"></i> Zona de Perigo
            </h3>
            <button onClick={handleExcluir} disabled={saving} className="w-full bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-500 hover:text-white font-bold text-[13px] py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50">
                <i className="far fa-trash-alt"></i>
                Excluir veículo
            </button>
            <p className="text-[10px] text-app-textMuted text-center mt-3">Esta ação removerá permanentemente todo o histórico, custos e eventos deste veículo. Não pode ser desfeita.</p>
        </main>

        {/* Footer Fixed Action */}
        <div className="absolute bottom-0 left-0 w-full px-5 pb-8 pt-16 bg-gradient-to-t from-[#050505] via-[#050505]/95 to-transparent pointer-events-none flex justify-center z-20">
            <button onClick={handleSalvar} disabled={saving} className="pointer-events-auto w-full max-w-[340px] bg-app-accent hover:bg-app-accentHover text-black font-bold text-sm py-4 px-6 rounded-full shadow-[0_0_20px_rgba(250,204,21,0.2)] transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70">
                {saving ? <i className="fas fa-spinner fa-spin text-base"></i> : <i className="fas fa-save text-base"></i>}
                {saving ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
            </button>
        </div>
    </>
  );
}
