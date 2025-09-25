import React from 'react';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import './Carrinho.css';
import { useNavigate } from 'react-router-dom';

const Carrinho = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * item.quantity,
    0,
  );

  const handleFinalizarCompra = () => {
    // 🔒 Verificação de login
    const usuario = localStorage.getItem('usuario'); // precisa ser salvo no login
    if (!usuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Você precisa estar logado!',
        text: 'Faça login para finalizar sua compra.',
        confirmButtonText: 'Login',
        confirmButtonColor: '#28a745',
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    // Compra finalizada
    Swal.fire({
      title: 'Compra Realizada!',
      text: 'Seu pedido foi concluído com sucesso.',
      icon: 'success',
      confirmButtonText: 'Ótimo!',
      confirmButtonColor: '#28a745',
    }).then((result) => {
      if (result.isConfirmed) {
        clearCart();
      }
    });
  };

  return (
    <div id="carrinho-page">
      <div className="carrinho-container">
        <h2>🐾Seu carrinho de compras 🛒</h2>

        {cartItems.length === 0 ? (
          <p className="carrinho-vazio">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="carrinho-lista">
              {cartItems.map((item) => (
                <li key={item.id} className="carrinho-item">
                  <img
                    src={item.imagem}
                    alt={item.titulo}
                    className="item-imagem"
                  />
                  <div className="item-info">
                    <span className="item-titulo">{item.titulo}</span>
                    <span className="item-preco">
                      {item.quantity} x R${' '}
                      {item.preco.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="item-remover"
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>

            <div className="carrinho-total">
              <h3>Total: R$ {total.toFixed(2).replace('.', ',')}</h3>
              <button
                onClick={handleFinalizarCompra}
                className="finalizar-compra"
              >
                Finalizar Compra
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Carrinho;
