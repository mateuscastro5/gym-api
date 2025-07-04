const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
import sequelize from './config/database';

// Importar modelos para garantir que as associações sejam carregadas
import './models';

// Importar rotas
import alunoRoutes from './routes/alunoRoutes';
import instrutorRoutes from './routes/instrutorRoutes';
import treinoRoutes from './routes/treinoRoutes';
import pagamentoRoutes from './routes/pagamentoRoutes';
import emailRoutes from './routes/emailRoutes';
import usuarioRoutes from './routes/usuarioRoutes';
import backupRoutes from './routes/backupRoutes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/alunos', alunoRoutes);
app.use('/api/instrutores', instrutorRoutes);
app.use('/api/treinos', treinoRoutes);
app.use('/api/pagamentos', pagamentoRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/backup', backupRoutes);

// Rota de teste
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Academia - Sistema de Controle de Treinos',
    version: '1.0.0',
    endpoints: {
      alunos: '/api/alunos',
      instrutores: '/api/instrutores',
      treinos: '/api/treinos',
      pagamentos: '/api/pagamentos',
      email: '/api/email',
      usuarios: '/api/usuarios',
      backup: '/api/backup'
    }
  });
});

// Sincronizar banco de dados e iniciar servidor
async function startServer() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso.');

    await sequelize.sync({ alter: true });
    console.log('✅ Modelos sincronizados com o banco de dados.');

    app.listen(PORT, () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📖 Documentação: http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar o servidor:', error);
    process.exit(1);
  }
}

startServer();

export default app;
