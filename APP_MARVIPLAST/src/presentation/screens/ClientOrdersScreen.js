import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';

const ClientOrdersScreen = ({ repository, user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      // Asumiendo que tu repositorio tiene un método para obtener pedidos por ID de cliente
      // Si no lo tiene, luego ajustamos el nombre del método
      const data = await repository.getOrdersByClient(user.id);
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar pedidos:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderOrderItem = ({ item }) => {
    const isDespachado = item.num_factura || item.num_guia;

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Pedido # {item.id_pedido || item.id}</Text>
          <Text style={styles.orderDate}>{item.fecha}</Text>
        </View>

        <View style={styles.statusBadge(isDespachado)}>
          <Text style={styles.statusText}>{isDespachado ? '✅ DESPACHADO' : '⏳ PENDIENTE'}</Text>
        </View>

        {isDespachado ? (
          <View style={styles.detailsContainer}>
            <Text style={styles.detailLabel}>Factura N°: <Text style={styles.detailValue}>{item.num_factura}</Text></Text>
            <Text style={styles.detailLabel}>Guía N°: <Text style={styles.detailValue}>{item.num_guia}</Text></Text>
          </View>
        ) : (
          <Text style={styles.pendingText}>Su pedido está siendo procesado en planta.</Text>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#2E7D32" />
        <Text>Cargando tus pedidos...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={orders}
        keyExtractor={(item) => (item.id_pedido || item.id).toString()}
        renderItem={renderOrderItem}
        ListEmptyComponent={
          <Text style={styles.emptyText}>Aún no has realizado pedidos.</Text>
        }
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 15 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  orderCard: { 
    backgroundColor: '#fff', 
    borderRadius: 10, 
    padding: 15, 
    marginBottom: 15, 
    elevation: 3,
    borderLeftWidth: 5,
    borderLeftColor: '#2E7D32' 
  },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  orderId: { fontWeight: 'bold', fontSize: 16 },
  orderDate: { color: '#888', fontSize: 12 },
  statusBadge: (isDespachado) => ({
    backgroundColor: isDespachado ? '#E8F5E9' : '#FFF3E0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 5,
    alignSelf: 'flex-start',
    marginBottom: 10
  }),
  statusText: { fontWeight: 'bold', fontSize: 12 },
  detailsContainer: { marginTop: 5, borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 },
  detailLabel: { fontSize: 13, color: '#666', marginBottom: 2 },
  detailValue: { color: '#333', fontWeight: 'bold' },
  pendingText: { fontStyle: 'italic', color: '#999', fontSize: 13 },
  emptyText: { textAlign: 'center', marginTop: 50, color: '#999' }
});

export default ClientOrdersScreen;