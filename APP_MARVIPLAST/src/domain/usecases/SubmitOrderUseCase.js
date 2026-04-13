// src/domain/usecases/SubmitOrderUseCase.js

export class SubmitOrderUseCase {
    constructor(repository) {
        this.repository = repository; // EnvasePETRepository
    }

    /**
     * Ejecuta la lógica para enviar el pedido.
     * @param {Object} orderData - Incluye cliente, productos del cesto y notas.
     */
    async execute(orderData) {
        // 1. Estructurar el objeto Pedido según la lógica de negocio [cite: 35]
        const order = {
            ...orderData,
            timestamp: new Date().toISOString(),
            status: 'PENDING'
        };

        try {
            // 2. Intentar envío a través del Repository (Capa de Datos)
            const response = await this.repository.submitOrder(order);
            return { success: true, message: "Pedido enviado con éxito", data: response };
        } catch (error) {
            // 3. Estrategia de Mitigación: Offline First 
            console.warn("Fallo de conexión. Guardando en Pedidos Pendientes.");
            
            await this.repository.saveOrderLocally(order);
            
            return { 
                success: false, 
                offline: true,
                message: "Pedido guardado: se enviará automáticamente al recuperar la conexión" 
            };
        }
    }
}