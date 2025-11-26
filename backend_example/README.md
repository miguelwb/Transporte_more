# Backend de exemplo (Node/Express)

Implementa rotas compatíveis com o app Transporte+ conforme `services/api.js`:

## Endpoints

- `GET /api/escolas` – Lista escolas
- `POST /api/escolas` – Cria escola
  - Body: `{ nome, localizacao, foto }`
- `PATCH /api/escolas/:id` – Atualiza escola
- `DELETE /api/escolas/:id` – Remove escola

- `GET /api/pontos` – Lista pontos
- `POST /api/pontos` – Cria ponto
  - Body: `{ nome, localizacao, foto, escolas_id, user_id, onibus_id }`
- `PATCH /api/pontos/:id` – Atualiza ponto
- `DELETE /api/pontos/:id` – Remove ponto

- `GET /api/rotas` – Lista rotas
- `POST /api/rotas` – Cria rota
  - Body aceito (chaves alternativas):
    - `nome`, `descricao`
    - `schoolName` ou `escola`
    - `pointIds` ou `pontos` ou `pontos_id`
    - `horarios` ou `schedules`
    - `busId`
- `PATCH /api/rotas/:id` – Atualiza rota (mesmas chaves do POST)
- `DELETE /api/rotas/:id` – Remove rota

## Executar

```bash
node backend_example/server.js
```

Se quiser apontar o app para este backend:

- Web: defina `EXPO_PUBLIC_API_BASE_URL=http://localhost:3002`
- Nativo: evite `localhost`; use o IP da máquina (ex.: `http://192.168.x.y:3002`)

## Observações

- Armazenamento em memória, para desenvolvimento.
- Campo `localizacao` aceita formato `"Rua X | lat:-21.88, lng:-51.85"` e gera `latitude`/`longitude`.
- Rotas aceitam IDs de pontos por qualquer das chaves (`pointIds`/`pontos`/`pontos_id`).

