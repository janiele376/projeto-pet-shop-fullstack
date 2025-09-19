import React, { useState } from 'react';
import { Modal, Button } from 'react-bootstrap';
import './Agendamento.css';
import api from '../../services/api'; 
import { useAuth } from '../../context/AuthContext'; 

function Agendamento() {
  // =========================================================
  // 1. ESTADOS E CONTEXTOS (DEVE SER O PRIMEIRO BLOCO)
  // =========================================================
  const { token, usuario } = useAuth(); 

  const [order, setOrder] = useState({
    name: '',
    contato: '',
    nomePet: '',
    data: '',
    hora: '',
    observacoes: '',
    items: [],
  });

  const [showModal, setShowModal] = useState(false);
  const [currentCategory, setCurrentCategory] = useState('');
  const [currentItem, setCurrentItem] = useState('');
  const [currentQuantity, setCurrentQuantity] = useState(1);
  
  // =========================================================
  // 2. DADOS ESTÁTICOS E FUNÇÕES AUXILIARES
  // =========================================================
  const menuItems = {
    banhoETosa: {
      'Banho comum': 70, 'Banho com hidratação': 90, 'Tosa higiênica': 60, 
      'Tosa na tesoura': 120, 'Tosa de raça': 130, 'Tosa bebê/filhote': 70, 
      'Escovação de dentes': 25, 'Limpeza de ouvidos': 20, 'Corte de unhas': 20,
    },
    servicosEsteticos: {
      'Hidratação de pele e pelos': 40, 'Escova e finalização': 30,
      'Coloração temporária (tintas atóxicas)': 35, 'Aromaterapia para pets': 45,
    },
    servicosVeterinarios: {
      'Consulta veterinária': 150, Vacinação: 100, 'Exames laboratoriais': 250,
      'Controle de pulgas e carrapatos': 100, 'Castração (em clínicas especializadas)': 700,
      'Acompanhamento geriátrico': 120, 'Atendimento de emergência': 400,
    },
    servicosBemEstarEComportamento: {
      Adestramento: 100, 'Aula individual ou pacotes': 450, 'Avaliação comportamental': 120,
      'Massagem para pets': 60, 'Acupuntura veterinária': 150, 'Terapia ocupacional animal': 100,
    },
    servicosAdcionais: {
      'Leva e traz (transporte do pet)': 50, Hospedagem: 100, 'Creche (Daycare)': 80,
      'Hotelzinho de fim de semana': 250, 'Passeios programados': 25, 'Pet sitter (visitas em casa)': 100,
    },
  };

  const categoriaNomes = {
    banhoETosa: 'Banho e Tosa', servicosEsteticos: 'Serviços Estéticos',
    servicosVeterinarios: 'Serviços Veterinários', servicosBemEstarEComportamento: 'Bem-estar e Comportamento',
    servicosAdcionais: 'Serviços Adicionais',
  };

  // 🛑 calculateTotal DEVE ser definido aqui!
  const calculateTotal = (items) => {
    return items.reduce((total, item) => {
      const price = menuItems[item.category]?.[item.name] || 0;
      return total + price * item.quantity;
    }, 0);
  };
  
  // =========================================================
  // 3. HANDLERS E FUNÇÕES DE REQUISIÇÃO
  // =========================================================

  // 🛑 handleCategoryClick DEVE ser definido aqui!
  const handleCategoryClick = (category) => {
    setCurrentCategory(category);
    setCurrentItem('');
    setCurrentQuantity(1);
    setShowModal(true);
  };

  // 🛑 handleAddItem DEVE ser definido aqui!
  const handleAddItem = () => {
    if (!currentItem || currentQuantity <= 0) {
      alert('Por favor, selecione um item e uma quantidade válida.');
      return;
    }

    const updateItems = [...order.items];
    const existingItemIndex = updateItems.findIndex(
      (item) => item.category === currentCategory && item.name === currentItem,
    );

    if (existingItemIndex !== -1) {
      updateItems[existingItemIndex].quantity += currentQuantity;
    } else {
      updateItems.push({
        category: currentCategory,
        name: currentItem,
        quantity: currentQuantity,
      });
    }

    setOrder({
      ...order,
      items: updateItems,
    });
    setShowModal(false);
  };

  // 🛑 handleSubmit DEVE ser definido aqui!
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!token) {
      alert('Você precisa estar logado para confirmar o agendamento.');
      window.location.href = '/login';
      return;
    }

    const { name, nomePet, data, hora, items, observacoes, contato } = order;

    if (!items.length) {
      alert('Você precisa selecionar pelo menos um serviço.');
      return;
    }

    const agendamentoData = {
      nomeDono: usuario?.nome || name, 
      telefoneContato: contato,
      nomePet: nomePet,
      data: data,
      hora: hora,
      observacoes: observacoes,
      servicos: items.map((item) => ({
        categoria: item.category,
        nomeServico: item.name,
        quantidade: item.quantity,
      })),
      total: calculateTotal(items),
    };

    try {
      const response = await api.post('/agendamentos', agendamentoData);

      if (response.status === 201) {
        alert('Agendamento realizado com sucesso!');
        setOrder({
          name: '', contato: '', nomePet: '', data: '', hora: '', observacoes: '', items: [],
        });
      } else {
        alert('Resposta inesperada do servidor. Agendamento pode ter falhado.');
      }
    } catch (error) {
      console.error('Erro na requisição:', error);
      const errorMessage = error.response?.data?.message || 'Não foi possível conectar com o servidor. Tente novamente mais tarde.';
      alert(`Erro ao agendar: ${errorMessage}`);
    }
  };
  
  // =========================================================
  // 4. RENDERIZAÇÃO (Onde as variáveis são usadas)
  // =========================================================

  return (
    <div className="order-container">
      <div className="order-box">
        <h2>Agendamento de Serviço</h2>
        <form onSubmit={handleSubmit}>
          {/* ... Todos os campos que usam order, setOrder, etc. */}
          <div className="form-group">
            <label htmlFor="name">Nome do Dono:</label>
            <input
              type="text" id="name" value={order.name}
              onChange={(e) => setOrder({ ...order, name: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="contato">Telefone de Contato:</label>
            <input
              type="tel" id="contato" value={order.contato}
              onChange={(e) => setOrder({ ...order, contato: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="nomePet">Nome do Pet:</label>
            <input
              type="text" id="nomePet" value={order.nomePet}
              onChange={(e) => setOrder({ ...order, nomePet: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="data">Data:</label>
            <input
              type="date" id="data" value={order.data}
              onChange={(e) => setOrder({ ...order, data: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="hora">Horário:</label>
            <input
              type="time" id="hora" value={order.hora}
              onChange={(e) => setOrder({ ...order, hora: e.target.value })}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="observacoes">
              Observações (alergias, cuidados especiais, etc):
            </label>
            <textarea
              id="observacoes" rows="4" value={order.observacoes}
              onChange={(e) => setOrder({ ...order, observacoes: e.target.value })}
              placeholder="Ex: Pet com alergia a shampoo, comportamento agressivo com outros animais, etc."
            />
          </div>

          <div className="menu-category-list">
            {/* Agora ele encontra menuItems, handleCategoryClick e categoriaNomes */}
            {Object.keys(menuItems).map((category) => (
              <button
                key={category} type="button"
                onClick={() => handleCategoryClick(category)}
                className="category-button"
              >
                {categoriaNomes[category]}
              </button>
            ))}
          </div>

          {/* Agora ele encontra calculateTotal e order */}
          <h3>Total: R$ {calculateTotal(order.items).toFixed(2)}</h3>

          <ul className="order-summary">
            {order.items.map((item, index) => (
              <li key={index}>
                {item.quantity}x {item.name} ({categoriaNomes[item.category]}) -
                R${' '}
                {(menuItems[item.category][item.name] * item.quantity).toFixed(2)}
              </li>
            ))}
          </ul>

          <button type="submit" className="btn btn-success">
            Confirmar Agendamento
          </button>
        </form>
      </div>

      {/* MODAL */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Selecione o item e a quantidade</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="itemSelect">Item</label>
            {/* Agora ele encontra currentItem e setCurrentItem */}
            <select
              id="itemSelect" value={currentItem}
              onChange={(e) => setCurrentItem(e.target.value)}
              className="form-control"
            >
              <option value="">Selecione um item</option>
              {/* Agora ele encontra menuItems e currentCategory */}
              {Object.keys(menuItems[currentCategory] || {}).map((item) => (
                <option key={item} value={item}>
                  {item} - R$ {menuItems[currentCategory][item].toFixed(2)}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="quantity">Quantidade:</label>
            {/* Agora ele encontra currentQuantity e setCurrentQuantity */}
            <input
              type="number" id="quantity" value={currentQuantity}
              onChange={(e) => setCurrentQuantity(parseInt(e.target.value))}
              min="1" className="form-control"
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </Button>
          <Button variant="primary" onClick={handleAddItem}>
            Adicionar Serviço
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

export default Agendamento;