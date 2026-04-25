-- Limpa dados prévios para evitar erros de duplicidade se rodado múltiplas vezes
DELETE FROM veiculo_imagens;
DELETE FROM venda_itens;
DELETE FROM vendas;
DELETE FROM veiculos;
DELETE FROM categoria_veiculos;

-- Seed de Categorias
INSERT INTO categoria_veiculos (nome, descricao) VALUES 
('Motos', 'Veículos de duas rodas esportivos e utilitários'),
('Pesados', 'Maquinário e equipamentos para engenharia');

-- Captura IDs das categorias para evitar hardcoding
SET @moto_id = (SELECT id FROM categoria_veiculos WHERE nome = 'Motos' LIMIT 1);
SET @pesado_id = (SELECT id FROM categoria_veiculos WHERE nome = 'Pesados' LIMIT 1);

-- Seed de Veículos
INSERT INTO veiculos (titulo, preco, descricao, modelo, marca, ano_fabricacao, ano_modelo, quilometragem, cor, documentacao, revisoes, categoria_id) VALUES 
('Suzuki Hayabusa GSX-1300R', 65000.00, 'Lendária moto de alta velocidade.', 'Hayabusa', 'Suzuki', 2008, 2008, 15000, 'Azul', 'OK', 'Revisada', @moto_id),
('Honda NC 700X', 32000.00, 'Econômica e versátil.', 'NC 700X', 'Honda', 2013, 2013, 28000, 'Vermelha', 'OK', 'Revisada', @moto_id);

SET @hayabusa_id = (SELECT id FROM veiculos WHERE titulo LIKE '%Hayabusa%' LIMIT 1);
SET @nc700_id = (SELECT id FROM veiculos WHERE titulo LIKE '%NC 700X%' LIMIT 1);

-- Seed de Imagens (Relacionando com os arquivos físicos)
-- Importante: Os nomes aqui devem bater exatamente com o que o seed-script.sh vai copiar
INSERT INTO veiculo_imagens (veiculo_id, caminho_imagem) VALUES 
(@hayabusa_id, '2008-Suzuki-hayabusa.jpg'),
(@nc700_id, '2013-Honda-nc700.jpeg');

-- O Administrador padrão já é criado pelo script principal (senco-engenharia-database.sql), 
-- então não precisamos duplicar aqui, a menos que queira um usuário diferente.
