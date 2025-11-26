// Unifica o BASE_URL em todas as plataformas e permite override via env
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://backend-mobilize-transporte.onrender.com';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function resolveBaseUrl() {
  const REMOTE = 'https://backend-mobilize-transporte.onrender.com';
  const PROXY = process.env.EXPO_PUBLIC_PROXY_URL || 'http://localhost:3001';
  // No web, preferir proxy local quando não houver configuração explícita
  if (Platform.OS === 'web') {
    // Se BASE_URL está igual ao REMOTE (valor default), usar PROXY
    if (BASE_URL === REMOTE) return PROXY;
    return BASE_URL;
  }
  // Em apps nativos, 'localhost' aponta para o próprio dispositivo/emulador.
  // Se o BASE_URL estiver setado para localhost, fazemos fallback para o backend remoto
  // para evitar 'Network request failed'. Para usar proxy no app, utilize IP da máquina.
  if (Platform.OS !== 'web' && BASE_URL.startsWith('http://localhost')) {
    return REMOTE;
  }
  return BASE_URL;
}

async function getAuthHeaders(extra = {}) {
  try {
    const token = await AsyncStorage.getItem('token');
    const auth = token ? { Authorization: `Bearer ${token}` } : {};
    return { 'Content-Type': 'application/json', ...auth, ...extra };
  } catch {
    return { 'Content-Type': 'application/json', ...extra };
  }
}

