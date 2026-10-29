-- GiraMesa: estrutura e dados ficticios para uma instalacao nova.
-- Selecionar um banco VAZIO antes da importacao. Este arquivo nao e uma migration.
-- Nao remove tabelas nem atualiza dados existentes.
-- Senha publica das tres contas de demonstracao: 123456 (hash bcrypt abaixo).

SET NAMES utf8mb4;
SET time_zone = '+00:00';

CREATE TABLE usuarios (
  usuario_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL,
  senha VARCHAR(255) NOT NULL,
  nivel_acesso ENUM('garcom', 'caixa', 'administrador') NOT NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (usuario_id),
  UNIQUE KEY uq_usuarios_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE mesas (
  mesa_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  numero INT NOT NULL,
  status ENUM('disponivel', 'ocupada', 'caixa', 'inativa') NOT NULL DEFAULT 'disponivel',
  PRIMARY KEY (mesa_id),
  UNIQUE KEY uq_mesas_numero (numero)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE categorias (
  categoria_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nome VARCHAR(50) NOT NULL,
  PRIMARY KEY (categoria_id),
  UNIQUE KEY uq_categorias_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE produtos (
  produto_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  categoria_id INT UNSIGNED NOT NULL,
  nome VARCHAR(100) NOT NULL,
  descricao TEXT NOT NULL,
  preco DECIMAL(8,2) NOT NULL,
  status ENUM('ativo', 'inativo') NOT NULL DEFAULT 'ativo',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (produto_id),
  CONSTRAINT fk_produtos_categoria FOREIGN KEY (categoria_id)
    REFERENCES categorias (categoria_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pedidos (
  pedido_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  mesa_id INT UNSIGNED NOT NULL,
  usuario_id INT UNSIGNED NOT NULL,
  data_abertura DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  data_fechamento DATETIME NULL DEFAULT NULL,
  status ENUM('aberto', 'em_fechamento', 'finalizado') NOT NULL DEFAULT 'aberto',
  valor_total DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  PRIMARY KEY (pedido_id),
  CONSTRAINT fk_pedidos_mesa FOREIGN KEY (mesa_id)
    REFERENCES mesas (mesa_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_pedidos_usuario FOREIGN KEY (usuario_id)
    REFERENCES usuarios (usuario_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE itens_pedido (
  item_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pedido_id INT UNSIGNED NOT NULL,
  produto_id INT UNSIGNED NOT NULL,
  quantidade INT NOT NULL DEFAULT 1,
  preco_unitario DECIMAL(8,2) NOT NULL,
  observacao VARCHAR(255) NULL,
  PRIMARY KEY (item_id),
  CONSTRAINT fk_itens_pedido FOREIGN KEY (pedido_id)
    REFERENCES pedidos (pedido_id) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT fk_itens_produto FOREIGN KEY (produto_id)
    REFERENCES produtos (produto_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE pagamentos (
  pagamento_id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  pedido_id INT UNSIGNED NOT NULL,
  forma_pagamento ENUM('dinheiro', 'debito', 'credito', 'pix') NOT NULL,
  valor DECIMAL(8,2) NOT NULL,
  data_pagamento DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (pagamento_id),
  CONSTRAINT fk_pagamentos_pedido FOREIGN KEY (pedido_id)
    REFERENCES pedidos (pedido_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Contas ficticias. O hash foi gerado para a senha publica 123456,
-- sem consultar ou exportar credenciais do banco de desenvolvimento.
INSERT INTO usuarios (nome, email, senha, nivel_acesso) VALUES
  ('Administrador Demo', 'admin@giramesa.com', '$2b$10$LzVZ1XdlFCkl9b7B5UhnPetb5HNsbO5T/9aszZHYaEk3kq9asXq.W', 'administrador'),
  ('Caixa Demo', 'caixa@giramesa.com', '$2b$10$LzVZ1XdlFCkl9b7B5UhnPetb5HNsbO5T/9aszZHYaEk3kq9asXq.W', 'caixa'),
  ('Garçom Demo', 'garcom@giramesa.com', '$2b$10$LzVZ1XdlFCkl9b7B5UhnPetb5HNsbO5T/9aszZHYaEk3kq9asXq.W', 'garcom');

INSERT INTO mesas (numero) VALUES (1), (2), (3), (4), (5), (6);

-- Nomes compativeis com backend/src/seeders/seed.js.
INSERT INTO categorias (nome) VALUES
  ('Refrigerantes'), ('Sucos'), ('Pizzas'), ('Hamburguers');
