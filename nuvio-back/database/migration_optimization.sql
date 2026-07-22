-- ============================================================================
-- 🗄️ SCRIPT DE OTIMIZAÇÕES DE BANCO DE DADOS - NUVIO HELPDESK
-- ============================================================================
-- IMPORTANTE: Faça um BACKUP antes de executar este script!
-- Data: 2026-06-14
-- ============================================================================

USE nuviohelpdesk;

-- ============================================================================
-- 1️⃣ ADICIONAR COLUNAS DE SOFT DELETE E TIMESTAMP
-- ============================================================================

ALTER TABLE Usuario 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE Ticket 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE respostaTicket 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE anexo 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE avaliacaoTicket 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE Categoria 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE SLA 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE Tecnico 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE Administrador 
ADD COLUMN IF NOT EXISTS deletedAt TIMESTAMP NULL DEFAULT NULL,
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

ALTER TABLE tipoUsuario 
ADD COLUMN IF NOT EXISTS updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP;

-- ============================================================================
-- 2️⃣ CRIAR ÍNDICES EM FOREIGN KEYS
-- ============================================================================

-- Índices na tabela Usuario
ALTER TABLE Usuario ADD INDEX IF NOT EXISTS idx_email (email);
ALTER TABLE Usuario ADD INDEX IF NOT EXISTS idx_ativo (ativo);
ALTER TABLE Usuario ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE Usuario ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela Ticket
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_idUsuario (idUsuario);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_idCategoria (idCategoria);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_idTecnico (idTecnico);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_idSLA (idSLA);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_statusTicket (statusTicket);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_prioridade (prioridade);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_dataAbertura (dataAbertura);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices compostos para filtros comuns
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_status_tecnico (statusTicket, idTecnico);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_usuario_data (idUsuario, dataAbertura);
ALTER TABLE Ticket ADD INDEX IF NOT EXISTS idx_status_usuario (statusTicket, idUsuario, deletedAt);

-- Índices na tabela respostaTicket
ALTER TABLE respostaTicket ADD INDEX IF NOT EXISTS idx_idTicket (idTicket);
ALTER TABLE respostaTicket ADD INDEX IF NOT EXISTS idx_idUsuario (idUsuario);
ALTER TABLE respostaTicket ADD INDEX IF NOT EXISTS idx_dataResposta (dataResposta);
ALTER TABLE respostaTicket ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE respostaTicket ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela anexo
ALTER TABLE anexo ADD INDEX IF NOT EXISTS idx_idTicket (idTicket);
ALTER TABLE anexo ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE anexo ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela avaliacaoTicket
ALTER TABLE avaliacaoTicket ADD INDEX IF NOT EXISTS idx_idTicket (idTicket);
ALTER TABLE avaliacaoTicket ADD INDEX IF NOT EXISTS idx_idUsuario (idUsuario);
ALTER TABLE avaliacaoTicket ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE avaliacaoTicket ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela Tecnico
ALTER TABLE Tecnico ADD INDEX IF NOT EXISTS idx_idUsuario (idUsuario);
ALTER TABLE Tecnico ADD INDEX IF NOT EXISTS idx_ativo (ativo);
ALTER TABLE Tecnico ADD INDEX IF NOT EXISTS idx_especialidade (especialidade);
ALTER TABLE Tecnico ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE Tecnico ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela Administrador
ALTER TABLE Administrador ADD INDEX IF NOT EXISTS idx_idUsuario (idUsuario);
ALTER TABLE Administrador ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE Administrador ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela Categoria
ALTER TABLE Categoria ADD INDEX IF NOT EXISTS idx_nome (nome);
ALTER TABLE Categoria ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE Categoria ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela SLA
ALTER TABLE SLA ADD INDEX IF NOT EXISTS idx_nomeSLA (nomeSLA);
ALTER TABLE SLA ADD INDEX IF NOT EXISTS idx_deletedAt (deletedAt);
ALTER TABLE SLA ADD INDEX IF NOT EXISTS idx_updatedAt (updatedAt);

-- Índices na tabela tipoUsuario
ALTER TABLE tipoUsuario ADD INDEX IF NOT EXISTS idx_descricao (descricao);

-- ============================================================================
-- 3️⃣ CRIAR TABELA DE AUDITORIA
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log (
    idAudit INT AUTO_INCREMENT PRIMARY KEY,
    tabela VARCHAR(50) NOT NULL,
    operacao ENUM('CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'RESTORE') NOT NULL,
    idRegistro INT NOT NULL,
    idUsuario INT,
    dados_anteriores JSON,
    dados_novos JSON,
    dataOperacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ipOrigem VARCHAR(45),
    userAgent VARCHAR(255),
    
    INDEX idx_tabela (tabela),
    INDEX idx_operacao (operacao),
    INDEX idx_idUsuario (idUsuario),
    INDEX idx_idRegistro (idRegistro),
    INDEX idx_dataOperacao (dataOperacao),
    INDEX idx_tabela_registro (tabela, idRegistro),
    FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 4️⃣ CRIAR TABELA DE SESSÕES PARA RATE LIMITING
-- ============================================================================

CREATE TABLE IF NOT EXISTS rate_limit_log (
    idLog INT AUTO_INCREMENT PRIMARY KEY,
    chave VARCHAR(100) NOT NULL UNIQUE,
    tentativas INT DEFAULT 0,
    bloqueado_ate TIMESTAMP NULL,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_chave (chave),
    INDEX idx_bloqueado_ate (bloqueado_ate)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 5️⃣ CRIAR TABELA DE LOGS DE PERFORMANCE
-- ============================================================================

CREATE TABLE IF NOT EXISTS query_log (
    idLog INT AUTO_INCREMENT PRIMARY KEY,
    endpoint VARCHAR(255) NOT NULL,
    metodo VARCHAR(10),
    tempo_ms FLOAT,
    usuario_id INT,
    status_code INT,
    data_hora TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    INDEX idx_endpoint (endpoint),
    INDEX idx_data_hora (data_hora),
    INDEX idx_tempo_ms (tempo_ms)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ============================================================================
-- 6️⃣ VERIFICAR ESTRUTURA FINAL
-- ============================================================================

-- Verificar tamanho do banco
SELECT 
    table_name,
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS size_mb,
    table_rows,
    engine
FROM information_schema.tables 
WHERE table_schema = 'nuviohelpdesk'
ORDER BY (data_length + index_length) DESC;

-- Listar todos os índices
SELECT 
    table_name,
    index_name,
    column_name,
    seq_in_index
FROM information_schema.statistics 
WHERE table_schema = 'nuviohelpdesk'
ORDER BY table_name, index_name;

-- ============================================================================
-- ✅ SCRIPT CONCLUÍDO COM SUCESSO!
-- ============================================================================
