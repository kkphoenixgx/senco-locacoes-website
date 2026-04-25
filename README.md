# Senco Engenharia - Docker Infrastructure

Este projeto está configurado para rodar completamente em containers Docker, seguindo as melhores práticas de produção (multi-stage builds, usuários não-root, healthchecks).

---

## 🇧🇷 Português

### Pré-requisitos
- Docker e Docker Compose instalados.

### Como rodar

#### 1. Ambiente Limpo (Padrão)
Para subir o projeto sem dados iniciais (ideal para testar o cadastro manual):
```bash
docker compose up --build
```

#### 2. Ambiente com Dados de Exemplo (Flag de Seed)
Para subir o projeto já populado com veículos, categorias, imagens de vitrine e um administrador:
```bash
docker compose --profile seed up --build
```

Para deletar sem dor de cabeça:

### Deletando

```bash
docker rm -f senco_frontend senco_seeder senco_backend senco_db
docker compose --profile seed down -v --remove-orphans
```

### Acesso
- **Frontend:** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Usuário Admin Exemplo:** `admin@senco.com.br` / `admin123`
- **Swagger Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🇺🇸 English

### Prerequisites
- Docker and Docker Compose installed.

### How to Run

#### 1. Clean Environment (Default)
To start the project without initial data (ideal for testing manual registration):
```bash
docker compose up --build
```

#### 2. Environment with Sample Data (Seed Flag)
To start the project pre-populated with vehicles, categories, showcase images, and an administrator:
```bash
docker compose --profile seed up --build
```
### Deleting

to delete without headeak:

```bash
docker rm -f senco_frontend senco_seeder senco_backend senco_db
docker compose --profile seed down -v --remove-orphans
```

### Access
- **Frontend:** [http://localhost](http://localhost)
- **Backend API:** [http://localhost:3000/api](http://localhost:3000/api)
- **Sample Admin User:** `admin@senco.com.br` / `admin123`
- **Swagger Docs:** [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## 🛠️ Infrastructure Details / Detalhes da Infraestrutura

- **Backend:** Node.js 22 Alpine, built with Vite, running as non-root user.
- **Frontend:** Angular 20 + Nginx Alpine (Gzip enabled, SPA routing configured).
- **Database:** MySQL 9.0 with automated healthcheck.
- **Persistence:**
    - `senco_db_data`: MySQL data volume.
    - `senco_uploads`: Shared volume for vehicle images and uploads.

### Useful Commands / Comandos Úteis

**View logs / Ver logs:**
```bash
docker compose logs -f
```

**Stop all / Parar tudo:**
```bash
docker compose down
```

**Reset volumes / Limpar tudo (Removes DB and Uploads):**
```bash
docker compose down -v
```
