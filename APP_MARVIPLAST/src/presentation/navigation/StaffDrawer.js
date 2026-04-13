import React from 'react';
import { View, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer';

const Drawer = createDrawerNavigator();

// Componente para el encabezado del vendedor
function CustomStaffDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={[styles.headerContainer, { backgroundColor: '#CC5500' }]}> 
        <Image source={require('../../../assets/images/logo_marviplast.png')} style={styles.logo} />
        <Text style={styles.companyName}>Panel de Ventas</Text>
        <Text style={styles.userName}>{props.userName || 'Vendedor Marviplast'}</Text>
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

export default function StaffDrawer({ onLogout, user }) {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => (
        <CustomStaffDrawerContent 
          {...props} 
          onLogout={onLogout} 
          userName={user?.razonSocial || user?.username} 
        />
      )}
      screenOptions={{
        headerStyle: { backgroundColor: '#CC5500' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen name="BandejaEntrada" options={{ title: '📥 Bandeja de Pedidos' }}>
        {(props) => (
          <View style={styles.centered}>
            <Text style={styles.title}>Pedidos Pendientes</Text>
            <Text>Aquí aparecerán los pedidos para dar de baja (Factura/Guía)</Text>
          </View>
        )}
      </Drawer.Screen>
      
      <Drawer.Screen name="HistorialDespachos" options={{ title: '✅ Historial Despachos' }}>
        {(props) => (
          <View style={styles.centered}>
            <Text>Consulta de pedidos ya facturados</Text>
          </View>
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: { height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logo: { width: 70, height: 70, resizeMode: 'contain' },
  companyName: { color: '#fff', fontSize: 16, fontWeight: 'bold', marginTop: 5 },
  userName: { color: '#E0E0E0', fontSize: 12 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  logoutButton: { marginTop: 20, padding: 20, borderTopWidth: 1, borderTopColor: '#ccc' },
  logoutText: { color: 'red', fontWeight: 'bold' }
});