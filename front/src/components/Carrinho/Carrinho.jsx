import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import './Carrinho.css';

const Carrinho = () => {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const {
    cartItems,
    loading,
    fetchCart,
    addToCart,
    removeFromCart,
    clearCart,
  } = useCart();

  // Carrega o carrinho ao logar
  useEffect(() => {
    if (usuario) fetchCart();
  }, [usuario, fetchCart]);

  // Calcula total do carrinho
  const total = cartItems.reduce(
    (acc, item) => acc + parseFloat(item.preco) * item.quantidade,
    0,
  );

  // Aumenta quantidade de um produto
  const adicionarProduto = async (produtoId) => {
    await addToCart(produtoId, 1);
  };

  // Finaliza a compra
  const handleFinalizarCompra = async () => {
    if (!usuario) {
      Swal.fire({
        icon: 'warning',
        title: 'Você precisa estar logado!',
        text: 'Faça login para finalizar sua compra.',
        confirmButtonText: 'Login',
      }).then(() => navigate('/login'));
      return;
    }

    if (cartItems.length === 0) {
      Swal.fire({
        icon: 'info',
        title: 'Carrinho vazio',
        text: 'Adicione produtos antes de finalizar a compra.',
      });
      return;
    }

    try {
      // NOTE: Este endpoint de API precisa ser verificado no backend
      const response = await fetch('/carrinho/finalizar', { 
        method: 'POST',
        headers: {
          Authorization: `Bearer ${usuario.token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Falha ao finalizar compra.');
      }

      Swal.fire({
        icon: 'success',
        title: 'Compra realizada!',
        text: `Seu pedido foi concluído com sucesso.`,
      });

      clearCart();
      navigate('/', { replace: true });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Erro na compra',
        text: error.message || 'Houve um problema ao processar seu pedido.',
      });
    }
  };

  if (loading) {
    return <div className="carrinho-loading">Carregando itens...</div>;
  }

  return (
    <div id="carrinho-page">
      <div className="carrinho-container">
        {/* CONFLITO RESOLVIDO: Mesclando o título amigável e a tag H2 */}
        <h2>🐾 Seu carrinho de compras 🛒</h2>

        {cartItems.length === 0 ? (
          <p className="carrinho-vazio">Seu carrinho está vazio.</p>
        ) : (
          <>
            <ul className="carrinho-lista">
              {cartItems.map((item) => (
                <li key={item.id} className="carrinho-item">
                  <img
                    src={item.imagem_url || '/placeholder.jpg'}
                    alt={item.nome}
                    className="item-imagem"
                  />
                  <div className="item-info">
                    <span className="item-titulo">{item.nome}</span>
                    <span className="item-preco">
                      {item.quantidade} x R${' '}
                      {parseFloat(item.preco).toFixed(2).replace('.', ',')}
                    </span>
                    <button
                      className="adicionar-mais"
                      onClick={() => adicionarProduto(item.produtoId)}
                    >
                      +
                    </button>
                  </div>
                  <button
                    className="item-remover"
                    onClick={() => removeFromCart(item.id)}
                  >
                    Remover
                  </button>
                </li>
              ))}
            </ul>

            <div className="carrinho-total">
              <h3>Total: R$ {total.toFixed(2).replace('.', ',')}</h3>
              <button
                className="finalizar-compra"
                onClick={handleFinalizarCompra}
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
