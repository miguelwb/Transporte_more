import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const UserDataContext = createContext();

export const UserDataProvider = ({ children }) => {
  const [instituicao, setInstituicao] = useState('');
  const [ponto, setPonto] = useState('');
  const [theme, setTheme] = useState('light');
  const [profileImage, setProfileImage] = useState(null);
  const [nome, setNome] = useState('');

  // Carregar dados salvos quando o app iniciar
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const savedInstituicao = await AsyncStorage.getItem('userInstituicao');
        const savedPonto = await AsyncStorage.getItem('userPonto');
        const savedTheme = await AsyncStorage.getItem('userTema');
        const savedImageUri = await AsyncStorage.getItem('userProfileImage');
        const savedNome = await AsyncStorage.getItem('userNome');
        
        if (savedInstituicao) setInstituicao(savedInstituicao);
        if (savedPonto) setPonto(savedPonto);
        if (savedTheme) setTheme(JSON.parse(savedTheme) ? 'dark' : 'light');
        if (savedImageUri) setProfileImage(savedImageUri);
        if (savedNome) setNome(savedNome);
      } catch (error) {
        console.error('Erro ao carregar dados do usuário:', error);
      }
    };
    
    loadUserData();
  }, []);

  // Função para atualizar os dados do usuário
  const updateUserData = async (newInstituicao, newPonto) => {
    try {
      if (newInstituicao) {
        await AsyncStorage.setItem('userInstituicao', newInstituicao);
        setInstituicao(newInstituicao);
      }
      
      if (newPonto) {
        await AsyncStorage.setItem('userPonto', newPonto);
        setPonto(newPonto);
      }
      
      return true;
    } catch (error) {
      console.error('Erro ao salvar dados do usuário:', error);
      return false;
    }
  };

  // Função para atualizar o tema
  const updateTheme = async (newTheme) => {
    try {
      setTheme(newTheme);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar tema:', error);
      return false;
    }
  };

  // Função para atualizar a foto de perfil
  const updateProfileImage = async (imageUri) => {
    try {
      await AsyncStorage.setItem('userProfileImage', imageUri);
      setProfileImage(imageUri);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar foto de perfil:', error);
      return false;
    }
  };

  // Função para atualizar o nome do usuário
  const updateNome = async (newNome) => {
    try {
      await AsyncStorage.setItem('userNome', newNome);
      setNome(newNome);
      return true;
    } catch (error) {
      console.error('Erro ao atualizar nome:', error);
      return false;
    }
  };

  return (
    <UserDataContext.Provider value={{ 
      instituicao, 
      ponto, 
      theme, 
      profileImage,
      nome,
      updateUserData, 
      updateTheme,
      updateProfileImage,
      updateNome
    }}>
      {children}
    </UserDataContext.Provider>
  );
};

export const useUserData = () => useContext(UserDataContext);