// src/data/datasources/local/LocalDataSource.js
import * as SQLite from 'expo-sqlite';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- Importante

export class LocalDataSource {
    constructor() {
        this.db = null;
        if (Platform.OS !== 'web') {
            this.initDatabase();
        }
    }

    async initDatabase() {
        try {
            this.db = await SQLite.openDatabaseAsync('marviplast_db');
            // Tu lógica de tablas de productos_cache sigue aquí...
        } catch (e) {
            console.log("SQLite no disponible en este entorno");
        }
    }

    // --- NUEVOS MÉTODOS PARA PERSISTENCIA DE SESIÓN (Punto D) ---

    async saveToken(token) {
        try {
            await AsyncStorage.setItem('userToken', token);
        } catch (e) {
            console.error("Error al guardar token localmente", e);
        }
    }

    async getToken() {
        try {
            return await AsyncStorage.getItem('userToken');
        } catch (e) {
            console.error("Error al recuperar token", e);
            return null;
        }
    }

    async removeToken() {
        try {
            await AsyncStorage.removeItem('userToken');
        } catch (e) {
            console.error("Error al borrar sesión", e);
        }
    }

    // --- MÉTODOS EXISTENTES ---
    async getCatalogue() {
        if (Platform.OS === 'web' || !this.db) return [];
        return await this.db.getAllAsync('SELECT * FROM productos_cache');
    }
}