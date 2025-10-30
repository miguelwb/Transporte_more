import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, FC, ReactNode, useContext, useEffect, useState } from "react";


type Aluno = {
    id: number;
    nome: string;
    email: string;
    ra: number;
};

type AuthContextProps = {
    user: Aluno | null;
    signIn: (user: Aluno) => Promise<void>;
    signOut: () => Promise<void>;
    loading?: boolean;
};

const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Aluno | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStorageData = async () => {
            try {
                const id = await AsyncStorage.getItem('id');
                const nome = await AsyncStorage.getItem('nome');
                const email = await AsyncStorage.getItem('email');
                const ra = await AsyncStorage.getItem('ra');
                if (id && nome && email && ra) {
                    setUser({ id: Number(id), nome, email, ra: Number(ra) });
                }
            } catch (error) {
                console.log(error);
            } finally {
                setLoading(false);
            }
        }
        loadStorageData();
    }, []);

    const signIn = async (userData: Aluno) => {
        setUser(userData);
        await AsyncStorage.setItem('id', String(userData.id));
        await AsyncStorage.setItem('nome', userData.nome);
        await AsyncStorage.setItem('email', userData.email);
        await AsyncStorage.setItem('ra', String(userData.ra));
    }

    const signOut = async () => {
        setUser(null);
        await AsyncStorage.clear();
    }

    return (
        <AuthContext.Provider value={{ user, signIn, signOut, loading }}>
            {children}
        </AuthContext.Provider>
    )
}
export const useAuth = () => useContext(AuthContext);