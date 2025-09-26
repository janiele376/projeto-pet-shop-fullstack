import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar carrinho
  const fetchCart = useCallback(async () => {
    // Pega o token diretamente do localStorage ou usa o objeto do usuário
    const token = localStorage.getItem('token'); 
    
    if (!token) {
        setCartItems([]);
        return;
    }
    
    setLoading(true);
    try {
      const response = await api.get('/carrinho', {
        // Agora usa o token obtido localmente, garantindo que a requisição seja feita.
        headers: { Authorization: `Bearer ${token}` }, 
      });

      setCartItems(
        Array.isArray(response.data.itens)
          ? response.data.itens.map((item) => ({
              id: item.id,
              produtoId: item.produto.id,
              nome: item.produto.nome,
              preco: item.produto.preco,
              quantidade: item.quantidade,
              imagem_url: item.produto.imagem_url,
            }))
          : [],
      );
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
    } finally {
      setLoading(false);
    }
  }, []); 

  // 🛑 NOVO EFEITO: Carrega o carrinho quando o usuário é carregado pelo AuthContext
  useEffect(() => {
      // Se o usuário foi carregado (mesmo que seja null) e não estivermos carregando o AuthContext, tenta buscar.
      if (usuario !== undefined) { 
          fetchCart();
      }
  }, [usuario, fetchCart]);


  // Adicionar produto
  const addToCart = async (produtoId, quantidade = 1) => {
    const token = localStorage.getItem('token');
    if (!token) return; // Bloqueia se não houver token

    try {
      await api.post(
        '/carrinho/adicionar',
        { produtoId, quantidade },
        // Garante que o token está no header
        { headers: { Authorization: `Bearer ${token}` } }, 
      );
      
      // Chamada para atualizar a lista após a adição no backend
      await fetchCart(); 
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  // Remover produto
  const removeFromCart = async (itemId) => {
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      await api.delete(`/carrinho/remover/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      await api.delete('/carrinho/limpar', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Hook para usar o contexto
export const useCart = () => useContext(CartContext);
