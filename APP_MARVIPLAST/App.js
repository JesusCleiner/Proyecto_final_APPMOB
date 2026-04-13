import React, { useState, useEffect } from 'react';
import { ActivityIndicator, View, Alert, StyleSheet } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// IMPORTACIONES DE DATOS
import { RemoteDataSource } from './src/data/datasources/remote/RemoteDataSource';
import { LocalDataSource } from './src/data/datasources/local/LocalDataSource';
import { EnvasePETRepository } from './src/data/repositories/EnvasePETRepository';

// PANTALLA PRINCIPAL
import CatalogueScreen from './src/presentation/screens/CatalogueScreen';

const remoteDS = new RemoteDataSource();
const localDS = new LocalDataSource();
const petRepository = new EnvasePETRepository(remoteDS, localDS);

/**
 * ⚠️ IMPORTANTE: 
 * Cambia '192.168.1.8' por la IP exacta que te sale al poner 'ipconfig' en tu terminal.
 * Asegúrate de que el celular/emulador esté en la misma red Wi-Fi que la PC.
 */
const API_URL = "http://192.168.1.8:3000"; 

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = await localDS.getToken();
        
        // Si hay un token guardado, intentamos recuperar los datos reales de la DB
        if (token) {
          console.log("Token encontrado, recuperando datos del cliente...");
          
          const response = await fetch(`${API_URL}/api/clientes/1`);
          
          if (!response.ok) {
            throw new Error("Error en la respuesta del servidor");
          }

          const dbUserData = await response.json();

          if (dbUserData && dbUserData.id) {
            // Guardamos el objeto completo (nombre, identificacion, telefono, ciudad, etc.)
            setUser({ 
              ...dbUserData, 
              token: token,
              rol: 'cliente' 
            });
            console.log("✅ Sesión de Cleiner recuperada con éxito");
          }
        } else {
          console.log("No se encontró token, iniciando en modo invitado");
        }
      } catch (e) {
        console.error("❌ Error al conectar con el servidor:", e.message);
        // Opcional: Alert.alert("Error de Conexión", "No se pudo conectar con el servidor de base de datos.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Esta función se ejecuta cuando el usuario hace Login manual exitoso
  const handleLoginSuccess = async (userData) => {
    try {
      const token = userData.token || 'token-marviplast';
      // Combinamos los datos que vienen del login manual con el token
      setUser({ ...userData, token });
      await localDS.saveToken(token);
    } catch (e) {
      Alert.alert("Error", "No se pudo guardar la sesión localmente");
    }
  };

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#003366" />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CatalogueScreen 
        repository={petRepository}
        user={user} // Pasamos el usuario real (o null si es invitado)
        onLoginSuccess={handleLoginSuccess}
      />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff'
  }
});