async function jsonRequest(path, { method = 'GET', headers = {}, body } = {}) {
  const mergedHeaders = await getAuthHeaders(headers);
  const base = resolveBaseUrl();
  const url = `${base}${path}`;
  // Log básico para diagnosticar ambiente
  console.log(`[api] ${method} ${url} (os=${Platform.OS})`);
  const res = await fetch(url, {
    method,
    headers: mergedHeaders,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch {}
  if (!res.ok) {
    const message = (data && (data.message || data.error)) || `HTTP ${res.status}`;
    throw new Error(message);
  }
  return data;
}

export async function postPonto(payload) {
  // Adapta o payload do app para o schema do backend local
  const body = {
    nome: payload.nome,
    localizacao: payload.endereco
      ? `${payload.endereco} | lat:${payload.latitude}, lng:${payload.longitude}`
      : `lat:${payload.latitude}, lng:${payload.longitude}`,
    foto: payload.foto,
    escolas_id: payload.schoolId,
    user_id: payload.userId,
    onibus_id: payload.busId,
  };
  return jsonRequest('/api/pontos', { method: 'POST', body });
}

export async function getPontos() {
  const base = resolveBaseUrl();
  let res;
  try {
    res = await fetch(`${base}/api/pontos`, { method: 'GET' });
  } catch (err) {
    console.warn('[api] Falha de rede ao buscar pontos:', String(err));
    return [];
  }
  // Fallback amigável: se o backend não tiver o endpoint, não quebrar a UI
  if (res.status === 404) {
    console.warn('[api] /api/pontos retornou 404. Usando lista vazia como fallback.');
    return [];
  }
  const data = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  // Normaliza forma de retorno
  const list = Array.isArray(data) ? data : (Array.isArray(data?.pontos) ? data.pontos : []);
  // Normaliza campos para o app
  return list.map((p) => {
    const id = p.id || p._id || p.uuid || p?.pointId || undefined;
    // Tenta obter latitude/longitude por múltiplas chaves
    let latRaw = p.latitude ?? p.lat ?? p.y;
    let lngRaw = p.longitude ?? p.lng ?? p.lon ?? p.x;

    // Caso não existam campos dedicados, tenta extrair de 'localizacao' (ex.: "Rua X | lat:-21.88, lng:-51.85")
    if ((latRaw == null || lngRaw == null) && typeof p.localizacao === 'string') {
      const mLat = p.localizacao.match(/lat\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
      const mLng = p.localizacao.match(/ln?g\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
      latRaw = latRaw ?? (mLat ? mLat[1] : undefined);
      lngRaw = lngRaw ?? (mLng ? mLng[1] : undefined);
    }

    const latitude = typeof latRaw === 'string' ? parseFloat(latRaw) : Number(latRaw);
    const longitude = typeof lngRaw === 'string' ? parseFloat(lngRaw) : Number(lngRaw);
    return {
      id: id || String(p.nome || p.name || Date.now()),
      nome: p.nome || p.name || p.titulo || 'Ponto',
      endereco: p.endereco || p.address || p.rua || (typeof p.localizacao === 'string' ? p.localizacao.split('|')[0].trim() : ''),
      latitude: Number.isFinite(latitude) ? latitude : 0,
      longitude: Number.isFinite(longitude) ? longitude : 0,
      alunosCount: p.alunosCount ?? p.alunos ?? p.qtdAlunos ?? 0,
      horarioColeta: p.horarioColeta ?? p.horario ?? p.coleta ?? '',
      schoolId: p.schoolId ?? p.escolaId ?? p.school ?? undefined,
      busId: p.busId ?? p.onibusId ?? p.bus ?? undefined,
      userId: p.userId ?? p.usuarioId ?? undefined,
      foto: p.foto || p.photo || undefined,
      // Preserva campos extras para futuras necessidades
      _raw: p,
    };
  });
}

export async function patchPonto(id, payload) {
  // Adapta o payload para o schema do backend local
  const body = {
    nome: payload.nome,
    localizacao: payload.endereco
      ? `${payload.endereco} | lat:${payload.latitude}, lng:${payload.longitude}`
      : `lat:${payload.latitude}, lng:${payload.longitude}`,
    foto: payload.foto,
    escolas_id: payload.schoolId,
    user_id: payload.userId,
    onibus_id: payload.busId,
  };
  return jsonRequest(`/api/pontos/${id}`, { method: 'PATCH', body });
}

export async function deletePonto(id) {
  const base = resolveBaseUrl();
  const res = await fetch(`${base}/api/pontos/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Falha ao deletar ponto (${res.status})`);
  return true;
}

// === Rotas ===
export async function postRota(payload) {
  // Adapta o payload de rota para um formato tolerante
  const body = {
    nome: payload.nome,
    descricao: payload.descricao,
    // nomes alternativos aceitos pelo backend
    schoolName: payload.schoolName,
    escola: payload.schoolName,
    busId: payload.busId,
    // IDs de pontos e nomes alternativos
    pointIds: payload.pointIds,
    pontos_id: payload.pointIds,
    pontos: payload.pointIds,
    // horários por ponto
    horarios: payload.horarios,
    schedules: payload.horarios,
  };
  // Remove campos vazios/undefined para evitar rejeição
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined || body[k] === null) delete body[k];
  });
  return jsonRequest('/api/rotas', { method: 'POST', body });
}

export async function getRotas() {
  const base = resolveBaseUrl();
  let res;
  try {
    res = await fetch(`${base}/api/rotas`, { method: 'GET', headers: await getAuthHeaders({ Accept: 'application/json' }) });
  } catch (err) {
    console.warn('[api] Falha de rede ao buscar rotas:', String(err));
    // Fallback para vazio
    return [];
  }
  if (res.status === 404) {
    console.warn('[api] /api/rotas retornou 404. Usando lista vazia.');
    return [];
  }
  let data = null;
  try { data = await res.json(); } catch { data = []; }
  if (!res.ok) throw new Error((data && (data.message || data.error)) || `HTTP ${res.status}`);
  const list = Array.isArray(data) ? data : (Array.isArray(data?.rotas) ? data.rotas : []);
  return list.map((r) => {
    const id = r.id || r._id || r.uuid || r.routeId || String(r.nome || Date.now());
    const nome = r.nome || r.name || r.titulo || 'Rota';
    const schoolName = r.schoolName || r.escola || r.school || '';
    // Permite tanto array de IDs quanto array de objetos
    let pointIds = r.pointIds || r.pontos_id || r.pontos || [];
    if (Array.isArray(pointIds) && pointIds.length > 0 && typeof pointIds[0] === 'object') {
      pointIds = pointIds.map((p) => p.id || p._id || p.pointId).filter(Boolean);
    }
    const horarios = r.horarios || r.schedules || r.horariosPorPonto || {};
    return { id, nome, schoolName, pointIds: Array.isArray(pointIds) ? pointIds : [], horarios, _raw: r };
  });
}

export async function patchRota(id, updates) {
  const body = {
    nome: updates.nome,
    descricao: updates.descricao,
    // nomes alternativos aceitos pelo backend
    schoolName: updates.schoolName,
    escola: updates.schoolName,
    busId: updates.busId,
    // IDs de pontos e nomes alternativos
    pointIds: updates.pointIds,
    pontos_id: updates.pointIds,
    pontos: updates.pointIds,
    // horários por ponto
    horarios: updates.horarios,
    schedules: updates.horarios,
  };
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined || body[k] === null) delete body[k];
  });
  return jsonRequest(`/api/rotas/${id}`, { method: 'PATCH', body });
}

export async function deleteRota(id) {
  const base = resolveBaseUrl();
  const res = await fetch(`${base}/api/rotas/${id}`, { method: 'DELETE', headers: await getAuthHeaders() });
  if (!res.ok) throw new Error(`Falha ao deletar rota (${res.status})`);
  return true;
}

