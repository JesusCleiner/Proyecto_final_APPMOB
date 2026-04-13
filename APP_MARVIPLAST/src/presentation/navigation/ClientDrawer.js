import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

// Solo importamos el Catálogo, ya que todo vive ahí dentro ahora
import CatalogueScreen from '../screens/CatalogueScreen';

const Drawer = createDrawerNavigator();

function CustomClientDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={[styles.headerContainer, { backgroundColor: '#2E7D32' }]}> 
        <Image source={require('../../../assets/images/logo_marviplast.png')} style={styles.logo} />
        <Text style={styles.companyName}>Área de Clientes</Text>
        <Text style={styles.userName}>{props.userName || 'Cliente Marviplast'}</Text>
      </View>
      
      <DrawerItemList {...props} />

      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={() => props.onLogout()}
      >
        <Text style={styles.logoutText}>Cerrar Sesión</Text>
      </TouchableOpacity>
    </DrawerContentScrollView>
  );
}

export default function ClientDrawer({ repository, onLogout, user }) {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => (
        <CustomClientDrawerContent 
          {...props} 
          onLogout={onLogout} 
          userName={user?.razonSocial} 
        />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: '#2E7D32' },
        headerTintColor: '#fff',
      }}
    >
      {/* 1. REALIZAR PEDIDO / CATÁLOGO */}
      <Drawer.Screen name="RealizarPedido" options={{ title: '🛒 Realizar Pedido' }}>
        {(props) => <CatalogueScreen {...props} repository={repository} user={user} initialView="catalogo" />}
      </Drawer.Screen>
      
      {/* 2. MIS PEDIDOS - Ahora apunta a CatalogueScreen pasándole un parámetro */}
      <Drawer.Screen name="MisPedidos" options={{ title: '📦 Mis Pedidos' }}>
        {(props) => <CatalogueScreen {...props} repository={repository} user={user} initialView="pedidos" />}
      </Drawer.Screen>

      {/* 3. MIS DATOS - Ahora apunta a CatalogueScreen pasándole un parámetro */}
      <Drawer.Screen name="MisDatos" options={{ title: '👤 Mis Datos' }}>
        {(props) => <CatalogueScreen {...props} repository={repository} user={user} initialView="perfil" />}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: { height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logo: { width: 80, height: 80, resizeMode: 'contain' },
  companyName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 10 },
  userName: { color: '#E0E0E0', fontSize: 12, marginTop: 2 },
  logoutButton: { marginTop: 20, padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' },
  logoutText: { color: 'red', fontWeight: 'bold' }
});