import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Home from './pages/Home';
import CadastroVeiculo from './pages/CadastroVeiculo';
import DetalhesVeiculo from './pages/DetalhesVeiculo';
import HistoricoRegistros from './pages/HistoricoRegistros';
import NovoRegistro from './pages/NovoRegistro';
import Relatorios from './pages/Relatorios';
import Pendencias from './pages/Pendencias';
import Notificacoes from './pages/Notificacoes';
import EditarVeiculo from './pages/EditarVeiculo';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Rotas Protegidas */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cadastro" element={<CadastroVeiculo />} />
            <Route path="/detalhes/:id" element={<DetalhesVeiculo />} />
            <Route path="/historico/:veiculoId" element={<HistoricoRegistros />} />
            <Route path="/novo-registro/:veiculoId?" element={<NovoRegistro />} />
            <Route path="/relatorios" element={<Relatorios />} />
            <Route path="/pendencias/:veiculoId?" element={<Pendencias />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
            <Route path="/editar-veiculo/:id" element={<EditarVeiculo />} />
            <Route path="*" element={<Navigate to="/" />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
