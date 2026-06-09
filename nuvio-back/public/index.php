<?php

header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

echo json_encode([
    "status" => "ok",
    "message" => "Nuvio API Online"
]);