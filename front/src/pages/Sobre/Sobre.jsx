import React, { useEffect } from 'react';
import './Sobre.css';
import petshopImg from '../../assets/imagens/petshop.png';
import petshopImg2 from '../../assets/imagens/antes.png';
import petshopImg3 from '../../assets/imagens/depois.png';

function Sobre() {
  useEffect(() => {
    const abrirImagem = (src) => {
      const modal = document.getElementById('imgModal');
      const imagem = document.getElementById('imgAmpliada');
      imagem.src = src;
      modal.classList.add('mostrar');
    };

    const fecharImagem = () => {
      document.getElementById('imgModal').classList.remove('mostrar');
    };

    const imagens = document.querySelectorAll('.galery img');
    imagens.forEach((img) => {
      img.addEventListener('click', () => abrirImagem(img.src));
    });

    return () => {
      imagens.forEach((img) => {
        img.removeEventListener('click', () => abrirImagem(img.src));
      });
    };
  }, []);

  return (
    <>
      {/* Conteúdo principal */}
      <section id="main">
        <article className="about">
          <h1 id="h1"> História do Pet Shop Feliz </h1>
          <p>
            Desde a sua fundação em 2018, a pet sempre teve seus valores bem definidos: amor pelos animais, qualidade dos produtos e excelência no atendimento. Idealizada por amigos, a empresa nasceu com a missão de ser mais do que um pet shop online – um parceiro de confiança para todos os tutores. Acreditamos que cada pet é único e merece o melhor cuidado, por isso, dedicamos tempo e atenção na seleção de cada item do nosso catálogo. Nossa história é construída sobre a confiança dos nossos clientes e o nosso compromisso contínuo em superar suas expectativas. Olhamos para o futuro com a mesma paixão do início, buscando sempre novas formas de fortalecer o vínculo entre humanos e animais e de contribuir para um mundo pet mais feliz e saudável.
          </p>
      
          <div className="galery">
            <figure>
              <img src={petshopImg2} alt="Fachada antiga do Pet Shop Feliz" />
              <figcaption style={{ textAlign: 'center' }}>
                Nos primeiros anos do Pet Shop Feliz
              </figcaption>
            </figure>
          </div>

          <div className="galery">
            <figure>
              <img src={petshopImg3} alt="Nova fachada do Pet Shop Feliz" />
              <figcaption>Fachada moderna após a expansão</figcaption>
            </figure>

            <figure>
              <img src={petshopImg} alt="Donos do Petshop na frente do local" />
              <figcaption>
                Quem fez tudo isso acontecer desde o começo!
              </figcaption>
            </figure>
          </div>
        </article>
      </section>

      {/* Modal de imagem */}
      <div
        id="imgModal"
        className="img-modal"
        onClick={() =>
          document.getElementById('imgModal').classList.remove('mostrar')
        }
      >
        <img
          className="img-modal-content"
          id="imgAmpliada"
          alt="imagem ampliada"
          onClick={(e) => e.stopPropagation()}
        />
      </div>
    </>
  );
}

export default Sobre;
