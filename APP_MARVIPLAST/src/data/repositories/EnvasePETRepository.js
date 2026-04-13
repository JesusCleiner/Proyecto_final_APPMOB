// src/data/repositories/EnvasePETRepository.js
export class EnvasePETRepository {
    constructor(remote, local) {
        this.remote = remote; // Aquí es donde inyectas el RemoteDataSource que tiene la IP
        this.local = local;
    }

    // Método principal para el catálogo
    async getCatalogue(clienteId = null) {
        try {
            console.log(`📡 Repositorio: Cargando catálogo para Cliente ID: ${clienteId || 'Invitado'}...`);
            // Llamamos al RemoteDataSource (Postgres vía Backend)
            const data = await this.remote.fetchCatalogue(clienteId);
            // Verificamos que los datos lleguen como array
            if (!data || !Array.isArray(data)) {
                console.warn("⚠️ Los datos del catálogo no tienen el formato esperado (Array)");
                return [];
            }
            return data;
        } catch (error) {
            console.error("❌ Fallo en EnvasePETRepository al obtener catálogo:", error.message);
            // Si falla el servidor, podrías intentar cargar de 'this.local' si implementaste caché
            return [];
        }
    }

    // Método para enviar pedidos a Postgres
    async postOrder(order) {
        try {
            console.log("📝 Enviando pedido a procesamiento...");
            // Validamos que el pedido tenga al menos un producto
            if (!order || order.items.length === 0) {
                throw new Error("El pedido está vacío");
            }
            return await this.remote.postOrder(order);
        } catch (error) {
            console.error("❌ Error al enviar pedido desde el repositorio:", error.message);
            throw error; // Re-lanzamos el error para que la UI lo maneje
        }
    }
}