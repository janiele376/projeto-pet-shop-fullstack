import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

const CartContext = createContext();

const LOCAL_STORAGE_KEY = 'guestCartItems';

// Funções auxiliares para gerenciar o carrinho local
const getGuestCart = () => {
  try {
    const items = localStorage.getItem(LOCAL_STORAGE_KEY);
    return items ? JSON.parse(items) : [];
  } catch (error) {
    console.error("Erro ao ler carrinho do localStorage:", error);
    return [];
  }
};

const saveGuestCart = (items) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.error("Erro ao salvar carrinho no localStorage:", error);
  }
};


export const CartProvider = ({ children }) => {
  const { usuario, loading: authLoading } = useAuth(); 
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(false);

  // ----------------------------------------------------
  // FUNÇÃO PRINCIPAL: Buscar carrinho (Backend ou Local)
  // ----------------------------------------------------
  const fetchCart = useCallback(async () => {
    const token = localStorage.getItem('token'); 
    
    // 1. USUÁRIO NÃO LOGADO: Usa o carrinho local
    if (!token || !usuario) {
      setCartItems(getGuestCart());
      return; 
    }
    
    // 2. USUÁRIO LOGADO: Busca no backend
    setLoading(true);
    try {
      const response = await api.get('/carrinho', {
        headers: { Authorization: `Bearer ${token}` }, 
      });

      setCartItems(
        Array.isArray(response.data.itens)
          ? response.data.itens.map((item) => ({
              id: item.id, 
              produtoId: item.produto.id,
              nome: item.produto.nome,
              preco: Number(item.produto.preco) || 0, 
              quantidade: item.quantidade,
              imagem_url: item.produto.imagem_url,
            }))
          : [],
      );
    } catch (error) {
      console.error('Erro ao carregar carrinho:', error);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  }, [usuario]); 

  // EFEITO: Inicialização e Sincronização após Login
  useEffect(() => {
    if (!authLoading) {
      fetchCart();
    }
    if (usuario && !authLoading) {
        const guestItems = getGuestCart();
        if (guestItems.length > 0) {
            fetchCart().then(() => {
                localStorage.removeItem(LOCAL_STORAGE_KEY);
            });
        }
    }
  }, [usuario, authLoading, fetchCart]);


  // ----------------------------------------------------
  // FUNÇÃO PRINCIPAL: Adicionar produto
  // ----------------------------------------------------
  const addToCart = useCallback(async (produto, quantidade = 1) => {
    const token = localStorage.getItem('token');
    
    // 1. USUÁRIO NÃO LOGADO: Adiciona no localStorage
    if (!token || !usuario) {
      if (!produto || !produto.id) {
          console.error("Erro: Objeto do produto inválido passado para addToCart.");
          return;
      }

      const currentItems = getGuestCart();
      const existingItem = currentItems.find(item => item.produtoId === produto.id);

      if (existingItem) {
        existingItem.quantidade = Number(existingItem.quantidade) + Number(quantidade);
      } else {
        currentItems.push({
          id: `guest_${Date.now()}`, 
          produtoId: produto.id,
          nome: produto.nome,
          preco: Number(produto.preco) || 0,
          quantidade: Number(quantidade) || 1, 
          imagem_url: produto.imagem_url,
        });
      }

      saveGuestCart(currentItems);
      setCartItems(currentItems);
      return;
    }
    
    // 2. USUÁRIO LOGADO: Adiciona no backend
    try {
      await api.post(
        '/carrinho/adicionar',
        { produtoId: produto.id, quantidade }, 
        { headers: { Authorization: `Bearer ${token}` } }, 
      );
      
      await fetchCart(); 
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
    }
  }, [usuario, fetchCart]);
  
  
  // ----------------------------------------------------
  // OUTRAS FUNÇÕES
  // ----------------------------------------------------

  const removeFromCart = useCallback(async (itemId) => {
    const token = localStorage.getItem('token');
    
    // 1. NÃO LOGADO: Remove do localStorage
    if (!token || !usuario) {
        let currentItems = getGuestCart();
        currentItems = currentItems.filter(item => item.id !== itemId);
        saveGuestCart(currentItems);
        setCartItems(currentItems);
        return;
    }
    
    // 2. LOGADO: Remove do backend
    try {
      await api.delete(`/carrinho/remover/${itemId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchCart();
    } catch (error) {
      console.error('Erro ao remover produto:', error);
    }
  }, [usuario, fetchCart]);

  const clearCart = useCallback(async () => {
    const token = localStorage.getItem('token');
    
    // 1. NÃO LOGADO: Limpa o localStorage
    if (!token || !usuario) {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
        setCartItems([]);
        return;
    }

    // 2. LOGADO: Limpa o backend
    try {
      // 🛑 CORREÇÃO FINAL PARA O 404: 
      // Usamos POST /carrinho/limpar, que é comum para rotas de ação
      await api.post('/carrinho/limpar', null, { 
        headers: { Authorization: `Bearer ${token}` },
      });
      setCartItems([]);
    } catch (error) {
      console.error('Erro ao limpar carrinho:', error);
    }
  }, [usuario]);
  
  // Calcula o total com segurança contra NaN
  const cartTotal = cartItems.reduce((acc, item) => 
      acc + (Number(item.preco) || 0) * (Number(item.quantidade) || 0)
  , 0);


  return (
    <CartContext.Provider
      value={{
        cartItems,
        loading,
        fetchCart,
        addToCart,
        removeFromCart,
        clearCart,
        cartTotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);