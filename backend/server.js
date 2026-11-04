const express = require('express');
const sequelize = require('./src/config/database');
const { configurarSeguranca } = require('./src/config/seguranca');
const tratarErro = require('./src/middlewares/tratarErro');
require('dotenv').config();

const app = express();
configurarSeguranca(app);
app.use(express.json({ limit: '16kb' }));
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/usuarios', require('./src/routes/usuarioRoutes'));
app.use('/api/mesas', require('./src/routes/mesaRoutes'));
app.use('/api/categorias', require('./src/routes/categoriaRoutes'));
app.use('/api/produtos', require('./src/routes/produtoRoutes'));
app.use('/api/pedidos', require('./src/routes/pedidoRoutes'));
app.use('/api/dashboard', require('./src/routes/dashboardRoutes'));

app.get('/', (req, res) => {
  res.json({ status: 'GiraMesa API rodando' });
});

app.use((req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(tratarErro);

const PORT = process.env.PORT || 3001;

sequelize.authenticate()
  .then(() => {
    console.log('Conexao com MySQL estabelecida.');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco:', err.message);
  });
