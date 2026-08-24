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

-- Backfill: clientes criados antes desta migração já existem em Usuario,
-- portanto apenas completamos o perfil que ainda não foi criado. O comando é
-- idempotente e pode ser executado novamente sem duplicar dados.
INSERT INTO ClientePerfil
    (idUsuario, sobrenome, empresa, site, idioma, timezone, observacoes, emailBoasVindas, verificado, inscrito)
SELECT
    u.idUsuario,
    NULL,
    NULLIF(LEFT(u.setor, 120), ''),
    NULL,
    'Português (BR)',
    'America/Sao_Paulo (UTC -3)',
    NULL,
    TRUE,
    FALSE,
    TRUE
FROM Usuario u
INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
WHERE tu.descricao = 'Cliente'
  AND NOT EXISTS (
      SELECT 1 FROM ClientePerfil cp WHERE cp.idUsuario = u.idUsuario
  );

-- O cadastro antigo armazenava a empresa em Usuario.setor. Reaproveite esse
-- valor somente quando o novo campo ainda estiver vazio, preservando edições
-- feitas diretamente no perfil.
UPDATE ClientePerfil cp
INNER JOIN Usuario u ON u.idUsuario = cp.idUsuario
INNER JOIN tipoUsuario tu ON tu.idtipoUsuario = u.idtipoUsuario
SET cp.empresa = LEFT(u.setor, 120)
WHERE tu.descricao = 'Cliente'
  AND (cp.empresa IS NULL OR cp.empresa = '')
  AND u.setor IS NOT NULL
  AND u.setor <> '';
