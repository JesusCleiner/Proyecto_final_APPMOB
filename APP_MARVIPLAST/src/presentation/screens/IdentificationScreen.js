// src/presentation/screens/IdentificationScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const IdentificationScreen = ({ onConfirm, onCancel, loginClient }) => {
    const [username, setUsername] = useState(''); // Cambiamos 'code' por 'username'
    const [password, setPassword] = useState(''); // Añadimos password para ser reales
    const [error, setError] = useState('');

    const handleLogin = async () => {
        if (!username || !password) {
            setError('Por favor, ingrese sus credenciales.');
            return;
        }

        // Llamamos a loginClient enviando los datos de Oracle
        // El cliente de prueba que creamos es: cliente_manta / 1234
        const userSession = await loginClient(username, password);

        if (userSession && userSession.clienteId) {
            Alert.alert("Bienvenido", `Sesión iniciada como: ${userSession.razonSocial}`);
            onConfirm(userSession.clienteId); // Pasamos el ID al padre para filtrar precios
        } else {
            setError('Usuario o contraseña incorrectos.');
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Oficina Virtual Marviplast</Text>
            <Text style={styles.subtitle}>Ingrese sus credenciales para ver sus precios pactados y realizar pedidos.</Text>
            
            <TextInput 
                style={styles.input}
                placeholder="RUC o Nombre de Usuario"
                value={username}
                onChangeText={(val) => { setUsername(val); setError(''); }}
                autoCapitalize="none"
            />

            <TextInput 
                style={styles.input}
                placeholder="Contraseña"
                value={password}
                onChangeText={(val) => { setPassword(val); setError(''); }}
                secureTextEntry={true}
            />
            
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <TouchableOpacity style={styles.btnConfirm} onPress={handleLogin}>
                <Text style={styles.btnText}>Iniciar Sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnCancel} onPress={onCancel}>
                <Text style={[styles.btnText, {color: '#666'}]}>Ver Catálogo (Sin Precios)</Text>
            </TouchableOpacity>

            <View style={styles.footer}>
                <Text style={styles.footerText}>¿No tiene cuenta?</Text>
                <TouchableOpacity onPress={() => Alert.alert("Registro", "Contacte a Ventas Marviplast para dar de alta su negocio.")}>
                    <Text style={styles.link}>Solicitar Acceso</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1, padding: 30, justifyContent: 'center', backgroundColor: '#fff' },
    title: { fontSize: 24, fontWeight: 'bold', color: '#003366', marginBottom: 10, textAlign: 'center' },
    subtitle: { fontSize: 14, color: '#666', marginBottom: 30, textAlign: 'center' },
    input: { borderWidth: 1, borderColor: '#ddd', padding: 15, borderRadius: 10, marginBottom: 15, fontSize: 16 },
    btnConfirm: { backgroundColor: '#003366', padding: 18, borderRadius: 10, alignItems: 'center', marginTop: 10 },
    btnCancel: { padding: 15, marginTop: 10, alignItems: 'center' },
    btnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
    errorText: { color: 'red', marginBottom: 15, textAlign: 'center' },
    footer: { marginTop: 40, alignItems: 'center' },
    footerText: { color: '#999' },
    link: { color: '#003366', fontWeight: 'bold', marginTop: 5 }
});

export default IdentificationScreen;