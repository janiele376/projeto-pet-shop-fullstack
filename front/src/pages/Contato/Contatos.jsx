import React from 'react';
import './Contatos.css';
import {
  FaFacebookF,
  FaInstagram,
  FaLinkedinIn,
  FaWhatsapp,
} from 'react-icons/fa';

function Contatos() {
  return (
    <section id="main" className="contato-section">
      <div className="container">
        <div className="order-box">
          <article className="boxC post">
            <header>
              <h2> Nos encontre através de: </h2>
            </header>
              <div className="social-icons">
              <a href="#" className="icon">
                <FaFacebookF />
              </a>
              <a href="#" className="icon">
                <FaInstagram />
              </a>
              <a href="#" className="icon">
                <FaLinkedinIn />
              </a>
              <a href="#" className="icon">
                <FaWhatsapp />
              </a>
            </div>

            <ul className="contact">
              <li>
               
                <p>
                 Endereço:Rua da sorte 002, 00102-003
                  <br />
                  Bairro Papicu  Fortaleza - Ce 
                  <br />
                <p>Contato: (85) 3200-0001 / (85) 3100-0002</p>
                  Email
                  <a Email href="mailto:contato@pet.com.br"> contato@pet.com.br</a>
                 </p>
                <p>Horário de Atendimento : Segunda a Sexta: 8h às 18h e Sábado: 8h às 12h
                </p>
              </li>
              
            </ul>
          </article>  
        </div>
      </div>
    </section>
  );
}

export default Contatos;
