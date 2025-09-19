import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Navbar,
  Nav,
  Container,
  Form,
  FormControl,
  Button,
} from 'react-bootstrap';
import { FaShoppingCart, FaUser } from 'react-icons/fa'; // Importando o ícone de login
import { useCart } from '../../context/CartContext';
import './Header.css';

function Header() {
  const navigate = useNavigate();
  const { cartItems } = useCart();
  const [search, setSearch] = useState('');

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/buscar?query=${encodeURIComponent(search)}`);
    }
  };

  return (
    <>
      {/* Barra de pesquisa fixa no topo */}
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

      {/* Navbar principal logo abaixo da barra de pesquisa */}
      <Navbar
        expand="lg"
        variant="dark"
        className="navbar-principal"
        style={{ backgroundColor: '#eb995fff' }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/">
            Pet Shop Feliz
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link as={Link} to="/inicio">
                Início
              </Nav.Link>
              <Nav.Link as={Link} to="/agendamento">
                Agendamentos
              </Nav.Link>
              <Nav.Link as={Link} to="/produtos">
                Produtos
              </Nav.Link>
              <Nav.Link as={Link} to="/serviços">
                Serviços
              </Nav.Link>
              <Nav.Link as={Link} to="/historia">
                Nossa História
              </Nav.Link>
              <Nav.Link as={Link} to="/sobre">
                Sobre
              </Nav.Link>
              <Nav.Link as={Link} to="/contato">
                Contato
              </Nav.Link>

              {/* Carrinho */}
              <Nav.Link as={Link} to="/carrinho" className="cart-link">
                <FaShoppingCart size="1.2em" />
                {totalItems > 0 && (
                  <span className="cart-badge">{totalItems}</span>
                )}
              </Nav.Link>

              {/* Login */}
              <Nav.Link as={Link} to="/login" className="login-link">
                <FaUser size="1.2em" />
              </Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
}

export default Header;
