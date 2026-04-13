import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Text, TextInput, TouchableOpacity, View } from 'react-native';

// Simulamos el componente de Login de Marviplast
const LoginScreenMock = ({ onLogin }) => {
  const [usuario, setUsuario] = React.useState('');
  return (
    <View>
      <TextInput 
        placeholder="Ingrese Usuario" 
        value={usuario} 
        onChangeText={setUsuario} 
      />
      <TouchableOpacity onPress={() => onLogin(usuario)}>
        <Text>ENTRAR</Text>
      </TouchableOpacity>
    </View>
  );
};

describe('Pruebas de Integración - Marviplast', () => {
  test('Debe capturar el usuario "cleiner" y enviarlo al presionar el botón', () => {
    const funcionMock = jest.fn(); // Una función espía
    const { getByPlaceholderText, getByText } = render(
      <LoginScreenMock onLogin={funcionMock} />
    );

    const input = getByPlaceholderText('Ingrese Usuario');
    const boton = getByText('ENTRAR');

    // SIMULACIÓN: El usuario escribe 'cleiner'
    fireEvent.changeText(input, 'cleiner');
    
    // SIMULACIÓN: El usuario presiona el botón ENTRAR
    fireEvent.press(boton);

    // VALIDACIÓN: ¿La función recibió el nombre 'cleiner'?
    expect(funcionMock).toHaveBeenCalledWith('cleiner');
  });
});