import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMsg(null);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    } else {
      setMsg('Verifique seu email para confirmar o cadastro (se habilitado) ou faça login se foi automático.');
    }
    setLoading(false);
  };

  return (
    <div className="flex h-screen flex-col bg-app-bg px-6 py-12 text-white">
      <div className="flex flex-col items-center justify-center mt-10 mb-12">
        <div className="bg-app-accent text-black p-4 rounded-full h-20 w-20 flex items-center justify-center shadow-[0_0_25px_rgba(250,204,21,0.3)] mb-4">
          <i className="fas fa-car-side text-3xl"></i>
        </div>
        <h1 className="text-3xl font-bold tracking-tight">CarTrack</h1>
        <p className="text-app-textMuted mt-2 text-center text-sm">Gerencie sua frota com eficiência.</p>
      </div>

      <div className="bg-app-card border border-app-border rounded-3xl p-6 shadow-lg">
        <form className="flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold text-app-textMuted uppercase tracking-wider mb-2 ml-1">Email</label>
            <div className="relative">
              <i className="fas fa-envelope absolute left-4 top-1/2 transform -translate-y-1/2 text-app-textMuted"></i>
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com" 
                className="w-full bg-app-cardInner border border-app-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-app-textMuted uppercase tracking-wider mb-2 ml-1">Senha</label>
            <div className="relative">
              <i className="fas fa-lock absolute left-4 top-1/2 transform -translate-y-1/2 text-app-textMuted"></i>
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" 
                className="w-full bg-app-cardInner border border-app-border rounded-2xl py-3.5 pl-11 pr-4 text-sm text-white focus:outline-none focus:border-app-accent transition-colors"
                required
              />
            </div>
          </div>

          {error && <div className="text-red-400 text-xs bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
          {msg && <div className="text-green-400 text-xs bg-green-500/10 p-3 rounded-xl border border-green-500/20">{msg}</div>}

          <div className="flex flex-col gap-3 mt-4">
            <button 
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-app-accent hover:bg-app-accentHover text-black font-bold py-3.5 rounded-full transition-all active:scale-95 shadow-[0_0_15px_rgba(250,204,21,0.2)] flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              {loading ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-sign-in-alt"></i>}
              ENTRAR
            </button>
            <button 
              onClick={handleSignUp}
              disabled={loading}
              className="w-full bg-transparent border border-app-border hover:bg-app-cardInner text-white font-bold py-3.5 rounded-full transition-all active:scale-95 flex justify-center items-center gap-2 disabled:opacity-70 disabled:scale-100"
            >
              <i className="fas fa-user-plus text-app-textMuted"></i>
              CRIAR CONTA
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
