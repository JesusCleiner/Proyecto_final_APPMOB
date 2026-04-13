import React, { useState, useMemo, useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Image,
    ScrollView,
    Modal,
    TextInput,
    Linking,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Dimensions
} from 'react-native';
import { useCatalogueViewModel } from '../viewmodels/CatalogueViewModel';

const { width } = Dimensions.get('window');
const GITHUB_IMAGE_BASE = 'https://raw.githubusercontent.com/JesusCleiner/AP_MOVILES_IMAGENES/main/';
// IP del servidor
const API_URL = 'http://192.168.1.8:3000';

const CatalogueScreen = ({ repository }) => {
    const { products, loading, cart, addToCart, clearCart } = useCatalogueViewModel(repository);

    // --- ESTADOS DE UI ---
    const [selectedGramaje, setSelectedGramaje] = useState('Todas');
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [orderModalVisible, setOrderModalVisible] = useState(false);
    const [cartModalVisible, setCartModalVisible] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [bultos, setBultos] = useState('1');
    const [isProcessing, setIsProcessing] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // --- ESTADOS DE PERFIL Y PEDIDOS ---
    const [profileModalVisible, setProfileModalVisible] = useState(false);
    const [myOrdersModalVisible, setMyOrdersModalVisible] = useState(false);
    const [userOrders, setUserOrders] = useState([]);
    const [loadingOrders, setLoadingOrders] = useState(false);

    // --- ESTADOS DE AUTENTICACIÓN ---
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const [isLoggingIn, setIsLoggingIn] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [userData, setUserData] = useState(null);

    const categorias = ['Todas', '14.5', '19.0', '19.5', '22.0', '27.0', '28.0', '85.0'];

    // --- LÓGICA DE FILTRADO ---
    const filteredProducts = useMemo(() => {
        if (selectedGramaje === 'Todas') return products;
        return products.filter(p => parseFloat(p.gramaje) === parseFloat(selectedGramaje));
    }, [selectedGramaje, products]);

    // --- EFECTO: CARGAR PEDIDOS ---
    useEffect(() => {
        if (myOrdersModalVisible && userData?.id) {
            fetchOrders();
        }
    }, [myOrdersModalVisible]);

    // --- FUNCIÓN FETCH ORDERS ---
    const fetchOrders = async () => {
        if (!userData?.id) return;
        setLoadingOrders(true);
        try {
            const response = await fetch(`${API_URL}/api/mis-pedidos/${userData.id}`);
            const data = await response.json();
            setUserOrders(data);
        } catch (error) {
            console.error("Error al obtener pedidos:", error);
            const msg = "No se pudieron cargar los pedidos";
            Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
        } finally {
            setLoadingOrders(false);
        }
    };

    // --- ACCIONES DE SESIÓN ---
    const handleLogin = async () => {
        if (email.trim() === '' || password.trim() === '') {
            const msg = "Por favor ingresa tus credenciales";
            Platform.OS === 'web' ? alert(msg) : Alert.alert("Error", msg);
            return;
        }
        setIsLoggingIn(true);
        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: email, password: password }),
            });
            const data = await response.json();
            
            if (response.ok && data.success) {
                setUserData(data.user);
                setIsLoggedIn(true);
                setLoginModalVisible(false);
                setEmail('');
                setPassword('');
                
                if (selectedProduct) {
                    setOrderModalVisible(true);
                }
                const welcomeMsg = `Bienvenido, ${data.user.username}`;
                Platform.OS === 'web' ? alert(welcomeMsg) : Alert.alert("Éxito", welcomeMsg);
            } else {
                const errorMsg = data.message || "Credenciales incorrectas";
                Platform.OS === 'web' ? alert(errorMsg) : Alert.alert("Error", errorMsg);
            }
        } catch (error) {
            const connectError = "No se pudo conectar con el servidor";
            Platform.OS === 'web' ? alert(connectError) : Alert.alert("Error", connectError);
        } finally {
            setIsLoggingIn(false);
        }
    };

    const handleLogout = () => {
        setIsLoggedIn(false);
        setUserData(null);
        setDrawerVisible(false);
        const msg = "Sesión cerrada.";
        Platform.OS === 'web' ? alert(msg) : Alert.alert("Info", msg);
    };

    // --- LÓGICA DE ENVÍO DE PEDIDOS (FINALIZAR) ---
    const finalizarPedidoCompleto = async () => {
        if (cart.length === 0 || isProcessing) return;
        
        setIsProcessing(true);
        const totalGral = cart.reduce((acc, item) => acc + item.totalItem, 0);
        
        try {
            const response = await fetch(`${API_URL}/api/pedidos`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json' 
                },
                body: JSON.stringify({
                    clienteId: userData?.id, 
                    clienteNombre: userData?.username,
                    items: cart.map(item => ({
                        id: item.id,
                        nombre: item.nombre,
                        cantidadBultos: parseInt(item.bultosSolicitados),
                        precio: parseFloat(item.precio),
                        totalItem: parseFloat(item.totalItem)
                    })),
                    total: totalGral
                }),
            });

            const res = await response.json();

            if (response.ok && res.success) {
                if (clearCart) clearCart(); // Limpia el carrito en el ViewModel
                setCartModalVisible(false);
                setTimeout(() => {
                    setShowSuccessModal(true);
                    setIsProcessing(false);
                }, 500);
            } else {
                const errorMsg = res.message || "El servidor no confirmó el guardado.";
                Platform.OS === 'web' ? alert(errorMsg) : Alert.alert("Atención", errorMsg);
                setIsProcessing(false);
            }
        } catch (error) {
            console.error("Error en finalizarPedido:", error);
            const connectError = "No se pudo conectar con el servidor.";
            Platform.OS === 'web' ? alert(connectError) : Alert.alert("Error", connectError);
            setIsProcessing(false);
        }
    };

    const handleBuyPress = (item) => {
        setSelectedProduct(item);
        setBultos('1');
        if (isLoggedIn) {
            setOrderModalVisible(true);
        } else {
            setLoginModalVisible(true);
        }
    };

    const solicitarCuenta = () => {
        const mensaje = "Hola Marviplast, deseo solicitar acceso a la App.";
        Linking.openURL(`https://wa.me/593980415316?text=${encodeURIComponent(mensaje)}`);
    };

    const getImageUrl = (imageName) => imageName ? `${GITHUB_IMAGE_BASE}${imageName}` : 'https://via.placeholder.com/150';

    const calcularTotales = () => {
        if (!selectedProduct) return { unidades: 0, subtotal: 0, iva: 0, total: 0 };
        const cantBultos = parseInt(bultos) || 0;
        const unidadesPorBulto = parseInt(selectedProduct.embalaje) || 0;
        const precioUnitario = parseFloat(selectedProduct.precio) || 0;
        
        const unidades = cantBultos * unidadesPorBulto;
        const subtotal = unidades * precioUnitario;
        const iva = subtotal * 0.15; 
        const total = subtotal + iva;
        
        return { unidades, subtotal, iva, total };
    };

    const renderItem = ({ item }) => (
        <View style={styles.card}>
            <View style={styles.productRow}>
                <Image source={{ uri: getImageUrl(item.imagen_url) }} style={styles.productImage} resizeMode="contain" />
                <View style={styles.infoContainer}>
                    <Text style={styles.productTitle}>{item.nombre}</Text>
                    <View style={styles.badgeRow}>
                        <Text style={styles.gramajeBadge}>{item.gramaje} gr</Text>
                        <Text style={styles.roscaBadge}>{item.rosca}</Text>
                    </View>
                    {isLoggedIn && <Text style={styles.priceText}>${parseFloat(item.precio).toFixed(3)}</Text>}
                </View>
            </View>
            <View style={styles.actionButtons}>
                <TouchableOpacity style={styles.detailsBtn} onPress={() => { setSelectedProduct(item); setDetailModalVisible(true); }}>
                    <Text style={styles.detailsBtnText}>Detalles</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buyBtn} onPress={() => handleBuyPress(item)}>
                    <Text style={styles.buyBtnText}>Hacer Compra</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderDrawer = () => (
        <Modal visible={drawerVisible} animationType="fade" transparent={true} onRequestClose={() => setDrawerVisible(false)}>
            <View style={styles.drawerOverlay}>
                <TouchableOpacity style={styles.drawerCloseArea} activeOpacity={1} onPress={() => setDrawerVisible(false)} />
                <View style={styles.drawerContent}>
                    <View style={styles.drawerHeader}>
                        <Text style={styles.drawerTitle}>Marviplast S.A.</Text>
                        <Text style={styles.drawerUser}>{isLoggedIn ? `Usuario: ${userData?.username}` : "Modo Invitado"}</Text>
                    </View>
                    <ScrollView style={styles.drawerItems}>
                        <TouchableOpacity style={styles.drawerItem} onPress={() => setDrawerVisible(false)}>
                            <Text style={styles.drawerItemText}>🏠 Catálogo de Productos</Text>
                        </TouchableOpacity>
                        {!isLoggedIn ? (
                            <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerVisible(false); setLoginModalVisible(true); }}>
                                <Text style={[styles.drawerItemText, { color: '#003366', fontWeight: 'bold' }]}>🔑 Iniciar Sesión</Text>
                            </TouchableOpacity>
                        ) : (
                            <>
                                <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerVisible(false); setMyOrdersModalVisible(true); }}>
                                    <Text style={styles.drawerItemText}>📦 Mis Pedidos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.drawerItem} onPress={() => { setDrawerVisible(false); setProfileModalVisible(true); }}>
                                    <Text style={styles.drawerItemText}>👤 Mi Perfil / Datos</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.drawerItem} onPress={solicitarCuenta}>
                                    <Text style={styles.drawerItemText}>💬 Soporte WhatsApp</Text>
                                </TouchableOpacity>
                                <View style={styles.drawerDivider} />
                                <TouchableOpacity style={styles.drawerItem} onPress={handleLogout}>
                                    <Text style={[styles.drawerItemText, { color: '#dc3545' }]}>🚪 Cerrar Sesión</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );

    const totales = calcularTotales();

    return (
        <View style={styles.container}>
            {renderDrawer()}

            {/* --- MODAL ÉXITO --- */}
            <Modal visible={showSuccessModal} transparent={true} animationType="fade">
                <View style={styles.modalOverlay}>
                    <View style={styles.successContent}>
                        <Text style={{ fontSize: 50, marginBottom: 10 }}>✅</Text>
                        <Text style={styles.modalTitle}>¡Pedido Recibido!</Text>
                        <Text style={{ textAlign: 'center', color: '#666', marginBottom: 20 }}>
                            Notificación enviada a Ventas y registro guardado exitosamente.
                        </Text>
                        <TouchableOpacity style={styles.confirmOrderBtn} onPress={() => setShowSuccessModal(false)}>
                            <Text style={styles.confirmOrderText}>ACEPTAR</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* --- CABECERA --- */}
            <View style={styles.customHeader}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => setDrawerVisible(true)} style={styles.menuButton}>
                        <Text style={styles.menuIcon}>☰</Text>
                    </TouchableOpacity>
                    <Image source={{ uri: `${GITHUB_IMAGE_BASE}logo_marviplast.png` }} style={styles.headerLogo} resizeMode="contain" />
                    <View style={styles.brandTextContainer}>
                        <Text style={styles.brandTitle}>MARVIPLAST</Text>
                        <Text style={styles.brandSubtitle} numberOfLines={1}>
                            {isLoggedIn ? `Hola, ${userData?.username}` : "Fábrica de Botellas"}
                        </Text>
                    </View>
                </View>
                <View style={styles.headerRight}>
                    <TouchableOpacity style={styles.cartBtn} onPress={() => setCartModalVisible(true)}>
                        <Text style={styles.cartEmoji}>🛒</Text>
                        {cart.length > 0 && <View style={styles.badge}><Text style={styles.badgeText}>{cart.length}</Text></View>}
                    </TouchableOpacity>
                </View>
            </View>

            {/* FILTROS */}
            <View style={styles.filterBarContainer}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
                    {categorias.map((cat) => (
                        <TouchableOpacity key={cat} onPress={() => setSelectedGramaje(cat)}
                            style={[styles.filterBtn, selectedGramaje === cat && styles.filterBtnActive]}>
                            <Text style={[styles.filterBtnText, selectedGramaje === cat && styles.filterBtnTextActive]}>
                                {cat === 'Todas' ? cat : `${cat} gr`}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* LISTADO */}
            {loading ? (
                <View style={styles.center}><ActivityIndicator size="large" color="#003366" /></View>
            ) : (
                <FlatList
                    data={filteredProducts}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    style={{ flex: 1 }}
                />
            )}

            {/* MODAL: MI PERFIL */}
            <Modal visible={profileModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.loginContent}>
                        <Text style={styles.modalTitle}>Mi Perfil</Text>
                        {userData && (
                            <View style={styles.specGrid}>
                                <View style={styles.specItem}><Text style={styles.boldText}>Usuario: </Text><Text>{userData.username}</Text></View>
                                <View style={styles.specItem}><Text style={styles.boldText}>ID de Acceso: </Text><Text>#00{userData.id}</Text></View>
                                <View style={styles.specItem}><Text style={styles.boldText}>Rol: </Text><Text>{userData.role}</Text></View>
                                <View style={styles.specItem}><Text style={styles.boldText}>Empresa: </Text><Text>Marviplast S.A.</Text></View>
                                <View style={styles.specItem}><Text style={styles.boldText}>Estado: </Text><Text style={{color: 'green', fontWeight:'bold'}}>CONECTADO</Text></View>
                            </View>
                        )}
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setProfileModalVisible(false)}>
                            <Text style={styles.closeBtnText}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL: MIS PEDIDOS */}
            <Modal visible={myOrdersModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.orderContent, {maxHeight: '85%'}]}>
                        <Text style={styles.modalTitle}>Historial de Pedidos</Text>
                        {loadingOrders ? (
                            <ActivityIndicator size="small" color="#003366" />
                        ) : (
                            <FlatList
                                data={userOrders}
                                keyExtractor={(item) => item.id.toString()}
                                renderItem={({ item }) => (
                                    <View style={[styles.tableRow, {flexDirection: 'column', alignItems: 'flex-start', borderBottomWidth:1, borderBottomColor:'#eee', paddingVertical:10}]}>
                                        <View style={{flexDirection:'row', justifyContent:'space-between', width:'100%'}}>
                                            <Text style={styles.boldText}>Pedido #{item.id}</Text>
                                            <Text style={{color: '#28a745', fontWeight:'bold'}}>${parseFloat(item.total).toFixed(2)}</Text>
                                        </View>
                                        <Text style={{fontSize: 12, color: '#666'}}>{new Date(item.fecha).toLocaleDateString()} - {new Date(item.fecha).toLocaleTimeString()}</Text>
                                    </View>
                                )}
                                ListEmptyComponent={<Text style={{textAlign:'center', marginTop:20}}>Aún no tienes pedidos registrados.</Text>}
                            />
                        )}
                        <TouchableOpacity style={[styles.closeBtn, {marginTop: 15}]} onPress={() => setMyOrdersModalVisible(false)}>
                            <Text style={styles.closeBtnText}>Regresar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL CARRITO */}
            <Modal visible={cartModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.orderContent, { width: '95%', maxHeight: '90%' }]}>
                        <Text style={styles.invoiceTitle}>PRE-FACTURA (IVA 15%)</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Producto</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'center' }]}>Bultos</Text>
                            <Text style={[styles.tableHeaderText, { flex: 1, textAlign: 'right' }]}>Total</Text>
                        </View>
                        <FlatList
                            data={cart}
                            keyExtractor={(item, idx) => idx.toString()}
                            renderItem={({ item }) => (
                                <View style={styles.tableRow}>
                                    <Text style={{ flex: 2, fontSize: 12 }}>{item.nombre}</Text>
                                    <Text style={{ flex: 1, textAlign: 'center' }}>{item.bultosSolicitados}</Text>
                                    <Text style={{ flex: 1, textAlign: 'right', fontWeight: 'bold' }}>${item.totalItem.toFixed(2)}</Text>
                                </View>
                            )}
                            ListEmptyComponent={<Text style={styles.emptyCartText}>Carrito vacío</Text>}
                        />
                        {cart.length > 0 && (
                            <View style={styles.invoiceFooter}>
                                <View style={styles.invoiceRow}>
                                    <Text style={styles.boldText}>TOTAL A PAGAR:</Text>
                                    <Text style={styles.totalAmount}>${cart.reduce((acc, i) => acc + i.totalItem, 0).toFixed(2)}</Text>
                                </View>
                                <TouchableOpacity
                                    style={[styles.confirmOrderBtn, isProcessing && { opacity: 0.7 }]}
                                    onPress={finalizarPedidoCompleto}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.confirmOrderText}>Confirmar Pedido 🚀</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        )}
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => setCartModalVisible(false)}>
                            <Text style={{ color: '#666', fontWeight: 'bold' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL LOGIN */}
            <Modal visible={loginModalVisible} animationType="slide" transparent={true}>
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.modalOverlay}>
                    <View style={styles.loginContent}>
                        <Text style={styles.modalTitle}>Acceso Personal</Text>
                        <Text style={styles.loginLabel}>Usuario</Text>
                        <TextInput style={styles.loginInput} placeholder="Tu usuario" value={email} onChangeText={setEmail} autoCapitalize="none" />
                        <Text style={styles.loginLabel}>Contraseña</Text>
                        <TextInput style={styles.loginInput} placeholder="********" value={password} onChangeText={setPassword} secureTextEntry />
                        <TouchableOpacity style={[styles.mainLoginBtn, isLoggingIn && { opacity: 0.7 }]} onPress={handleLogin} disabled={isLoggingIn}>
                            {isLoggingIn ? <ActivityIndicator color="#fff" /> : <Text style={styles.mainLoginBtnText}>Ingresar</Text>}
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.solicitarLink} onPress={solicitarCuenta}>
                            <Text style={styles.solicitarText}>¿No tienes cuenta? Solicítala</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.cancelBtn} onPress={() => { setLoginModalVisible(false); setSelectedProduct(null); }}>
                            <Text style={{ color: '#666' }}>Cerrar</Text>
                        </TouchableOpacity>
                    </View>
                </KeyboardAvoidingView>
            </Modal>

            {/* MODAL FICHA TÉCNICA */}
            <Modal visible={detailModalVisible} animationType="slide" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.detailContent}>
                        <Text style={styles.modalTitle}>Ficha Técnica</Text>
                        {selectedProduct && (
                            <>
                                <Image source={{ uri: getImageUrl(selectedProduct.imagen_url) }} style={styles.modalImg} resizeMode="contain" />
                                <Text style={styles.modalProdName}>{selectedProduct.nombre}</Text>
                                <View style={styles.specGrid}>
                                    <View style={styles.specItem}><Text style={styles.boldText}>Gramaje: </Text><Text>{selectedProduct.gramaje}g</Text></View>
                                    <View style={styles.specItem}><Text style={styles.boldText}>Cuello: </Text><Text>{selectedProduct.rosca}</Text></View>
                                    <View style={styles.specItem}><Text style={styles.boldText}>Unidades/Bulto: </Text><Text>{selectedProduct.embalaje}</Text></View>
                                </View>
                            </>
                        )}
                        <TouchableOpacity style={styles.closeBtn} onPress={() => setDetailModalVisible(false)}>
                            <Text style={styles.closeBtnText}>Regresar</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            {/* MODAL COTIZACIÓN */}
            <Modal visible={orderModalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.orderContent}>
                        <Text style={styles.modalTitle}>Cotización</Text>
                        {selectedProduct && (
                            <ScrollView>
                                <View style={styles.invoiceHeader}>
                                    <Image source={{ uri: getImageUrl(selectedProduct.imagen_url) }} style={styles.smallImg} />
                                    <View>
                                        <Text style={styles.boldText}>{selectedProduct.nombre}</Text>
                                        <Text>Precio Unit: ${parseFloat(selectedProduct.precio).toFixed(3)}</Text>
                                    </View>
                                </View>
                                <View style={styles.inputGroup}>
                                    <Text>Cantidad de Bultos:</Text>
                                    <TextInput 
                                        style={styles.input} 
                                        keyboardType="numeric" 
                                        value={bultos} 
                                        onChangeText={(text) => setBultos(text.replace(/[^0-9]/g, ''))} 
                                    />
                                </View>
                                <View style={styles.invoiceBox}>
                                    <View style={styles.invoiceRow}><Text>Unidades:</Text><Text>{totales.unidades}</Text></View>
                                    <View style={styles.invoiceRow}><Text>Subtotal:</Text><Text>${totales.subtotal.toFixed(2)}</Text></View>
                                    <View style={styles.invoiceRow}><Text>IVA (15%):</Text><Text>${totales.iva.toFixed(2)}</Text></View>
                                    <View style={[styles.invoiceRow, styles.totalRow]}><Text style={styles.boldText}>TOTAL:</Text><Text style={styles.boldText}>${totales.total.toFixed(2)}</Text></View>
                                </View>
                                <TouchableOpacity style={styles.addCartBtn} onPress={() => {
                                    addToCart({ ...selectedProduct, bultosSolicitados: bultos, totalItem: totales.total });
                                    setOrderModalVisible(false);
                                    Alert.alert("Éxito", "Añadido al carrito");
                                }}>
                                    <Text style={styles.addCartText}>Añadir al Carrito 🛒</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.cancelBtn} onPress={() => setOrderModalVisible(false)}>
                                    <Text>Cancelar</Text>
                                </TouchableOpacity>
                            </ScrollView>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
};


