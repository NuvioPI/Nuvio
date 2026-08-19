-- Dados complementares para os contatos cadastrados pelo painel administrativo.
-- Execute este arquivo uma única vez no mesmo banco que contém a tabela Usuario.

INSERT INTO tipoUsuario (descricao)
SELECT 'Cliente'
WHERE NOT EXISTS (
    SELECT 1 FROM tipoUsuario WHERE descricao = 'Cliente'
);

CREATE TABLE IF NOT EXISTS ClientePerfil (
    idUsuario INT PRIMARY KEY,
    sobrenome VARCHAR(85) NULL,
    empresa VARCHAR(120) NULL,
    site VARCHAR(255) NULL,
    idioma VARCHAR(50) NOT NULL DEFAULT 'Português (BR)',
    timezone VARCHAR(80) NOT NULL DEFAULT 'America/Sao_Paulo (UTC -3)',
    observacoes TEXT NULL,
    emailBoasVindas BOOLEAN NOT NULL DEFAULT TRUE,
    verificado BOOLEAN NOT NULL DEFAULT FALSE,
    inscrito BOOLEAN NOT NULL DEFAULT TRUE,
    CONSTRAINT fk_cliente_perfil_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS ClienteTag (
    idClienteTag INT PRIMARY KEY AUTO_INCREMENT,
    nome VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS ClientePerfilTag (
    idUsuario INT NOT NULL,
    idClienteTag INT NOT NULL,
    PRIMARY KEY (idUsuario, idClienteTag),
    CONSTRAINT fk_cliente_perfil_tag_usuario
        FOREIGN KEY (idUsuario) REFERENCES Usuario(idUsuario) ON DELETE CASCADE,
    CONSTRAINT fk_cliente_perfil_tag_tag
        FOREIGN KEY (idClienteTag) REFERENCES ClienteTag(idClienteTag) ON DELETE CASCADE
);
