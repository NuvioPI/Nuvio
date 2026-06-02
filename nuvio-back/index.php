<?php
header("access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
// tbm pode usar: echo json_encode(["Mensagem" => "Hello World! Bem Vindos ao melhor sistema HelpDesk!"]);
echo json_encode(array("Mensagem" => "Hello World! Bem Vindos ao melhor sistema HelpDesk!"));