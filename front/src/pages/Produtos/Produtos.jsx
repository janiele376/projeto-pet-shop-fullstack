import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Produto from '../Produto/Produto';
import './Produtos.css';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions'; // Hook para permissão
import api from '../../services/api'; // Instância de API
import Swal from 'sweetalert2';

function Produtos() {
  const navigate = useNavigate();
  // Autorização
  const { isVendedor, authLoading } = usePermissions();

  // ESTADOS
  const [termoPesquisa, setTermoPesquisa] = useState('');
  const [ordenacao, setOrdenacao] = useState('nenhum');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [produtoSelecionadoId, setProdutoSelecionadoId] = useState('');
  
  // ESTADOS DE FILTRO
  const [filtroMarca, setFiltroMarca] = useState('');
  const [filtroPreco, setFiltroPreco] = useState('');
  
  const [produtos, setProdutos] = useState([]); 
  const [loading, setLoading] = useState(true);
  
  const produtosPorPagina = 12;

  // FUNÇÃO DE CARREGAMENTO DE DADOS DO BACKEND (Callback para estabilidade)
  const fetchProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/produtos'); 
      setProdutos(response.data);
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      Swal.fire('Erro!', 'Não foi possível carregar o catálogo.', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  // EFEITO: CARREGAR DADOS NA MONTAGEM
  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);


  const produtosFiltrados = useMemo(() => {
    let filtrados = produtos.filter(
      (produto) =>
        (produto.nome.toLowerCase().includes(termoPesquisa.toLowerCase()) || 
        produto.descricao.toLowerCase().includes(termoPesquisa.toLowerCase())) &&
        (filtroMarca === '' || produto.marca === filtroMarca) 
    );
    
    // Lógica do Filtro de Preço
    if (filtroPreco) {
        filtrados = filtrados.filter(produto => {
            const preco = parseFloat(produto.preco); 
            if (filtroPreco === '0-50') return preco <= 50;
            if (filtroPreco === '51-100') return preco > 50 && preco <= 100;
            if (filtroPreco === '101-max') return preco > 100;
            return true;
        });
    }

    let ordenados = [...filtrados]; 

    // ORDENAÇÃO: Usar parseFloat para garantir a ordenação numérica
    switch (ordenacao) {
      case 'mais-barato':
        ordenados.sort((a, b) => parseFloat(a.preco) - parseFloat(b.preco));
        break;
      case 'mais-caro':
        ordenados.sort((a, b) => parseFloat(b.preco) - parseFloat(a.preco));
        break;
      default:
        break;
    }

    return ordenados;
  }, [termoPesquisa, ordenacao, produtos, filtroMarca, filtroPreco]); 

  // Paginação
  const indexUltimoProduto = paginaAtual * produtosPorPagina;
  const indexPrimeiroProduto = indexUltimoProduto - produtosPorPagina;
  const produtosPaginaAtual = produtosFiltrados.slice(
    indexPrimeiroProduto,
    indexUltimoProduto,
  );

  const totalPaginas = Math.ceil(produtosFiltrados.length / produtosPorPagina);
  const numerosPaginas = Array.from({ length: totalPaginas }, (_, i) => i + 1);

  const handleChangePage = (numero) => {
    setPaginaAtual(numero);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // FUNÇÃO PARA EXCLUIR PRODUTO (AGORA CHAMA A API)
  const handleExcluir = async () => {
    if (!isVendedor) {
      Swal.fire('Erro!', 'Você não tem permissão para excluir produtos.', 'error');
      return;
    }
    
    if (!produtoSelecionadoId) {
      Swal.fire('Atenção!', 'Selecione um produto primeiro!', 'warning');
      return;
    }

    const { isConfirmed } = await Swal.fire({
      title: 'Tem certeza?',
      text: 'Você não poderá reverter esta exclusão!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Sim, excluir!',
      cancelButtonText: 'Cancelar',
    });
    
    if (isConfirmed) {
      try {
        await api.delete(`/produtos/${produtoSelecionadoId}`); 
        await fetchProdutos(); 
        Swal.fire('Excluído!', 'O produto foi excluído com sucesso.', 'success');
        setProdutoSelecionadoId('');

      } catch (error) {
        const msg = error.response?.data?.message || 'Erro ao excluir no servidor.';
        Swal.fire('Erro!', msg, 'error');
      }
    }
  };
  
  if (loading || authLoading) {
    return <div className="pagina-produtos">Carregando catálogo...</div>;
  }
  
  return (
    <div className="pagina-produtos">
      <div className="app-container">
        <aside className="filtros">
          <h3>Filtrar por</h3>
          <div className="filtro-grupo">
            <h4>Tipo de Produto</h4>
            <label><input type="checkbox" /> Ração</label>
            <label><input type="checkbox" /> Brinquedos</label>
            <label><input type="checkbox" /> Acessórios</label>
            <label><input type="checkbox" /> Higiene</label>
          </div>

          <div className="filtro-grupo">
            <h4>Animal</h4>
            <label><input type="checkbox" /> Cachorro</label>
            <label><input type="checkbox" /> Gato</label>
            <label><input type="checkbox" /> Pássaro</label>
            <label><input type="checkbox" /> Roedor</label>
          </div>

          <div className="filtro-grupo">
            <h4>Marca</h4>
            <label><input type="checkbox" onChange={() => setFiltroMarca('Royal Canin')} /> Royal Canin</label>
            <label><input type="checkbox" onChange={() => setFiltroMarca('Pedigree')} /> Pedigree</label>
            <label><input type="checkbox" onChange={() => setFiltroMarca('Whiskas')} /> Whiskas</label>
          </div>

          <div className="filtro-grupo">
            <h4>Preço</h4>
            <label><input type="checkbox" onChange={() => setFiltroPreco('0-50')} /> Até R$50</label>
            <label><input type="checkbox" onChange={() => setFiltroPreco('51-100')} /> R$51 - R$100</label>
            <label><input type="checkbox" onChange={() => setFiltroPreco('101-max')} /> Acima de R$100</label>
          </div>
        </aside>

        <main className="produtos-area">
          <section className="sectionprodutos">
            <h2 align="center" className="h2produtos">
              🐾 Nossos Produtos
            </h2>

            {/* VISIBILIDADE: Botoes Cadastrar/Editar/Excluir */}
            {isVendedor && (
              <div className="botoes-produto">
                <button
                  className="botao-cadastrar-produto"
                  onClick={() => navigate('/cadastro-produto')}
                >
                  Cadastrar Produto
                </button>

                <select
                  value={produtoSelecionadoId}
                  onChange={(e) => setProdutoSelecionadoId(e.target.value)}
                >
                  <option value="">Selecione um produto</option>
                  {produtos.map((produto) => (
                    <option key={produto.id} value={produto.id}>
                      {produto.nome}
                    </option>
                  ))}
                </select>

                <button
                  className="botao-editar-produto"
                  onClick={() => {
                    if (produtoSelecionadoId) {
                      navigate(`/editar-produto/${produtoSelecionadoId}`);
                    } else {
                      Swal.fire('Atenção!', 'Selecione um produto primeiro para editar.', 'warning');
                    }
                  }}
                >
                  Editar Produto
                </button>

                <button className="botao-excluir-produto" onClick={handleExcluir}>
                  Excluir Produto
                </button>
              </div>
            )}
            
            {/* Pesquisa e ordenação */}
            <div className="filtros-container">
              <input
                type="text"
                placeholder="Pesquisar produtos..."
                className="barra-pesquisa"
                value={termoPesquisa}
                onChange={(e) => setTermoPesquisa(e.target.value)}
              />
              <select
                className="dropdown-ordenacao"
                value={ordenacao}
                onChange={(e) => setOrdenacao(e.target.value)}
              >
                <option value="nenhum">Relevância (Padrão)</option>
                <option value="mais-barato">Preço: Do mais barato</option>
                <option value="mais-caro">Preço: Do mais caro</option>
              </select>
            </div>

            {/* LISTA DE PRODUTOS */}
            <div className="produtos-lista">
              {produtosPaginaAtual.length > 0 ? (
                produtosPaginaAtual.map((produto) => (
                  // 🛑 LÓGICA DE SELEÇÃO: Envolve o componente Produto
                  <div 
                      key={produto.id} 
                      onClick={() => setProdutoSelecionadoId(String(produto.id))} // Seleciona ao clicar
                      className={String(produto.id) === produtoSelecionadoId ? 'produto-selecionado' : ''} // Adiciona classe 'selecionado'
                  >
                      <Produto produto={produto} />
                  </div>
                ))
              ) : (
                <p className="nenhum-produto-encontrado">
                  Nenhum produto encontrado com a pesquisa ou filtros aplicados.
                </p>
              )}
            </div>

            {/* Paginação */}
            <div className="paginacao">
              <button
                onClick={() => handleChangePage(paginaAtual - 1)}
                disabled={paginaAtual === 1}
              >
                Anterior
              </button>
              {numerosPaginas.map((numero) => (
                <button
                  key={numero}
                  onClick={() => handleChangePage(numero)}
                  className={numero === paginaAtual ? 'ativo' : ''}
                >
                  {numero}
                </button>
              ))}
              <button
                onClick={() => handleChangePage(paginaAtual + 1)}
                disabled={paginaAtual === totalPaginas}
              >
                Próximo
              </button>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

export default Produtos;
