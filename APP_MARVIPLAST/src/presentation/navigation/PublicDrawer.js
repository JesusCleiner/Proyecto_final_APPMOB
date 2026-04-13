import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import CatalogueScreen from '../screens/CatalogueScreen';

const Drawer = createDrawerNavigator();

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView {...props}>
      <View style={styles.headerContainer}>
        <Image
          source={require('../../../assets/images/logo_marviplast.png')} 
          style={styles.logo} 
        />
        <Text style={styles.companyName}>Marviplast S.A.</Text>
        <Text style={styles.welcomeText}>Bienvenido</Text>
      </View>
      
      {/* Mostramos los items automáticos (Catálogo) */}
      <DrawerItemList {...props} />

      {/* BOTÓN MANUAL: Este botón hará lo mismo que "Hacer Compra" */}
      <DrawerItem
        label="🔐 Iniciar Sesión"
        labelStyle={{ color: '#093969', fontWeight: 'bold' }}
        onPress={() => {
          // Navegamos al catálogo y le pasamos un parámetro para que abra el login
          props.navigation.navigate('CatalogoPublico', { openLogin: true });
        }}
      />
    </DrawerContentScrollView>
  );
}

export default function PublicDrawer({ repository, onLoginSuccess }) {
  return (
    <Drawer.Navigator 
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: '#093766' },
        headerTintColor: '#fff',
      }}
    >
      <Drawer.Screen 
        name="CatalogoPublico" 
        options={{ title: '📦 Catálogo de Productos' }}
      >
        {(props) => (
          <CatalogueScreen 
            {...props} 
            repository={repository} 
            onLoginSuccess={onLoginSuccess} // Le pasamos la función de App.js
          />
        )}
      </Drawer.Screen>
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerContainer: { height: 180, backgroundColor: '#003366', alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  logo: { width: 90, height: 90, resizeMode: 'contain' },
  companyName: { color: '#fff', fontSize: 18, fontWeight: 'bold', marginTop: 10 },
  welcomeText: { color: '#BDC3C7', fontSize: 12 }
});