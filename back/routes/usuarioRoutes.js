import { Router } from 'express';
import {
  registrarUsuario,
  loginUsuario,
  listarUsuarios,
  deletarUsuario,
  getUsuarioPerfil,
  atualizarUsuario,
} from '../controllers/usuarioController.js';

import { verificarToken } from '../middleware/auth.js';

const router = Router();

router.put('/:id', atualizarUsuario);

router.post('/registrar', registrarUsuario);

router.post('/login', loginUsuario);

router.get('/perfil', verificarToken, getUsuarioPerfil);

router.get('/', listarUsuarios);

router.delete('/:id', deletarUsuario);

export default router;
