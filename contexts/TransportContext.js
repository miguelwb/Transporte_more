import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

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
        const savedPoints = await AsyncStorage.getItem(STORAGE_KEYS.points);
        const savedRoutes = await AsyncStorage.getItem(STORAGE_KEYS.routes);
        const savedCount = await AsyncStorage.getItem(STORAGE_KEYS.routeChanges);

        if (savedPoints) setPoints(JSON.parse(savedPoints));
        if (savedRoutes) setRoutes(JSON.parse(savedRoutes));
        if (savedCount) setRouteChangeCount(Number(savedCount) || 0);
      } catch (e) {
        console.warn('Erro ao carregar dados de transporte:', e);
      }
    })();
  }, []);

  const savePoints = async (newPoints) => {
    setPoints(newPoints);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.points, JSON.stringify(newPoints));
    } catch (e) {
      console.warn('Erro ao salvar pontos:', e);
    }
  };

  const addPoint = async (point) => {
    const id = point.id || `${Date.now()}`;
    const newPoints = [...points, { ...point, id }];
    await savePoints(newPoints);
  };

  const updatePoint = async (id, updates) => {
    const newPoints = points.map((p) => (p.id === id ? { ...p, ...updates } : p));
    await savePoints(newPoints);
  };

  const removePoint = async (id) => {
    const newPoints = points.filter((p) => p.id !== id);
    await savePoints(newPoints);
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
    const id = route.id || `${Date.now()}`;
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
    totalStudentsTransported,
  };

  return <TransportContext.Provider value={value}>{children}</TransportContext.Provider>;
}

export function useTransport() {
  const ctx = useContext(TransportContext);
  if (!ctx) throw new Error('useTransport deve ser usado dentro de TransportProvider');
  return ctx;
}