// src/domain/entities/EnvasePET.js

export class EnvasePET {
    constructor(id, gramaje, capacidad, medidas, tipo_rosca) {
        this.id = id;
        this.gramaje = gramaje;       // Crucial para filtros técnicos 
        this.capacidad = capacidad;   // Ej: 500ml, 1L 
        this.medidas = medidas;       // Especificaciones de Marviplast 
        this.tipo_rosca = tipo_rosca; // Datos para clientes mayoristas 
    }
}