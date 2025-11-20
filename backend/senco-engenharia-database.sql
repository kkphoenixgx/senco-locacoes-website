-- Tabela para armazenar as categorias dos veículos
CREATE TABLE categoria_veiculos (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    descricao TEXT
);

-- Tabela para armazenar os veículos (que herdam de ItemsVendidos)
-- Esta abordagem combina os campos da classe base e da classe derivada em uma única tabela.
CREATE TABLE veiculos (
    id SERIAL PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    preco NUMERIC(10, 2) NOT NULL,
    descricao TEXT,
    modelo VARCHAR(100) NOT NULL,
    marca VARCHAR(100) NOT NULL,
    ano_fabricacao INT NOT NULL,
    ano_modelo INT NOT NULL,
    quilometragem INT NOT NULL,
    cor VARCHAR(50) NOT NULL,
    documentacao VARCHAR(255),
    revisoes TEXT,
    categoria_id INT NOT NULL,
    FOREIGN KEY (categoria_id) REFERENCES categoria_veiculos(id)
);

-- Tabela para armazenar os caminhos das imagens dos veículos (relação 1-N)
CREATE TABLE veiculo_imagens (
    id SERIAL PRIMARY KEY,
    veiculo_id INT NOT NULL,
    caminho_imagem VARCHAR(255) NOT NULL,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE CASCADE
);

-- Tabela para os clientes
CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    telefone VARCHAR(20),
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL,
    endereco TEXT
);

-- Tabela para os administradores
CREATE TABLE adms (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL
);

-- Tabela para registrar as vendas
CREATE TABLE vendas (
    id SERIAL PRIMARY KEY,
    data_venda TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    preco_total NUMERIC(12, 2) NOT NULL,
    cliente_id INT NOT NULL,
    FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

-- Tabela de junção para registrar os itens de uma venda (relação N-M)
-- Como 'ItemsVendidos' é abstrata, criamos a relação com a tabela concreta 'veiculos'.
CREATE TABLE venda_itens (
    venda_id INT NOT NULL,
    veiculo_id INT NOT NULL,
    PRIMARY KEY (venda_id, veiculo_id),
    FOREIGN KEY (venda_id) REFERENCES vendas(id) ON DELETE CASCADE,
    FOREIGN KEY (veiculo_id) REFERENCES veiculos(id) ON DELETE RESTRICT -- Evita que um veículo vendido seja excluído
);


-- Inserção do Administrador Padrão
INSERT INTO adms (email, senha_hash) VALUES 
('senco-engenharia-adm@gmail.com', '$2b$10$1daZSajmRSap9wA35gUAHe6f5NiOlZfM.QIMpNs1tRLENSEf.tPNq');