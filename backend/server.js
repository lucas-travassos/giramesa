const express = require('express');
const cors = require('cors');
const sequelize = require('./src/config/database');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/usuarios', require('./src/routes/usuarioRoutes'));
app.use('/api/mesas', require('./src/routes/mesaRoutes'));
app.use('/api/categorias', require('./src/routes/categoriaRoutes'));
app.use('/api/produtos', require('./src/routes/produtoRoutes'));
app.use('/api/pedidos', require('./src/routes/pedidoRoutes'));

app.get('/', (req, res) => {
  res.json({ status: 'GiraMesa API rodando' });
});

const PORT = process.env.PORT || 3000;

sequelize.authenticate()
  .then(() => {
    console.log('Conexao com MySQL estabelecida.');
    app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
  })
  .catch((err) => {
    console.error('Erro ao conectar no banco:', err.message);
  });