// === Escolas ===
export async function postEscola(payload) {
  const body = {
    nome: payload.nome,
    localizacao: payload.endereco
      ? `${payload.endereco} | lat:${payload.latitude}, lng:${payload.longitude}`
      : `lat:${payload.latitude}, lng:${payload.longitude}`,
    foto: payload.foto,
  };
  return jsonRequest('/api/escolas', { method: 'POST', body });
}

export async function getEscolas() {
  const base = resolveBaseUrl();
  let res;
  try {
    res = await fetch(`${base}/api/escolas`, { method: 'GET' });
  } catch (err) {
    console.warn('[api] Falha de rede ao buscar escolas:', String(err));
    return [];
  }
  // Fallback amigável: se o backend não tiver o endpoint, não quebrar a UI
  if (res.status === 404) {
    console.warn('[api] /api/escolas retornou 404. Usando lista vazia como fallback.');
    return [];
  }
  const data = await res.json().catch(() => ([]));
  if (!res.ok) throw new Error(data?.message || `HTTP ${res.status}`);
  const list = Array.isArray(data) ? data : (Array.isArray(data?.escolas) ? data.escolas : []);
  return list.map((e) => {
    const id = e.id || e._id || e.uuid || e?.schoolId || undefined;
    let latRaw = e.latitude ?? e.lat ?? e.y;
    let lngRaw = e.longitude ?? e.lng ?? e.lon ?? e.x;
    if ((latRaw == null || lngRaw == null) && typeof e.localizacao === 'string') {
      const mLat = e.localizacao.match(/lat\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
      const mLng = e.localizacao.match(/ln?g\s*[:=]\s*(-?\d+(?:\.\d+)?)/i);
      latRaw = latRaw ?? (mLat ? mLat[1] : undefined);
      lngRaw = lngRaw ?? (mLng ? mLng[1] : undefined);
    }
    const latitude = typeof latRaw === 'string' ? parseFloat(latRaw) : Number(latRaw);
    const longitude = typeof lngRaw === 'string' ? parseFloat(lngRaw) : Number(lngRaw);
    return {
      id: id || String(e.nome || e.name || Date.now()),
      nome: e.nome || e.name || 'Escola',
      endereco: e.endereco || e.address || (typeof e.localizacao === 'string' ? e.localizacao.split('|')[0].trim() : ''),
      latitude: Number.isFinite(latitude) ? latitude : 0,
      longitude: Number.isFinite(longitude) ? longitude : 0,
      foto: e.foto || e.photo || undefined,
      _raw: e,
    };
  });
}

export async function patchEscola(id, payload) {
  const body = {
    nome: payload.nome,
    localizacao: payload.endereco
      ? `${payload.endereco} | lat:${payload.latitude}, lng:${payload.longitude}`
      : `lat:${payload.latitude}, lng:${payload.longitude}`,
    foto: payload.foto,
  };
  return jsonRequest(`/api/escolas/${id}`, { method: 'PATCH', body });
}

export async function deleteEscola(id) {
  const base = resolveBaseUrl();
  const res = await fetch(`${base}/api/escolas/${id}`, { method: 'DELETE' });
  if (!res.ok) throw new Error(`Falha ao deletar escola (${res.status})`);
  return true;
}



export async function patchNotificacaoLida(id) {
  return jsonRequest(`/api/notificacoes/${id}/lida`, { method: 'PATCH' });
}

export async function getNotificacoes() {
  const headers = await getAuthHeaders({ Accept: 'application/json' });
  const base = resolveBaseUrl();
  const url = `${base}/api/notificacoes`;
  console.log(`[api] GET ${url} (os=${Platform.OS})`);
  let res;
  try {
    res = await fetch(url, { method: 'GET', headers });
  } catch (err) {
    console.warn('[api] Falha de rede ao buscar notificações:', String(err));
    return [];
  }
  if (res.status === 404) {
    console.warn('[api] /api/notificacoes retornou 404. Usando lista vazia como fallback.');
    return [];
  }
  const contentType = (res.headers && (res.headers.get ? res.headers.get('content-type') : res.headers['content-type'])) || '';
  let isJson = contentType.includes('application/json');
  let data = null;

  if (isJson) {
    try {
      data = await res.json();
    } catch {
      // Conteúdo não é JSON válido, tenta ler como texto
      isJson = false;
    }
  }

  if (!isJson) {
    const text = await res.text().catch(() => '');
    // Guarda texto bruto em message para logs/erros sem quebrar JSON.parse
    data = { message: (text || '').slice(0, 200) || 'Resposta não-JSON do backend' };
  }

  if (!res.ok) {
    if (res.status === 404) {
      console.log('Endpoint /api/notificacoes ainda não implementado no backend.');
      return [];
    }
    const msg = (isJson && (data?.message || data?.error)) || `HTTP ${res.status}`;
    throw new Error(msg);
  }

  const list = Array.isArray(data) ? data : (Array.isArray(data?.notificacoes) ? data.notificacoes : []);
  // Ordena por data de criação (mais recente primeiro) quando disponível
  const sorted = list
    .map((n) => {
      const raw = n.created_at ?? n.createdAt ?? n.timestamp ?? n.data ?? n.date ?? null;
      let ts = 0;
      if (raw) {
        const s = String(raw);
        const iso = s.includes('T') ? s : s.replace(' ', 'T');
        const d = new Date(iso);
        ts = Number.isFinite(d.getTime()) ? d.getTime() : 0;
      }
      return { ...n, _createdTs: ts };
    })
    .sort((a, b) => (b._createdTs || 0) - (a._createdTs || 0))
    .map(({ _createdTs, ...rest }) => rest);
  console.log('Notificações carregadas do backend:', sorted.length || 0, 'itens');
  return sorted;
}

export async function postNotificacao(payload) {
  // Adapta o payload do app para o schema do backend
  let userId = payload.user_id ?? payload.userId;
  // Ajuste temporário: quando "all" ou indefinido, usar um ID padrão
  if (userId === 'all' || userId === undefined) {
    userId = 1; // TODO: substituir por broadcast quando backend suportar
  }
  const body = {
    user_id: userId,
    titulo: payload.titulo,
    mensagem: payload.mensagem,
    created_at: payload.created_at,
  };

  // Remove campos undefined/null para evitar rejeição por validação estrita
  Object.keys(body).forEach((k) => {
    if (body[k] === undefined || body[k] === null) delete body[k];
  });

  try {
    const result = await jsonRequest('/api/notificacoes', { method: 'POST', body });
    console.log('Notificação salva no backend com sucesso');
    return result;
  } catch (error) {
    if (error.message.includes('404')) {
      console.log('Endpoint /api/notificacoes ainda não implementado. Notificação não foi salva no backend.');
      return { success: false, message: 'Backend endpoint não disponível' };
    }
    console.error('Erro ao postar notificação:', error.message);
    throw error;
  }
}

export async function uploadFotoAluno(ra, fileUri, fileName = 'foto.jpg', mimeType = 'image/jpeg') {
  const form = new FormData();
  form.append('foto', { uri: fileUri, name: fileName, type: mimeType });
  const base = resolveBaseUrl();
  const res = await fetch(`${base}/api/alunos/${ra}/foto`, {
    method: 'POST',
    body: form,
    headers: { 'Accept': 'application/json' },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.message || `Falha no upload (${res.status})`);
  return data;
}

// Busca dados detalhados do aluno por RA com mapeamento tolerante e fallbacks.
export async function getAlunoPorRA(ra) {
  const base = resolveBaseUrl();
  try {
    const res = await fetch(`${base}/api/alunos/${encodeURIComponent(ra)}`, {
      method: 'GET',
      headers: await getAuthHeaders(),
    });
    const raw = await res.text();
    let data;
    try { data = JSON.parse(raw); } catch { data = { message: raw }; }

    if (!res.ok) {
      if (res.status === 404) {
        console.warn('Aluno não encontrado no backend (404). Retornando objeto mínimo.');
        return { ra: String(ra) };
      }
      throw new Error(data?.message || `Falha ao obter aluno (${res.status})`);
    }

    const a = data?.aluno || data;
    // Mapeamento tolerante de campos vindos de diferentes backends
    const nomeCompleto = a.nomeCompleto ?? a.nome ?? a.fullname ?? a.name ?? '';
    const cpf = a.cpf ?? a.documento ?? a.doc ?? '';
    const dataNascimento = a.dataNascimento ?? a.nascimento ?? a.data_nascimento ?? a.dob ?? '';
    const serie = a.serie ?? a.ano ?? a.grade ?? '';
    const turma = a.turma ?? a.class ?? '';
    const ensino = a.ensino ?? a.nivel ?? '';
    const escola = a.escola ?? a.schoolName ?? a.instituicao ?? '';
    const ponto = a.ponto ?? a.pointName ?? a.pontoEmbarque ?? '';
    const rota = a.rota ?? a.linha ?? a.routeName ?? '';
    const cidadeOuDistrito = a.cidade ?? a.distrito ?? a.city ?? a.district ?? '';
    const fotoUrl = a.fotoUrl ?? a.photoUrl ?? a.foto ?? null;

    return {
      ra: String(a.ra ?? ra),
      nomeCompleto,
      cpf,
      dataNascimento,
      serie,
      turma,
      ensino,
      escola,
      ponto,
      rota,
      cidadeOuDistrito,
      fotoUrl,
      _raw: a,
    };
  } catch (error) {
    console.warn('Falha de rede ao obter aluno. Retornando objeto mínimo:', error?.message);
    return { ra: String(ra) };
  }
}
