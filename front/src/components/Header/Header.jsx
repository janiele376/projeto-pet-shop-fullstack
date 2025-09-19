import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button,
  NavDropdown, // Adicionado para o menu do usuário
} from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; 
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [search, setSearch] = useState('');

  // PEGUE AS INFORMAÇÕES E FUNÇÕES DO CONTEXTO DE AUTENTICAÇÃO
  const { token, usuario, logout } = useAuth();

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(search)}`);
    }
  };

  // CRIE A FUNÇÃO DE LOGOUT
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* 1. BARRA DE PESQUISA (NO TOPO) */}
      <Navbar
        variant="dark"
        className="py-2 navbar-search-bar"
        style={{ backgroundColor: '#f0a772ff' }}
      >
        <Container className="justify-content-center">
          <Form
            className="d-flex w-100"
            onSubmit={handleSearch}
            style={{ maxWidth: '400px' }}
          >
            <FormControl
              type="search"
              placeholder="Pesquisar"
              className="me-2"
              aria-label="Pesquisar"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline-light" type="submit">
              Buscar
            </Button>
          </Form>
        </Container>
      </Navbar>

      {/* 2. NAVBAR PRINCIPAL (NAVEGAÇÃO E ÍCONES) */}
      <Navbar
        expand="lg"
        variant="dark"
        className="navbar-principal"
        style={{ backgroundColor: '#eb995fff' }} 
      >
        <Container>
          <Navbar.Brand as={Link} to="/inicio">
            Pet Shop Feliz
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            
            {/* Links de Navegação */}
            <Nav className="ms-auto me-3"> 
              <Nav.Link as={Link} to="/inicio">Início</Nav.Link>
              <Nav.Link as={Link} to="/agendamento">Agendamentos</Nav.Link>
              <Nav.Link as={Link} to="/produtos">Produtos</Nav.Link>
              <Nav.Link as={Link} to="/serviços">Serviços</Nav.Link>
              <Nav.Link as={Link} to="/sobre">Sobre</Nav.Link>
              <Nav.Link as={Link} to="/contato">Contato</Nav.Link>
            </Nav>

            <div className="d-flex align-items-center">
              {/* Ícone do Carrinho (sempre visível) */}
              <Link to="/carrinho" className="cart-link position-relative me-3">
                <FaShoppingCart />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Link>

              {/* LÓGICA DE LOGIN/LOGOUT (RENDERIZAÇÃO CONDICIONAL) */}
              {token ? (
                <NavDropdown 
                  title={
                    <>
                      <FaUser className="me-2" />
                      {usuario?.nome || 'Perfil'} 
                    </>
                  } 
                  id="basic-nav-dropdown" 
                  align="end"
                  menuVariant="dark" 
                >
                  <NavDropdown.Item as={Link} to="/perfil">Minha Conta</NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/meus-pedidos">Meus Pedidos</NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item onClick={handleLogout}>
                    Sair
                  </NavDropdown.Item>
                </NavDropdown>

              ) : (
                // SE NÃO ESTIVER LOGADO, MOSTRA O ÍCONE DE LOGIN
                <Link to="/login" className="login-link">
                  <FaUser />
                </Link>
              )}
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
