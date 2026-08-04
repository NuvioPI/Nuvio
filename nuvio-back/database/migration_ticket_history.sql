CREATE TABLE IF NOT EXISTS HistoricoTicket (
    idHistoricoTicket INT PRIMARY KEY AUTO_INCREMENT,
    idTicket INT NOT NULL,
    idUsuario INT NULL,
    acao VARCHAR(30) NOT NULL,
    campoAlterado VARCHAR(45) NULL,
    valorAnterior TEXT NULL,
    valorNovo TEXT NULL,
    dataAlteracao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_historico_ticket_data (idTicket, dataAlteracao),
    INDEX idx_historico_usuario (idUsuario),

    CONSTRAINT fk_historico_ticket
        FOREIGN KEY (idTicket)
        REFERENCES Ticket(idTicket)
        ON DELETE CASCADE,

    CONSTRAINT fk_historico_usuario
        FOREIGN KEY (idUsuario)
        REFERENCES Usuario(idUsuario)
        ON DELETE SET NULL
);
