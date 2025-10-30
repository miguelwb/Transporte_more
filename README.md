# **Transporte +**

O **Transporte +** é um aplicativo desenvolvido pela **Mobiize** com o objetivo de otimizar o gerenciamento das rotas escolares, permitindo que escolas e gestores acompanhem facilmente os pontos de embarque e desembarque dos alunos, além de visualizar as rotas em um mapa interativo.

## **Funcionalidades**

### 1. **Mapa Interativo**
O aplicativo integra um mapa interativo que exibe todas as escolas e pontos de ônibus. Isso permite aos gestores visualizar de maneira clara e intuitiva onde cada ponto de embarque está localizado e qual escola ele atende.

### 2. **Gestão de Pontos de Embarque**
Os gestores podem adicionar, editar e excluir pontos de embarque. Cada ponto é marcado no mapa com informações como:
- Nome do ponto
- Endereço
- Número de alunos atendidos
- Horário de coleta

### 3. **Rotas Personalizadas**
O aplicativo oferece a possibilidade de criar e personalizar rotas escolares. A partir de um conjunto de pontos de embarque e escolas, os gestores podem:
- Definir a ordem de visitação dos pontos
- Gerenciar horários de cada ponto
- Monitorar a eficiência das rotas

### 4. **Notificações e Alertas**
O sistema envia notificações automáticas para pais e responsáveis sobre:
- Mudanças nas rotas
- Atrasos ou alterações nos horários de transporte
- Atualizações importantes sobre a rota escolar

### 5. **Relatórios de Transporte**
Através do painel administrativo, é possível gerar relatórios detalhados sobre o transporte escolar, incluindo:
- Número de alunos transportados
- Tempo médio de deslocamento
- Frequência de alterações nas rotas

### 6. **Login e Perfil de Usuário**
O aplicativo oferece diferentes níveis de acesso:
- **Gestores**: Acesso completo para administrar rotas, pontos e relatórios.
- **Motoristas**: Acesso para visualizar rotas e pontos de embarque, com informações de horários.
- **Pais/Responsáveis**: Acesso para acompanhar a rota do filho e receber notificações.

## **Tecnologias Utilizadas**

- **Frontend**: ReactJS, Leaflet (para visualização do mapa)
- **Backend**: Node.js, Express
- **Banco de Dados**: MongoDB
- **Mapas**: API do Google Maps / OpenStreetMap
- **Autenticação**: JWT (JSON Web Tokens)