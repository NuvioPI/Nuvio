<?php

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../controllers/ClienteController.php';
require_once __DIR__ . '/../config/database.php';

class ClienteControllerTeste extends ClienteController
{
    public function __construct(private array $dados)
    {
        parent::__construct();
    }

    protected function body()
    {
        return $this->dados;
    }
}

$email = 'teste-controller-' . bin2hex(random_bytes(8)) . '@example.invalid';
$db = (new DB())->getConnection();

try {
    ob_start();
    (new ClienteControllerTeste([
        'nome' => 'Cliente de teste',
        'email' => $email,
        'telefone' => '',
        'cargo' => '',
        'empresa' => '',
        'idioma' => 'Português (BR)',
        'timezone' => 'America/Sao_Paulo (UTC -3)',
        'emailBoasVindas' => true,
        'verificado' => false,
        'inscrito' => true,
        'tags' => [],
    ]))->store();
    $resposta = ob_get_clean();
    $dados = json_decode($resposta, true);

    if (!is_array($dados) || empty($dados['idUsuario'])) {
        throw new RuntimeException('Controller não retornou sucesso: ' . $resposta);
    }

    echo "Controller de cadastro validado.\n";
} finally {
    // O e-mail é aleatório e exclusivo: somente o registro criado por este teste é removido.
    $apagar = $db->prepare('DELETE FROM Usuario WHERE email = ?');
    $apagar->execute([$email]);
}
