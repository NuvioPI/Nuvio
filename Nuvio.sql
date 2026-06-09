CREATE TABLE SLA (
    idSLA INT PRIMARY KEY AUTO_INCREMENT,
    nomeSLA VARCHAR(75) NOT NULL,
    tempoResposta INT NOT NULL,
    tempoResolucao INT NOT NULL,
    descricao VARCHAR(100) NOT NULL
);
 
CREATE TABLE tipoUsuario (
    idtipoUsuario INT PRIMARY KEY AUTO_INCREMENT,
    descricao VARCHAR(50) NOT NULL,
    CONSTRAINT ck_descricao
        CHECK (descricao IN ('Cliente', 'Técnico', 'Administrador'))
);
 
CREATE TABLE Categoria (
    idCategoria INT PRIMARY KEY AUTO_INCREMENT,
    nomeCategoria VARCHAR(55) NOT NULL,
    descricao VARCHAR(45) NOT NULL
);
 
CREATE TABLE Usuario (
    idUsuario INT PRIMARY KEY AUTO_INCREMENT,
    idtipoUsuario INT NOT NULL,
    nome VARCHAR(85) NOT NULL,
    email VARCHAR(100) NOT NULL,
    senhaHash VARCHAR(155) NOT NULL,
    cargo VARCHAR(55) NOT NULL,
    setor VARCHAR(55) NOT NULL,
 
    CONSTRAINT fk_usuario_tipoUsuario
        FOREIGN KEY (idtipoUsuario)
        REFERENCES tipoUsuario(idtipoUsuario)
);
 
CREATE TABLE Tecnico (
    idTecnico INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NOT NULL UNIQUE,
    especialidade VARCHAR(75),
    ativo BOOLEAN NOT NULL DEFAULT TRUE,
 
    CONSTRAINT fk_tecnico_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
);
 
CREATE TABLE Administrador (
    idAdministrador INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NOT NULL UNIQUE,
    nivelAcesso VARCHAR(30) NOT NULL DEFAULT 'padrao',
    podeGerenciarUsuarios BOOLEAN NOT NULL DEFAULT FALSE,
    podeConfigurarSLA BOOLEAN NOT NULL DEFAULT FALSE,
    podeVerRelatorios BOOLEAN NOT NULL DEFAULT TRUE,
    ultimoAcesso DATETIME,
 
    CONSTRAINT fk_admin_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
);
 
CREATE TABLE Ticket (
    idTicket INT PRIMARY KEY AUTO_INCREMENT,
    idTecnico INT NOT NULL,
    idUsuario INT NOT NULL,
    idCategoria INT NOT NULL,
    idSLA INT NOT NULL,
 
    titulo VARCHAR(75) NOT NULL,
    statusTicket VARCHAR(45) NOT NULL,
    prioridade VARCHAR(10) NOT NULL,
 
    dataAbertura DATETIME NOT NULL,
    dataFechamento DATETIME NULL,
 
    CONSTRAINT ck_prioridade
        CHECK (prioridade IN ('Alta', 'Media', 'Baixa')),
 
    CONSTRAINT ck_statusTicket
        CHECK (statusTicket IN ('Aberto', 'Em atendimento', 'Resolvido', 'Fechado')),
 
    CONSTRAINT fk_ticket_tecnico
        FOREIGN KEY (idTecnico)
        REFERENCES Tecnico(idTecnico),
 
    CONSTRAINT fk_ticket_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario),
 
    CONSTRAINT fk_ticket_categoria
        FOREIGN KEY (idCategoria)
        REFERENCES Categoria(idCategoria),
 
    CONSTRAINT fk_ticket_sla
        FOREIGN KEY (idSLA)
        REFERENCES SLA(idSLA)
);
 
CREATE TABLE respostaTicket (
    idRespostaTicket INT PRIMARY KEY AUTO_INCREMENT,
    idUsuario INT NOT NULL,
    idTicket INT NOT NULL,
    msgTicket VARCHAR(755),
 
    dataResposta DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_respostaTicket_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario),
 
    CONSTRAINT fk_respostaTicket_ticket
        FOREIGN KEY (idTicket)
        REFERENCES Ticket(idTicket)
);
 
CREATE TABLE anexo (
    idAnexo INT PRIMARY KEY AUTO_INCREMENT,
    idTicket INT NOT NULL,
 
    nomeArquivo VARCHAR(100),
    caminhoArquivo VARCHAR(255),
 
    CONSTRAINT fk_anexo_ticket
        FOREIGN KEY (idTicket)
        REFERENCES Ticket(idTicket)
);
 
CREATE TABLE avaliacaoTicket (
    idAvaliacaoTicket INT PRIMARY KEY AUTO_INCREMENT,
    idTicket INT NOT NULL UNIQUE,
    idUsuario INT NOT NULL,
 
    nota TINYINT NOT NULL,
    comentario TEXT,
 
    dataAvaliacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT ck_nota
        CHECK (nota BETWEEN 1 AND 5),
 
    CONSTRAINT fk_avaliacaoTicket_ticket
        FOREIGN KEY (idTicket)
        REFERENCES Ticket(idTicket),
 
    CONSTRAINT fk_avaliacaoTicket_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
);