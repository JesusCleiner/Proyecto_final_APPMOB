// src/presentation/viewmodels/CatalogueViewModel.js
import { useState, useEffect } from 'react';

export const useCatalogueViewModel = (repository) => {
    const [allProducts, setAllProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [selectedGramaje, setSelectedGramaje] = useState('Todos');
    const [loading, setLoading] = useState(true);
    const [cart, setCart] = useState([]); 
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [clienteId, setClienteId] = useState(null);

    const loadProducts = async () => {
        try {
            setLoading(true);
            const data = await repository.getCatalogue(clienteId); 
            const productsArray = Array.isArray(data) ? data : [];
            setAllProducts(productsArray);
            setFilteredProducts(productsArray);
        } catch (error) {
            console.error("❌ Error al cargar productos:", error);
            setAllProducts([]);
            setFilteredProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const filterByGramaje = (gramaje) => {
        setSelectedGramaje(gramaje);
        if (gramaje === 'Todos') {
            setFilteredProducts(allProducts);
        } else {
            const filtered = allProducts.filter(p => {
                const pGramaje = p.gramaje || p.GRAMAJE;
                return String(pGramaje) === String(gramaje);
            });
            setFilteredProducts(filtered);
        }
    };

    // --- FUNCIÓN CORREGIDA ---
    const addToCart = (product, bultosExtra) => {
        // 1. Detectamos bultos: o vienen como 2do parámetro o vienen dentro del objeto
        const bultosFinal = bultosExtra || product.bultosSolicitados || 1;
        
        // 2. Soporte para campos en Mayúsculas (Oracle) o Minúsculas
        const unidadesPorBulto = Number(product.embalaje || product.EMBALAJE) || 1;
        const precioUnitario = Number(product.precio || product.PRECIO) || 0;
        const cantidadBultos = Number(bultosFinal) || 0;

        // 3. Cálculos
        const totalUnidades = cantidadBultos * unidadesPorBulto;
        const subtotalCalculado = totalUnidades * precioUnitario;
        const iva = subtotalCalculado * 0.15;
        const totalConIva = subtotalCalculado + iva;

        const item = {
            ...product,
            nombre: product.nombre || product.NOMBRE, // Normalizamos el nombre
            idUnique: Date.now() + Math.random(), 
            cantidadBultos: cantidadBultos,
            totalUnidades: totalUnidades,
            subtotal: subtotalCalculado, 
            totalItem: totalConIva // Este es el que se muestra en la pre-factura
        };

        setCart(prevCart => [...prevCart, item]);
    };

    const clearCart = () => setCart([]); 

    const loginClient = (id) => {
        setIsAuthenticated(true);
        setClienteId(id);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const totalCart = cart.reduce((acc, item) => acc + (Number(item.totalItem) || 0), 0);

    return {
        products: filteredProducts,
        selectedGramaje,
        filterByGramaje, 
        loadProducts,
        loading,
        cart,
        totalCart,
        addToCart,
        clearCart, 
        isAuthenticated,
        clienteId,
        loginClient
    };
};