// Backend de exemplo para o app Transporte+, compatível com services/api.js
// Node + Express, armazenamento em memória. Use apenas para desenvolvimento.

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

// Stores em memória
let escolas = [];
let pontos = [];
let rotas = [];
let nextId = 1;

function genId() { return String(nextId++); }

// Util: extrair lat/lng de uma string "Rua X | lat:-21.88, lng:-51.85"
function parseLocalizacao(localizacao) {
  if (!localizacao || typeof localizacao !== 'string') return { endereco: '', latitude: 0, longitude: 0 };
  const partes = localizacao.split('|');
  const endereco = partes[0].trim();
  const mLat = localizacao.match(/lat\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
  const mLng = localizacao.match(/ln?g\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
  const latitude = mLat ? parseFloat(mLat[1]) : 0;
  const longitude = mLng ? parseFloat(mLng[1]) : 0;
  return { endereco, latitude, longitude };
}

// === Escolas ===
app.get('/api/escolas', (req, res) => {
  res.json(escolas);
});

app.post('/api/escolas', (req, res) => {
  const { nome, localizacao, foto } = req.body || {};
  if (!nome) return res.status(400).json({ message: 'Campo nome é obrigatório' });
  const { endereco, latitude, longitude } = parseLocalizacao(localizacao);
  const escola = {
    id: genId(),
    nome,
    localizacao: localizacao || `${endereco} | lat:${latitude}, lng:${longitude}`,
    endereco,
    latitude,
    longitude,
    foto: foto || null,
  };
  escolas.push(escola);
  res.status(201).json(escola);
});

app.patch('/api/escolas/:id', (req, res) => {
  const { id } = req.params;
  const idx = escolas.findIndex((e) => e.id === id);
  if (idx < 0) return res.status(404).json({ message: 'Escola não encontrada' });
  const { nome, localizacao, foto } = req.body || {};
  if (nome != null) escolas[idx].nome = nome;
  if (localizacao != null) {
    const { endereco, latitude, longitude } = parseLocalizacao(localizacao);
    escolas[idx].localizacao = localizacao;
    escolas[idx].endereco = endereco;
    escolas[idx].latitude = latitude;
    escolas[idx].longitude = longitude;
  }
  if (foto != null) escolas[idx].foto = foto;
  res.json(escolas[idx]);
});

app.delete('/api/escolas/:id', (req, res) => {
  const { id } = req.params;
  const before = escolas.length;
  escolas = escolas.filter((e) => e.id !== id);
  if (escolas.length === before) return res.status(404).json({ message: 'Escola não encontrada' });
  res.status(204).end();
});

// === Pontos (mínimo para compor rotas) ===
app.get('/api/pontos', (req, res) => {
  res.json(pontos);
});

app.post('/api/pontos', (req, res) => {
  const { nome, localizacao, foto, escolas_id, user_id, onibus_id } = req.body || {};
  if (!nome) return res.status(400).json({ message: 'Campo nome é obrigatório' });
  const { endereco, latitude, longitude } = parseLocalizacao(localizacao);
  const ponto = {
    id: genId(),
    nome,
    localizacao: localizacao || `${endereco} | lat:${latitude}, lng:${longitude}`,
    endereco,
    latitude,
    longitude,
    foto: foto || null,
    escolaId: escolas_id || null,
    userId: user_id || null,
    busId: onibus_id || null,
    alunosCount: 0,
    horarioColeta: '',
  };
  pontos.push(ponto);
  res.status(201).json(ponto);
});

app.patch('/api/pontos/:id', (req, res) => {
  const { id } = req.params;
  const idx = pontos.findIndex((p) => p.id === id);
  if (idx < 0) return res.status(404).json({ message: 'Ponto não encontrado' });
  const { nome, localizacao, foto, escolas_id, user_id, onibus_id } = req.body || {};
  if (nome != null) pontos[idx].nome = nome;
  if (localizacao != null) {
    const { endereco, latitude, longitude } = parseLocalizacao(localizacao);
    pontos[idx].localizacao = localizacao;
    pontos[idx].endereco = endereco;
    pontos[idx].latitude = latitude;
    pontos[idx].longitude = longitude;
  }
  if (foto != null) pontos[idx].foto = foto;
  if (escolas_id != null) pontos[idx].escolaId = escolas_id;
  if (user_id != null) pontos[idx].userId = user_id;
  if (onibus_id != null) pontos[idx].busId = onibus_id;
  res.json(pontos[idx]);
});

app.delete('/api/pontos/:id', (req, res) => {
  const { id } = req.params;
  const before = pontos.length;
  pontos = pontos.filter((p) => p.id !== id);
  if (pontos.length === before) return res.status(404).json({ message: 'Ponto não encontrado' });
  res.status(204).end();
});

// === Rotas ===
app.get('/api/rotas', (req, res) => {
  res.json(rotas);
});

app.post('/api/rotas', (req, res) => {
  const { nome, descricao, schoolName, escola, pointIds, pontos_id, pontos, horarios, schedules, busId } = req.body || {};
  if (!nome) return res.status(400).json({ message: 'Campo nome é obrigatório' });
  const route = {
    id: genId(),
    nome,
    descricao: descricao || '',
    schoolName: schoolName || escola || '',
    pointIds: Array.isArray(pointIds) ? pointIds : (Array.isArray(pontos_id) ? pontos_id : (Array.isArray(pontos) ? pontos : [])),
    horarios: horarios || schedules || {},
    busId: busId || null,
  };
  rotas.push(route);
  res.status(201).json(route);
});

app.patch('/api/rotas/:id', (req, res) => {
  const { id } = req.params;
  const idx = rotas.findIndex((r) => r.id === id);
  if (idx < 0) return res.status(404).json({ message: 'Rota não encontrada' });
  const { nome, descricao, schoolName, escola, pointIds, pontos_id, pontos, horarios, schedules, busId } = req.body || {};
  if (nome != null) rotas[idx].nome = nome;
  if (descricao != null) rotas[idx].descricao = descricao;
  if (schoolName != null || escola != null) rotas[idx].schoolName = schoolName || escola;
  const ids = Array.isArray(pointIds) ? pointIds : (Array.isArray(pontos_id) ? pontos_id : (Array.isArray(pontos) ? pontos : null));
  if (ids != null) rotas[idx].pointIds = ids;
  if (horarios != null || schedules != null) rotas[idx].horarios = horarios || schedules;
  if (busId != null) rotas[idx].busId = busId;
  res.json(rotas[idx]);
});

app.delete('/api/rotas/:id', (req, res) => {
  const { id } = req.params;
  const before = rotas.length;
  rotas = rotas.filter((r) => r.id !== id);
  if (rotas.length === before) return res.status(404).json({ message: 'Rota não encontrada' });
  res.status(204).end();
});

app.listen(PORT, () => {
  console.log(`Backend exemplo ouvindo em http://localhost:${PORT}`);
});

