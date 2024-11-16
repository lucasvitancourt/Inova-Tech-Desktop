-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Tempo de geração: 16/11/2024 às 23:06
-- Versão do servidor: 10.4.32-MariaDB
-- Versão do PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Banco de dados: `inova_tech`
--

-- --------------------------------------------------------

--
-- Estrutura para tabela `cargos`
--

CREATE TABLE `cargos` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `cargos`
--

INSERT INTO `cargos` (`id`, `nome`, `descricao`) VALUES
(1, 'Administrador', 'Gerencia as operações do sistema.'),
(2, 'Vendedor', 'Responsável pelas vendas e atendimento ao cliente.'),
(3, 'Estoquista', 'Gerencia o estoque de produtos.');

-- --------------------------------------------------------

--
-- Estrutura para tabela `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `categorias`
--

INSERT INTO `categorias` (`id`, `nome`, `descricao`) VALUES
(1, 'Eletrônicos', 'Produtos eletrônicos como TVs, computadores, etc.'),
(2, 'Roupas', 'Vestuário masculino e feminino.'),
(3, 'Alimentos', 'Produtos alimentícios e bebidas.');

-- --------------------------------------------------------

--
-- Estrutura para tabela `clientes`
--

CREATE TABLE `clientes` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `sobrenome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cpf_cnpj` varchar(14) NOT NULL,
  `cep` varchar(10) NOT NULL,
  `estado` varchar(100) NOT NULL,
  `cidade` varchar(100) NOT NULL,
  `pais_id` int(11) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `clientes`
--

INSERT INTO `clientes` (`id`, `nome`, `sobrenome`, `email`, `telefone`, `cpf_cnpj`, `cep`, `estado`, `cidade`, `pais_id`, `senha`, `created_at`, `updated_at`) VALUES
(1, 'Ana', 'Souza', 'ana@inovatech.com', '4567-8901', '12345678909', '12345-678', 'SP', 'São Paulo', 1, '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(2, 'Roberto', 'Lima', 'roberto@inovatech.com', '5678-9012', '12345678901', '23456-789', 'RJ', 'Rio de Janeiro', 1, '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(3, 'Fernanda', 'Gomes', 'fernanda@inovatech.com', '6789-0123', '12345678902', '34567-890', 'MG', 'Belo Horizonte', 1, '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', '2024-10-19 17:02:39', '2024-10-19 17:02:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `fornecedores`
--

CREATE TABLE `fornecedores` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `cnpj` varchar(14) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `endereco` text DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `pais_id` int(11) DEFAULT NULL,
  `site` varchar(100) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `fornecedores`
--

INSERT INTO `fornecedores` (`id`, `nome`, `cnpj`, `telefone`, `email`, `endereco`, `cidade`, `estado`, `pais_id`, `site`, `created_at`, `updated_at`) VALUES
(1, 'Fornecedor A', '12345678000195', '11-98765-4321', 'contato@fornecedorA.com', 'Rua A, 123', 'São Paulo', 'SP', 1, 'www.fornecedora.com', '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(2, 'Fornecedor B', '12345678000196', '21-87654-3210', 'contato@fornecedorB.com', 'Avenida B, 456', 'Rio de Janeiro', 'RJ', 1, 'www.fornecedorb.com', '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(3, 'Fornecedor C', '12345678000197', '31-76543-2109', 'contato@fornecedorC.com', 'Rua C, 789', 'Belo Horizonte', 'MG', 1, 'www.fornecedorc.com', '2024-10-19 17:02:39', '2024-10-19 17:02:39');

-- --------------------------------------------------------

--
-- Estrutura para tabela `funcionarios`
--

CREATE TABLE `funcionarios` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `cargo_id` int(11) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `ativo` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `funcionarios`
--

INSERT INTO `funcionarios` (`id`, `nome`, `email`, `senha`, `cargo_id`, `telefone`, `created_at`, `updated_at`, `ativo`) VALUES
(1, 'João Silva', 'joao@inovatech.com', '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', 1, '1234-5678', '2024-10-19 17:02:39', '2024-10-19 17:02:39', 1),
(2, 'Maria Oliveira', 'maria@inovatech.com', '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', 2, '2345-6789', '2024-10-19 17:02:39', '2024-10-19 17:02:39', 1),
(3, 'Carlos Pereira', 'carlos@inovatech.com', '$2b$10$X7GYtVZBVZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX9vZjZX', 3, '3456-7890', '2024-10-19 17:02:39', '2024-10-19 17:02:39', 1);

-- --------------------------------------------------------

--
-- Estrutura para tabela `itens_pedido`
--

CREATE TABLE `itens_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `produto_id` int(11) DEFAULT NULL,
  `quantidade` int(11) NOT NULL,
  `preco_unitario` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `itens_pedido`
--

INSERT INTO `itens_pedido` (`id`, `pedido_id`, `produto_id`, `quantidade`, `preco_unitario`) VALUES
(1, 1, 1, 1, 1999.99),
(3, 2, 3, 10, 15.99),
(4, 3, 1, 1, 1999.99),
(6, 1, 1, 1, 1999.00),
(7, 4, 1, 2, 3123.00),
(12, 7, 1, 23, 1999.99);

-- --------------------------------------------------------

--
-- Estrutura para tabela `notas_fiscais`
--

