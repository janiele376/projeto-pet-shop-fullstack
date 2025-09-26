// src/context/CartContext.js
import React, { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const { usuario } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // Buscar carrinho
  const fetchCart = useCallback(async () => {
    if (!usuario) return;
    setLoading(true);
    try {
      const response = await api.get('/carrinho', {
        headers: { Authorization: `Bearer ${usuario.token}` },
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
  }, [usuario]);

  // Adicionar produto
  const addToCart = async (produtoId, quantidade = 1) => {
    if (!usuario) return;
    try {
      await api.post(
        '/carrinho/adicionar',
        { produtoId, quantidade },
        { headers: { Authorization: `Bearer ${usuario.token}` } },
      );
      await fetchCart();
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  };

  // Remover produto
  const removeFromCart = async (itemId) => {
    try {
      await api.delete(`/carrinho/remover/${itemId}`, {
        headers: { Authorization: `Bearer ${usuario.token}` },
      });
      await fetchCart();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  };

  // Limpar carrinho
  const clearCart = async () => {
    try {
      await api.delete('/carrinho/limpar', {
        headers: { Authorization: `Bearer ${usuario.token}` },
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
