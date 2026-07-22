#!/bin/bash

# Script de Testes de Segurança - Nuvio API
# Use: bash test-security.sh

echo "🔐 Testando Segurança da API Nuvio"
echo "===================================="
echo ""

API_URL="http://localhost:8888/nuvio-back"
EMAIL_TESTE="teste@teste.com"
SENHA_TESTE="123456"

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função de teste
testar() {
    local nome=$1
    local comando=$2
    local esperado=$3
    
    echo -e "${YELLOW}Teste:${NC} $nome"
    resultado=$(eval "$comando" 2>&1)
    
    if echo "$resultado" | grep -q "$esperado"; then
        echo -e "${GREEN}✓ PASSOU${NC}"
    else
        echo -e "${RED}✗ FALHOU${NC}"
        echo "Resultado: $resultado"
    fi
    echo ""
}

# 1. API Online
echo -e "${YELLOW}1. Verificando se API está online...${NC}"
testar "API Online" \
    "curl -s $API_URL/public/index.php | grep -q 'Nuvio API Online' && echo 'ok'" \
    "ok"

# 2. CORS Restrito
echo -e "${YELLOW}2. Testando CORS...${NC}"
echo "   - Deve NEGAR origem desconhecida..."
testar "CORS Bloqueado" \
    "curl -s -H 'Origin: http://outro-site.com' $API_URL/public/index.php | grep -c 'Access-Control-Allow-Origin: http://outro-site.com || echo 0'" \
    "0"

echo "   - Deve PERMITIR origem local..."
testar "CORS Permitido" \
    "curl -s -i -H 'Origin: http://localhost:3000' $API_URL/public/index.php | grep -q 'Access-Control-Allow-Origin' && echo 'ok' || echo 'fail'" \
    "ok"

# 3. Login
echo -e "${YELLOW}3. Testando Login...${NC}"
TOKEN_RESPONSE=$(curl -s -X POST \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$EMAIL_TESTE\",\"senha\":\"$SENHA_TESTE\"}" \
  $API_URL/routes/api.php/auth/login)

TOKEN=$(echo $TOKEN_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}✗ Login falhou${NC}"
    echo "Resposta: $TOKEN_RESPONSE"
    echo ""
    echo "Tente registrar primeiro:"
    echo "curl -X POST \\"
    echo "  -H 'Content-Type: application/json' \\"
    echo "  -d '{\"nome\":\"Teste\",\"email\":\"$EMAIL_TESTE\",\"senha\":\"$SENHA_TESTE\"}' \\"
    echo "  $API_URL/routes/api.php/auth/registro"
else
    echo -e "${GREEN}✓ Login OK - Token: ${TOKEN:0:20}...${NC}"
fi

echo ""

# 4. Rate Limiting
if [ ! -z "$TOKEN" ]; then
    echo -e "${YELLOW}4. Testando Rate Limiting (20 tentativas rápidas)...${NC}"
    
    bloqueado=0
    for i in {1..20}; do
        response=$(curl -s -X POST \
          -H "Content-Type: application/json" \
          -d "{\"email\":\"$EMAIL_TESTE\",\"senha\":\"$SENHA_TESTE\"}" \
          $API_URL/routes/api.php/auth/login)
        
        if echo "$response" | grep -q "429"; then
            echo -e "${GREEN}✓ Rate limit acionado na tentativa $i${NC}"
            bloqueado=1
            break
        fi
    done
    
    if [ $bloqueado -eq 0 ]; then
        echo -e "${YELLOW}⚠ Rate limit não acionado (pode estar desabilitado)${NC}"
    fi
    echo ""
    
    # 5. Autorização
    echo -e "${YELLOW}5. Testando Autorização...${NC}"
    
    # Tentar acessar usuários (deve falhar se not admin)
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
      $API_URL/routes/api.php/usuarios)
    
    if echo "$response" | grep -q "Acesso negado\|403\|erro"; then
        echo -e "${GREEN}✓ Autorização funcionando (acesso bloqueado corretamente)${NC}"
    else
        echo -e "${YELLOW}⚠ Verifique permissões do usuário${NC}"
    fi
    echo ""
    
    # 6. Acessar rota permitida
    echo -e "${YELLOW}6. Testando acesso a rota permitida...${NC}"
    response=$(curl -s -H "Authorization: Bearer $TOKEN" \
      $API_URL/routes/api.php/categorias)
    
    if echo "$response" | grep -q "categorias\|nomeCategoria"; then
        echo -e "${GREEN}✓ Categorias acessível com token${NC}"
    else
        echo -e "${RED}✗ Falha ao acessar categorias${NC}"
        echo "Resposta: $response"
    fi
fi

echo ""
echo "===================================="
echo -e "${GREEN}✓ Testes Completados${NC}"
echo ""
echo "Próximos passos:"
echo "1. Revisar nuvio-back/SECURITY.md"
echo "2. Configurar .env.local com dados reais"
echo "3. Para produção, gerar JWT_SECRET forte"
