// src/data/datasources/remote/RemoteDataSource.js

// 1. Tu IP confirmada para la red local
const BASE_URL = 'http://192.168.1.8:3000'; 

export class RemoteDataSource {
    
    async fetchCatalogue(clienteId = null) {
        try {
            // Construimos la URL: enviamos clienteId si existe para obtener precios pactados
            const url = clienteId 
                ? `${BASE_URL}/api/productos?clienteId=${clienteId}`
                : `${BASE_URL}/api/productos`;

            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`Error en el servidor: ${response.status}`);
            }

            const data = await response.json();
            
            /**
             * MAPEADOR ESPECÍFICO:
             * Aquí aseguramos que 'imagen_url' reciba exactamente el string 'fotoX.png'
             * que el CatalogueScreen concatenará con la URL de GitHub.
             */
            return data.map(item => ({
                id: item.id,
                nombre: item.nombre,
                capacidad: item.capacidad,
                gramaje: item.gramaje,
                rosca: item.rosca,
                embalaje: item.embalaje,
                // ESPECIFICACIÓN: 'item.imagen_url' es la columna en Postgres que contiene 'foto1.png'
                imagen_url: item.imagen_url || item.imagenUrl || 'default.png', 
                precio: item.precio 
            }));

        } catch (error) {
            console.error("❌ Error en RemoteDataSource al conectar con 192.168.1.8:", error.message);
            throw error;
        }
    }

    async postOrder(order) {
        try {
            const response = await fetch(`${BASE_URL}/api/pedidos`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(order),
            });

            if (!response.ok) {
                throw new Error('Error al procesar el pedido');
            }

            return await response.json();
        } catch (error) {
            console.error("❌ Error al enviar pedido al Backend:", error.message);
            throw error;
        }
    }
}