import React, { useEffect } from 'react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api'; // 👈 IMPORTANDO O MÓDULO API
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
        // ✅ RENOMEANDO: clearCart NÃO existe mais, agora é clearLocalCart no CartContext
        clearLocalCart, 
    } = useCart();

    // Carrega o carrinho ao logar (manter)
    useEffect(() => {
        if (usuario) fetchCart();
    }, [usuario, fetchCart]);

    // Calcula total do carrinho (manter)
    const total = cartItems.reduce(
        (acc, item) => acc + parseFloat(item.preco) * item.quantidade,
        0,
    );

    // Aumenta quantidade de um produto
    // ⚠️ CORREÇÃO: Você precisa passar o objeto produto para o addToCart, não apenas o ID.
    const adicionarProduto = async (item) => {
        // Encontra o produto completo no seu array de cartItems para passar ao Context
        const produtoParaAdicionar = {
            id: item.produtoId, // Usando produtoId (ID do produto) para a lógica
            nome: item.nome,
            preco: item.preco,
            imagem_url: item.imagem_url,
        };
        await addToCart(produtoParaAdicionar, 1);
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
            // ⚠️ CORREÇÃO CHAVE: Usando a instância 'api' (Axios/Wrapper) importada
            const response = await api.post('/carrinho/finalizar', {}, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`, // Pegar o token do localStorage é mais seguro
                    'Content-Type': 'application/json',
                },
            });

            // O backend DEVE limpar o carrinho do usuário logado após esta requisição.

            Swal.fire({
                icon: 'success',
                title: 'Compra realizada!',
                text: `Seu pedido foi concluído com sucesso.`,
            });
            
            // ✅ CORREÇÃO CHAVE: Rebusca o carrinho para refletir o estado vazio do backend.
            await fetchCart(); 
            
            // Se você tivesse usuários não logados, usaria:
            // clearLocalCart(); 

            navigate('/', { replace: true });
        } catch (error) {
            // Se o backend falhar (ex: status 400/500), tratamos o erro
            const errorMessage = error.response?.data?.message || 'Houve um problema ao processar seu pedido.';
            
            Swal.fire({
                icon: 'error',
                title: 'Erro na compra',
                text: errorMessage,
            });
        }
    };

    // ... (restante do código JSX permanece inalterado)

    if (loading) {
        return <div className="carrinho-loading">Carregando itens...</div>;
    }

    return (
        <div id="carrinho-page">
            <div className="carrinho-container">
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
                                            onClick={() => adicionarProduto(item)} // 👈 Passando o item completo
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