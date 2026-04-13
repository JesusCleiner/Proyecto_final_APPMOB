import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

const LoginScreen = ({ onLoginSuccess }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>MARVIPLAST - Login</Text>
      
      <Button 
        title="Ingresar como Cliente" 
        onPress={() => onLoginSuccess({
          token: 'jwt-confirmado-2026',
          rol: 'cliente', // ESTO activa las 3 opciones del menú
          razonSocial: 'Cleiner Gutierrez', // Tu nombre para el encabezado
          ruc: '1045678901',
          id: 1 // Importante para cargar tus pedidos
        })} 
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#2E7D32' }
});

export default LoginScreen;