CREATE TABLE `notas_fiscais` (
  `id` int(11) NOT NULL,
  `numero` varchar(50) NOT NULL,
  `data_emissao` datetime NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `pedido_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `notas_fiscais`
--

INSERT INTO `notas_fiscais` (`id`, `numero`, `data_emissao`, `valor_total`, `pedido_id`, `created_at`, `updated_at`) VALUES
(1, 'NF001', '2024-10-19 14:02:39', 2075.97, 1, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(3, 'NF003', '2024-10-19 14:02:39', 1159.80, 3, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(4, '123', '2024-10-12 00:00:00', 1.00, 1, '2024-10-19 18:25:01', '2024-10-19 18:25:01');

-- --------------------------------------------------------

--
-- Estrutura para tabela `paises`
--

CREATE TABLE `paises` (
  `id` int(11) NOT NULL,
  `nome` varchar(100) NOT NULL,
  `codigo_iso` char(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `paises`
--

INSERT INTO `paises` (`id`, `nome`, `codigo_iso`) VALUES
(1, 'Brasil', 'BRA'),
(3, 'Chile', 'CHL');

-- --------------------------------------------------------

--
-- Estrutura para tabela `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `data_pedido` datetime NOT NULL,
  `valor_total` decimal(10,2) NOT NULL,
  `funcionario_id` int(11) DEFAULT NULL,
  `cliente_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `pedidos`
--

INSERT INTO `pedidos` (`id`, `data_pedido`, `valor_total`, `funcionario_id`, `cliente_id`, `created_at`, `updated_at`) VALUES
(1, '2024-10-19 14:02:39', 2075.97, 1, 1, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(2, '2024-10-19 14:02:39', 300.98, 2, 2, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(3, '2024-10-19 14:02:39', 1159.80, 3, 3, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(4, '0033-02-12 00:00:00', 12344.00, 1, 3, '2024-10-19 17:37:43', '2024-10-19 17:37:43'),
(7, '2024-11-08 00:00:00', 45999.77, 3, 1, '2024-10-21 02:37:27', '2024-10-21 02:37:27');

-- --------------------------------------------------------

--
-- Estrutura para tabela `produtos`
--

CREATE TABLE `produtos` (
  `id` int(11) NOT NULL,
  `nome` varchar(255) NOT NULL,
  `descricao` text DEFAULT NULL,
  `preco` decimal(10,2) NOT NULL,
  `quantidade_estoque` int(11) NOT NULL,
  `unidade_medida` varchar(50) DEFAULT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Despejando dados para a tabela `produtos`
--

INSERT INTO `produtos` (`id`, `nome`, `descricao`, `preco`, `quantidade_estoque`, `unidade_medida`, `categoria_id`, `created_at`, `updated_at`) VALUES
(1, 'Smartphone XYZ', 'Smartphone com 128GB de memória', 1999.99, 50, 'unidade', 1, '2024-10-19 17:02:39', '2024-10-19 17:02:39'),
(3, 'Cerveja Artesanal', 'Cerveja artesanal de 500ml', 15.99, 200, 'unidade', 3, '2024-10-19 17:02:39', '2024-10-19 17:02:39');

--
-- Índices para tabelas despejadas
--

--
-- Índices de tabela `cargos`
--
ALTER TABLE `cargos`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `cpf_cnpj` (`cpf_cnpj`),
  ADD KEY `pais_id` (`pais_id`);

--
-- Índices de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `cnpj` (`cnpj`),
  ADD KEY `pais_id` (`pais_id`);

--
-- Índices de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `cargo_id` (`cargo_id`);

--
-- Índices de tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `produto_id` (`produto_id`);

--
-- Índices de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `numero` (`numero`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Índices de tabela `paises`
--
ALTER TABLE `paises`
  ADD PRIMARY KEY (`id`);

--
-- Índices de tabela `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `funcionario_id` (`funcionario_id`),
  ADD KEY `cliente_id` (`cliente_id`);

--
-- Índices de tabela `produtos`
--
ALTER TABLE `produtos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- AUTO_INCREMENT para tabelas despejadas
--

--
-- AUTO_INCREMENT de tabela `cargos`
--
ALTER TABLE `cargos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `fornecedores`
--
ALTER TABLE `fornecedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `funcionarios`
--
ALTER TABLE `funcionarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de tabela `itens_pedido`
--
ALTER TABLE `itens_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=13;

--
-- AUTO_INCREMENT de tabela `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de tabela `paises`
--
ALTER TABLE `paises`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de tabela `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT de tabela `produtos`
--
ALTER TABLE `produtos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restrições para tabelas despejadas
--

--
-- Restrições para tabelas `clientes`
--
ALTER TABLE `clientes`
  ADD CONSTRAINT `clientes_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `fornecedores`
--
ALTER TABLE `fornecedores`
  ADD CONSTRAINT `fornecedores_ibfk_1` FOREIGN KEY (`pais_id`) REFERENCES `paises` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `funcionarios`
--
ALTER TABLE `funcionarios`
  ADD CONSTRAINT `funcionarios_ibfk_1` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `itens_pedido`
--
ALTER TABLE `itens_pedido`
  ADD CONSTRAINT `itens_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `itens_pedido_ibfk_2` FOREIGN KEY (`produto_id`) REFERENCES `produtos` (`id`) ON DELETE CASCADE;

--
-- Restrições para tabelas `notas_fiscais`
--
ALTER TABLE `notas_fiscais`
  ADD CONSTRAINT `notas_fiscais_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`funcionario_id`) REFERENCES `funcionarios` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `pedidos_ibfk_2` FOREIGN KEY (`cliente_id`) REFERENCES `clientes` (`id`) ON DELETE SET NULL;

--
-- Restrições para tabelas `produtos`
--
ALTER TABLE `produtos`
  ADD CONSTRAINT `produtos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`) ON DELETE SET NULL;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
