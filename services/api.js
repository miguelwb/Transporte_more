// Unifica o BASE_URL em todas as plataformas e permite override via env
export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'https://backend-mobilize-transporte.onrender.com';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

function resolveBaseUrl() {
  // Em apps nativos, 'localhost' aponta para o próprio dispositivo/emulador.
  // Se o BASE_URL estiver setado para localhost, fazemos fallback para o backend remoto
  // para evitar 'Network request failed'. Para usar proxy no app, utilize IP da máquina.
  if (Platform.OS !== 'web' && BASE_URL.startsWith('http://localhost')) {
    return 'https://backend-mobilize-transporte.onrender.com';
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
  const res = await fetch(`${base}/api/pontos`, { method: 'GET' });
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

export async function postRota(payload) {
  return jsonRequest('/api/rotas', { method: 'POST', body: payload });
}



export async function patchNotificacaoLida(id) {
  return jsonRequest(`/api/notificacoes/${id}/lida`, { method: 'PATCH' });
}

export async function getNotificacoes() {
  const headers = await getAuthHeaders({ Accept: 'application/json' });
  const base = resolveBaseUrl();
  const url = `${base}/api/notificacoes`;
  console.log(`[api] GET ${url} (os=${Platform.OS})`);
  const res = await fetch(url, { method: 'GET', headers });
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
  console.log('Notificações carregadas do backend:', list.length || 0, 'itens');
  return list;
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