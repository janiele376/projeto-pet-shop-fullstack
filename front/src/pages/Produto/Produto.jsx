import React from 'react';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import './Produto.css';

function Produto({ produto }) {
  const { addToCart } = useCart();

  const handleAddToCart = async () => {
    try {
      // 🛑 CORREÇÃO AQUI: Passar apenas o ID do produto, não o objeto inteiro.
      await addToCart(produto.id, 1); 
      toast.success(`"${produto.nome}" foi adicionado ao carrinho!`);
    } catch (error) {
      // É bom exibir o erro real no console para debug
      console.error("Erro detalhado ao adicionar produto:", error); 
      toast.error(`Erro ao adicionar "${produto.nome}" ao carrinho.`);
    }
  };

  return (
    <div className="produto-card">
      <img
        src={produto.imagem_url || '/placeholder.jpg'}
        alt={produto.nome}
        className="produto-imagem"
      />
      <h3 className="produto-titulo">{produto.nome}</h3>
      <p className="produto-preco">
        Preço: R$ {parseFloat(produto.preco).toFixed(2).replace('.', ',')}
      </p>
      <p className="produto-descricao">{produto.descricao}</p>
      <button onClick={handleAddToCart} className="produto-botao-carrinho">
        Adicionar ao Carrinho
      </button>
    </div>
  );
}

export default Produto;