// Función de lógica de negocio: Cálculo de unidades por bulto
// Regla: Si la cantidad es negativa, devuelve 0.
const calcularUnidadesTotales = (bultos, unidadesPorBulto) => {
    if (bultos < 0) return 0;
    return bultos * unidadesPorBulto;
};

// --- PRUEBA UNITARIA ---
describe('Pruebas Unitarias de Marviplast', () => {
    
    test('Debe calcular correctamente 5 bultos de 50 unidades', () => {
        const resultado = calcularUnidadesTotales(5, 50);
        expect(resultado).toBe(250);
    });

    test('Debe retornar 0 si se ingresan bultos negativos (Manejo de errores)', () => {
        const resultado = calcularUnidadesTotales(-1, 50);
        expect(resultado).toBe(0);
    });
});