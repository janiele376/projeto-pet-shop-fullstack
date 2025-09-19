import React from 'react';
import { useCart } from '../../context/CartContext';
import Swal from 'sweetalert2';
import './Carrinho.css';

const Carrinho = () => {
  const { cartItems, removeFromCart, clearCart } = useCart();

  const total = cartItems.reduce(
    (acc, item) => acc + item.preco * item.quantity,
    0,
  );

  const handleFinalizarCompra = () => {
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
        <h3> Carrinho de compras </h3>

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
