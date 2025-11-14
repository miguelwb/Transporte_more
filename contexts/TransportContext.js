import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { postPonto, patchPonto, deletePonto, postRota, getPontos } from '../services/api';

const TransportContext = createContext(null);

const STORAGE_KEYS = {
  points: 'transport_points',
  routes: 'transport_routes',
  routeChanges: 'transport_routes_change_count',
};

export function TransportProvider({ children }) {
  const [points, setPoints] = useState([]);
  const [routes, setRoutes] = useState([]);
  const [routeChangeCount, setRouteChangeCount] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        // Carrega apenas do backend; sem cache local de pontos
        const backendPoints = await getPontos();
        if (backendPoints && Array.isArray(backendPoints)) {
          setPoints(backendPoints);
        } else {
          setPoints([]);
        }
        // Mantém cache local apenas para rotas e contagem de alterações
        const savedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.routes);
        const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.routeChanges);
        if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
        if (savedCount) setRouteChangeCount(Number(savedCount) || 0);
      } catch (e) {
        console.warn('Erro ao carregar pontos do backend:', e?.message);
        // Sem fallback local: mantém lista vazia
        setPoints([]);
        // Ainda carrega rotas/contagem localmente
        const savedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.routes);
        const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.routeChanges);
        if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
        if (savedCount) setRouteChangeCount(Number(savedCount) || 0);
      }
    })();
  }, []);

  const refetchPoints = async () => {
    try {
      const backendPoints = await getPontos();
      setPoints(backendPoints || []);
    } catch (e) {
      console.warn('Falha ao sincronizar pontos com backend:', e?.message);
    }
  };

  const savePoints = async (newPoints) => {
    // Sem persistência local: apenas atualiza estado em memória se necessário
    setPoints(newPoints);
  };

  const addPoint = async (point) => {
    // Cria somente no backend. Em caso de falha, não salva localmente.
    const payload = {
      nome: point.nome,
      endereco: point.endereco,
      latitude: point.latitude,
      longitude: point.longitude,
      alunosCount: point.alunosCount,
      horarioColeta: point.horarioColeta,
      // Campos extras se existirem
      schoolId: point.schoolId,
      userId: point.userId,
      busId: point.busId,
      foto: point.foto,
    };
    const created = await postPonto(payload);
    // Após criar no backend, recarrega pontos apenas do backend (sem cache local)
    await refetchPoints();
    return created;
  };

  const updatePoint = async (id, updates) => {
    try {
      await patchPonto(id, updates);
    } catch (e) {
      console.warn('Falha ao atualizar ponto no backend:', e?.message);
    }
    // Recarrega pontos para refletir alterações imediatamente
    await refetchPoints();
  };

  const removePoint = async (id) => {
    try {
      await deletePonto(id);
    } catch (e) {
      console.warn('Falha ao remover ponto no backend:', e?.message);
    }
    // Recarrega pontos para refletir remoção imediatamente
    await refetchPoints();
  };

  const saveRoutes = async (newRoutes) => {
    setRoutes(newRoutes);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.routes, JSON.stringify(newRoutes));
    } catch (e) {
      console.warn('Erro ao salvar rotas:', e);
    }
  };

  const incrementRouteChange = async () => {
    const next = routeChangeCount + 1;
    setRouteChangeCount(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.routeChanges, String(next));
    } catch (e) {
      console.warn('Erro ao salvar contagem de alterações de rota:', e);
    }
  };

  const addRoute = async (route) => {
    // Cria no backend e mantém consistência local
    let backendId = null;
    try {
      const payload = {
        nome: route.nome,
        descricao: route.descricao,
        busId: route.busId,
      };
      const created = await postRota(payload);
      backendId = created?.id || created?._id || null;
    } catch (e) {
      console.warn('Falha ao criar rota no backend, salvando localmente:', e?.message);
    }
    const id = backendId || route.id || `${Date.now()}`;
    const newRoutes = [...routes, { ...route, id }];
    await saveRoutes(newRoutes);
    await incrementRouteChange();
  };

  const updateRoute = async (id, updates) => {
    const newRoutes = routes.map((r) => (r.id === id ? { ...r, ...updates } : r));
    await saveRoutes(newRoutes);
    await incrementRouteChange();
  };

  const removeRoute = async (id) => {
    const newRoutes = routes.filter((r) => r.id !== id);
    await saveRoutes(newRoutes);
    await incrementRouteChange();
  };

  const totalStudentsTransported = useMemo(() => {
    // Soma de alunos dos pontos que pertencem a pelo menos uma rota
    const pointIdsInRoutes = new Set();
    routes.forEach((r) => {
      (r.pointIds || []).forEach((pid) => pointIdsInRoutes.add(pid));
    });
    return points
      .filter((p) => pointIdsInRoutes.has(p.id))
      .reduce((acc, p) => acc + (Number(p.alunosCount) || 0), 0);
  }, [points, routes]);

  const value = {
    points,
    routes,
    routeChangeCount,
    addPoint,
    updatePoint,
    removePoint,
    addRoute,
    updateRoute,
    removeRoute,
    // expõe utilitário para cenários avançados
    refetchPoints,
    totalStudentsTransported,
  };

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
}

export function useTransport() {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error('useTransport deve ser usado dentro de TransportProvider');
  return ctx;
}