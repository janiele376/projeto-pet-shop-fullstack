import React from 'react';
import './Login.css';
import { FaGoogle } from 'react-icons/fa';

function Login() {
  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Entrar</h2>
        <form>
          <input type="email" placeholder="E-mail" required />
          <input type="password" placeholder="Senha" required />
          <div className="login-links">
            <a href="#">Esqueceu a senha?</a>
          </div>
          <button type="submit" className="btn-login">
            Entrar
          </button>
        </form>

        <div className="google-login">
          <button className="btn-google" type="button">
            <FaGoogle className="icon" />
            Entrar com o Google
          </button>
        </div>

        <div className="register-link">
          <h6>
            Não tem uma conta? <a href="#">Criar conta</a>
          </h6>
        </div>
      </div>
    </div>
  );
}

export default Login;
