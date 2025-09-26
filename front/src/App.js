import React from 'react';
import { Routes, Route } from 'react-router-dom';

// NOSSAS PÁGINAS E COMPONENTES
import Header from './components/Header/Header';
import Inicio from './pages/Inicio/Inicio';
import Sobre from './pages/Sobre/Sobre';
import Agendamento from './pages/Agendamentos/Agendamento';
import Produtos from './pages/Produtos/Produtos';
import Carrinho from './components/Carrinho/Carrinho';
import Servicos from './pages/Servicos/Servicos';
import Contatos from './pages/Contato/Contatos';
import Footer from './components/Footer/Footer';
import Produto from './pages/Produto/Produto';
import Historia from './pages/Historia/Historia';
import Buscar from './pages/Buscar/Buscar';
import Login from './pages/Login/Login';
import LoginCadastro from './pages/LoginCadastro/LoginCadastro';
import CadastroProduto from './pages/Produtos/CadastroProduto';
import EditarProduto from './pages/Produtos/EditarProduto.jsx';
import PerfilPage from './pages/Perfil/PerfilPage';
import ProtectedRoute from './pages/Login/ProtectedRoute';

// IMPORTAÇÕES GLOBAIS
import 'bootstrap/dist/css/bootstrap.min.css';
import { CartProvider } from './context/CartContext';

import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <CartProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Header />
      <Routes>
        {/* ============================================= */}
        {/* GRUPO 1: ROTAS PÚBLICAS (Todos podem acessar) */}
        {/* ============================================= */}
        <Route path="/inicio" element={<Inicio />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<LoginCadastro />} />
        <Route path="/produtos" element={<Produtos />} />
        <Route path="/serviços" element={<Servicos />} />
        <Route path="/contato" element={<Contatos />} />
        <Route path="/sobre" element={<Sobre />} />
        <Route path="/historia" element={<Historia />} />
        <Route path="/buscar" element={<Buscar />} />

        {/* Deixar agendamento e carrinho acessíveis para todos */}
        <Route path="/agendamento" element={<Agendamento />} />
        <Route path="/carrinho" element={<Carrinho />} />

        {/* ================================================= */}
        {/* GRUPO 2: ROTAS PROTEGIDAS (Só usuários logados) */}
        {/* ================================================= */}
        <Route element={<ProtectedRoute />}>
          <Route path="/perfil" element={<PerfilPage />} />
          <Route path="/cadastro-produto" element={<CadastroProduto />} />
          <Route path="/editar-produto/:id" element={<EditarProduto />} />
        </Route>
      </Routes>
      <Footer />
    </CartProvider>
  );
}

export default App;