// ... (Aquí irían tus estilos/styles)

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f4f6f9' },
    customHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingTop: Platform.OS === 'ios' ? 50 : 40,
        paddingBottom: 15,
        backgroundColor: '#FFFFFF',
        borderBottomWidth: 1,
        borderBottomColor: '#E0E0E0',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
    },
    headerLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    menuButton: { padding: 5, marginRight: 8 },
    menuIcon: { fontSize: 28, color: '#003366', fontWeight: 'bold' },
    headerLogo: { width: 35, height: 35, marginRight: 8 },
    brandTextContainer: { flex: 1 },
    brandTitle: { fontSize: 16, fontWeight: '900', color: '#003366' },
    brandSubtitle: { fontSize: 11, color: '#666', fontWeight: 'bold', marginTop: -2 },
    headerRight: { flexDirection: 'row', alignItems: 'center' },
    loginIconBtn: { backgroundColor: '#003366', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 10 },
    logoutIconBtn: { backgroundColor: '#A52A2A', paddingVertical: 6, paddingHorizontal: 12, borderRadius: 15, marginRight: 10 },
    sessionBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    cartBtn: { padding: 5, position: 'relative' },
    cartEmoji: { fontSize: 24 },
    badge: { position: 'absolute', right: -4, top: -4, backgroundColor: '#FF8C00', borderRadius: 10, width: 18, height: 18, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#FFF' },
    badgeText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
    drawerOverlay: { flex: 1, flexDirection: 'row', backgroundColor: 'rgba(0,0,0,0.5)' },
    drawerCloseArea: { flex: 1 },
    drawerContent: { width: width * 0.75, backgroundColor: '#fff', height: '100%', paddingTop: 50, elevation: 10 },
    drawerHeader: { padding: 20, borderBottomWidth: 1, borderBottomColor: '#eee', backgroundColor: '#f8f9fa' },
    drawerTitle: { fontSize: 22, fontWeight: 'bold', color: '#003366' },
    drawerUser: { fontSize: 14, color: '#666', marginTop: 5 },
    drawerItems: { flex: 1, padding: 10 },
    drawerItem: { paddingVertical: 15, paddingHorizontal: 15, borderRadius: 8, marginBottom: 5 },
    drawerItemText: { fontSize: 16, color: '#333' },
    drawerDivider: { height: 1, backgroundColor: '#eee', marginVertical: 10 },
    filterBarContainer: { marginVertical: 10 },
    filterScroll: { paddingHorizontal: 15 },
    filterBtn: { paddingVertical: 8, paddingHorizontal: 16, backgroundColor: '#fff', marginRight: 10, borderRadius: 20, borderWidth: 1, borderColor: '#ddd' },
    filterBtnActive: { backgroundColor: '#003366', borderColor: '#003366' },
    filterBtnText: { color: '#666', fontWeight: 'bold' },
    filterBtnTextActive: { color: '#fff' },
    listContent: { paddingBottom: 30 },
    card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, marginHorizontal: 15, marginBottom: 15, elevation: 3 },
    productRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    productImage: { width: 80, height: 80, borderRadius: 8 },
    infoContainer: { flex: 1, marginLeft: 15 },
    productTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
    badgeRow: { flexDirection: 'row', marginTop: 5 },
    gramajeBadge: { backgroundColor: '#e3f2fd', padding: 4, borderRadius: 4, color: '#007bff', fontSize: 11, fontWeight: 'bold', marginRight: 5 },
    roscaBadge: { backgroundColor: '#eee', padding: 4, borderRadius: 4, color: '#666', fontSize: 11 },
    priceText: { fontSize: 18, color: '#28a745', fontWeight: 'bold', marginTop: 5 },
    actionButtons: { flexDirection: 'row', justifyContent: 'space-between' },
    detailsBtn: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#FF8C00', borderRadius: 8, marginRight: 5 },
    buyBtn: { flex: 1, padding: 10, alignItems: 'center', backgroundColor: '#003366', borderRadius: 8, marginLeft: 5 },
    detailsBtnText: { color: '#fff', fontWeight: 'bold' },
    buyBtnText: { color: '#fff', fontWeight: 'bold' },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center' },
    successContent: { width: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' },
    loginContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25 },
    loginLabel: { fontWeight: 'bold', color: '#333', marginBottom: 5, marginTop: 15 },
    loginInput: { backgroundColor: '#f9f9f9', borderWidth: 1, borderColor: '#ddd', borderRadius: 10, padding: 12, fontSize: 16 },
    mainLoginBtn: { backgroundColor: '#003366', padding: 15, borderRadius: 10, marginTop: 25, alignItems: 'center' },
    mainLoginBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
    solicitarLink: { marginTop: 20, alignItems: 'center' },
    solicitarText: { color: '#007bff', fontWeight: '600' },
    detailContent: { width: '85%', backgroundColor: '#fff', borderRadius: 20, padding: 25, alignItems: 'center' },
    orderContent: { width: '90%', maxHeight: '80%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
    modalImg: { width: 180, height: 180, marginBottom: 15 },
    modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#003366', marginBottom: 15, textAlign: 'center' },
    modalProdName: { fontSize: 20, fontWeight: 'bold', color: '#003366', marginBottom: 15 },
    specGrid: { width: '100%', marginBottom: 20, borderTopWidth: 1, borderColor: '#eee', paddingTop: 10 },
    specItem: { flexDirection: 'row', marginBottom: 5 },
    closeBtn: { backgroundColor: '#333', padding: 12, borderRadius: 10, width: '100%', alignItems: 'center' },
    closeBtnText: { color: '#fff', fontWeight: 'bold' },
    invoiceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
    smallImg: { width: 50, height: 50, marginRight: 15 },
    inputGroup: { marginBottom: 20 },
    input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 10, marginTop: 5, fontSize: 18, textAlign: 'center' },
    invoiceBox: { backgroundColor: '#f8f9fa', padding: 15, borderRadius: 10, marginBottom: 20 },
    invoiceRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 },
    totalRow: { borderTopWidth: 1, borderColor: '#ddd', paddingTop: 10, marginTop: 5 },
    boldText: { fontWeight: 'bold' },
    addCartBtn: { backgroundColor: '#28a745', padding: 15, borderRadius: 10, alignItems: 'center' },
    addCartText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { alignItems: 'center', marginTop: 15 },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    invoiceTitle: { fontSize: 20, fontWeight: 'bold', color: '#003366', textAlign: 'center' },
    tableHeader: { flexDirection: 'row', backgroundColor: '#eee', padding: 8, borderRadius: 5 },
    tableHeaderText: { fontWeight: 'bold', fontSize: 12 },
    tableRow: { flexDirection: 'row', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
    invoiceFooter: { marginTop: 20, backgroundColor: '#f9f9f9', padding: 15, borderRadius: 10 },
    totalAmount: { fontSize: 20, fontWeight: 'bold', color: '#28a745' },
    confirmOrderBtn: { backgroundColor: '#003366', padding: 15, borderRadius: 10, marginTop: 15, alignItems: 'center', width: '100%' },
    confirmOrderText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
    emptyCartText: { textAlign: 'center', marginVertical: 30, color: '#999', fontSize: 16 },
});

export default CatalogueScreen;