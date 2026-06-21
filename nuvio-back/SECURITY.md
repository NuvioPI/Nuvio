# 🔒 Guia de Segurança - Nuvio Backend

## Correções Implementadas

### ✅ 1. Variáveis de Ambiente
- **Arquivo**: `nuvio-back/config/env.php`
- **Como usar**: 
  1. Copie `.env.example` para `.env.local`
  2. Edite `.env.local` com suas credenciais reais
  3. Nunca commite `.env.local` (está no `.gitignore`)

```bash
# Desenvolvimento
cp nuvio-back/.env.example nuvio-back/.env.local
# Edite com seus dados
```

### ✅ 2. CORS Restrito
- **Antes**: `Access-Control-Allow-Origin: *` (qualquer origem)
- **Agora**: Apenas a origem configurada em `CORS_ORIGIN` é permitida
- **Arquivo**: `nuvio-back/public/index.php`

```php
// Exemplo: apenas localhost:3000
CORS_ORIGIN=http://localhost:3000
```

**Para Produção**:
```
CORS_ORIGIN=https://seu-dominio.com
```

### ✅ 3. JWT Secret de Variáveis de Ambiente
- **Antes**: Chave hardcoded em `config/jwt.php`
- **Agora**: Carregada de `.env.local`
- **Importante**: Gere uma chave FORTE para produção

```bash
# Gerar uma chave segura (no terminal):
php -r "echo bin2hex(random_bytes(32));"
```

### ✅ 4. Rate Limiting
- **Arquivo**: `nuvio-back/middleware/rate-limit.php`
- **Implementado em**: Login - máximo 10 tentativas a cada 15 minutos por IP
- **Resposta ao exceder**: HTTP 429 (Too Many Requests)

### ✅ 5. Autorização por Role
- **Arquivo**: `nuvio-back/middleware/auth.php`
- **Função**: `autenticarEAutorizar($rolesPermitidas)`
- **Roles disponíveis**: `Cliente`, `Técnico`, `Administrador`

**Rotas protegidas**:
- `GET/POST/PUT/DELETE /categorias` → Apenas Técnico e Administrador
- `GET/POST/PUT/DELETE /usuarios` → Apenas Administrador
- `GET/POST/PUT/DELETE /administradores` → Apenas Administrador

### ✅ 6. Tratamento de Erros
- **Antes**: Expunha detalhes internos em qualquer ambiente
- **Agora**: Em produção, mensagens genéricas; em desenvolvimento, detalhes completos
- **Controle**: Variável `APP_ENV`

```
APP_ENV=development  # Mostra erros detalhados
APP_ENV=production   # Mensagens genéricas
```

---

## 🚀 Configuração para Produção

### 1. Criar `.env.local` seguro
```bash
# Copie o exemplo
cp .env.example .env.local

# Edite com valores reais (NÃO use padrões!)
```

### 2. Valores recomendados
```
# .env.local (produção)
DB_HOST=seu-host-db.com
DB_USER=usuario_seguro
DB_PASSWORD=senha_muito_forte_aleatoria
DB_NAME=nuviohelpdesk
DB_PORT=3306

JWT_SECRET=<chave gerada com php -r "echo bin2hex(random_bytes(32));">
JWT_EXPIRACAO=28800

CORS_ORIGIN=https://seu-dominio.com

APP_ENV=production
APP_DEBUG=false

RATE_LIMIT_ENABLED=true
```

### 3. Segurança do Servidor
```bash
# Permissões de arquivo
chmod 600 nuvio-back/.env.local
chmod 755 nuvio-back/config

# Remover arquivo de exemplo (opcional)
rm nuvio-back/.env.example
```

### 4. Certificado HTTPS
```bash
# Use Let's Encrypt (gratuito)
# Certifique-se que seu servidor acessa via HTTPS
```

### 5. Rate Limiting em Produção
Para escalabilidade com múltiplos servidores, use Redis:

```php
// Futuro: Implementar com Redis
// composer require predis/predis
```

---

## 🔍 Testes de Segurança

### 1. Verificar CORS
```bash
# Deve ser bloqueado
curl -H "Origin: http://outro-site.com" http://localhost:8888/nuvio-back/public/index.php

# Deve ser permitido
curl -H "Origin: http://localhost:3000" http://localhost:8888/nuvio-back/public/index.php
```

### 2. Testar Rate Limiting (login)
```bash
# Tente fazer 11 logins rápido - a 11ª deve retornar 429
for i in {1..15}; do
  curl -X POST \
    -H "Content-Type: application/json" \
    -d '{"email":"teste@teste.com","senha":"123456"}' \
    http://localhost:8888/nuvio-back/routes/api.php/auth/login
  echo "Tentativa $i"
done
```

### 3. Testar Autorização
```bash
# Cliente tenta acessar usuários (deve falhar com 403)
curl -H "Authorization: Bearer $TOKEN_CLIENTE" \
  http://localhost:8888/nuvio-back/routes/api.php/usuarios

# Admin acessa usuários (deve funcionar)
curl -H "Authorization: Bearer $TOKEN_ADMIN" \
  http://localhost:8888/nuvio-back/routes/api.php/usuarios
```

---

## 📋 Checklist de Segurança

### Antes de Deploy
- [ ] `.env.local` criado com dados reais (não padrão)
- [ ] `JWT_SECRET` gerado com chave forte
- [ ] `CORS_ORIGIN` apontando para domínio de produção
- [ ] `APP_ENV=production`
- [ ] `APP_DEBUG=false`
- [ ] `.env.local` está no `.gitignore`
- [ ] Certificado HTTPS instalado
- [ ] Banco de dados com senha forte
- [ ] Permissões de arquivo corretas (`chmod 600 .env.local`)

### Contínuo em Produção
- [ ] Backups regulares do banco de dados
- [ ] Logs sendo monitorados (próximo passo)
- [ ] Rate limiting ativo
- [ ] CORS restrito apenas a origens confiáveis
- [ ] Atualizações de segurança do PHP/MySQL

---

## ⚠️ Problemas Ainda a Resolver

Veja o documento de revisão completa para:
1. Implementar logging centralizado
2. Adicionar soft deletes
3. Adicionar índices ao banco
4. Validação de uploads mais rigorosa
5. Proteção CSRF no frontend

---

## 📚 Referências

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [PHP Security](https://www.php.net/manual/en/security.php)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)

---

**Última atualização**: 2026-06-14
