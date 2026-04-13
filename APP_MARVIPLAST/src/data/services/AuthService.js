// src/data/services/AuthService.js
import AsyncStorage from '@react-native-async-storage/async-storage'; 

export const AuthService = {
    // ... tus otras funciones (login, logout, etc.)

    // ESTA ES LA FUNCIÓN QUE TE FALTA:
    getSessionData: async () => {
        try {
            const jsonValue = await AsyncStorage.getItem('@user_session');
            return jsonValue != null ? JSON.parse(jsonValue) : null;
        } catch (e) {
            console.error("Error recuperando sesión:", e);
            return null;
        }
    },

    // Asegúrate de que tu función de login guarde los datos así:
    login: async (username, password) => {
        try {
            const response = await fetch('http://192.168.1.8:3000/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            const data = await response.json();

            if (data.success) {
                // Guardamos el objeto completo (token, clienteId, etc)
                await AsyncStorage.setItem('@user_session', JSON.stringify(data));
                return data;
            }
            return { success: false };
        } catch (error) {
            console.error("Error en login service:", error);
            return { success: false };
        }
    }
};