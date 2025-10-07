import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, Animated } from 'react-native';
import React, { useState, useRef, useEffect } from "react";

export default function App() {
  const [peso, setpeso] = useState("");
  const [altura, setaltura] = useState("");
  const [resultado, setResultado] = useState(null);
  const [estado, setEstado] = useState("");
  const [error, setError] = useState("");
  const [registros, setRegistros] = useState([]);
  const marcadorAnim = useRef(new Animated.Value(0)).current; // 🔹 animación suave

  const parseInputs = () => {
    setError("");
    let NumAltura = parseFloat(altura);
    const numPeso = parseFloat(peso);

    if (altura === "" || peso === "") {
      setError("Ingresa ambos valores.");
      return null;
    }
    if (Number.isNaN(numPeso) || Number.isNaN(NumAltura)) {
      setError("Los valores deben ser números válidos.");
      return null;
    }

    if (NumAltura > 3) {
      NumAltura = NumAltura / 100;
    }

    return { NumAltura, numPeso };
  };

  const interpretarIMC = (imc) => {
    if (imc < 18.5) return "Bajo peso";
    if (imc < 25) return "Normal";
    if (imc < 30) return "Sobrepeso";
    return "Obesidad";
  };

  const operar = (op) => {
    const parsed = parseInputs();
    if (!parsed) return;
    const { NumAltura, numPeso } = parsed;

    let imc = numPeso / (NumAltura * NumAltura);

    switch (op) {
      case "Hombre":
        imc += 0.5;
        break;
      case "Mujer":
        imc -= 0.5;
        break;
      default:
        break;
    }

    const imcFinal = imc.toFixed(2);
    const estadoIMC = interpretarIMC(imc);
    setResultado(imcFinal);
    setEstado(estadoIMC);

    const fecha = new Date().toLocaleDateString();
    setRegistros([...registros, { id: Date.now().toString(), peso, altura, imc: imcFinal, estado: estadoIMC, fecha }]);

    // 🔹 Animar marcador
    Animated.timing(marcadorAnim, {
      toValue: calcularPosicionIMC(imc),
      duration: 700,
      useNativeDriver: false,
    }).start();
  };

  const colorEstado = (estado) => {
    switch (estado) {
      case "Bajo peso": return "#60a5fa";
      case "Normal": return "#34d399";
      case "Sobrepeso": return "#fbbf24";
      case "Obesidad": return "#f87171";
      default: return "#9ca3af";
    }
  };

  const calcularPosicionIMC = (imc) => {
    // Escala más precisa basada en rangos reales (0–18.5–25–30–40)
    const maxIMC = 40;
    const minIMC = 0;
    const valor = Math.min(Math.max(imc, minIMC), maxIMC);
    return (valor / (maxIMC - minIMC)) * 100;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.titulo}>Calculadora IMC</Text>

      <View style={styles.resultadoBox}>
        {error ? (
          <Text style={styles.error}>{error}</Text>
        ) : resultado !== null ? (
          <>
            <Text style={styles.resultado}>Tu IMC es: {resultado}</Text>
            <Text style={[styles.estado, { color: colorEstado(estado) }]}>
              Estado: {estado}
            </Text>

            {/* 🔹 Medidor gráfico mejorado */}
            <View style={styles.medidorContainer}>
              <View style={styles.barraFondo}>
                {/* Proporciones reales: cada segmento representa su rango */}
                <View style={[styles.segmento, { backgroundColor: "#60a5fa", flex: 18.5 }]} />
                <View style={[styles.segmento, { backgroundColor: "#34d399", flex: 6.5 }]} />
                <View style={[styles.segmento, { backgroundColor: "#fbbf24", flex: 5 }]} />
                <View style={[styles.segmento, { backgroundColor: "#f87171", flex: 10 }]} />
              </View>

              {/* Marcador animado */}
              <Animated.View
                style={[
                  styles.marcador,
                  { left: marcadorAnim.interpolate({
                      inputRange: [0, 100],
                      outputRange: ["0%", "100%"]
                    })
                  },
                ]}
              />
            </View>

            <Text style={styles.etiquetaMedidor}>0 18.5 25 30 40+</Text>
          </>
        ) : (
          <Text style={styles.placeholder}>Ingresa tus datos para calcular</Text>
        )}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu peso en kg (ej. 70)"
        keyboardType="numeric"
        value={peso}
        onChangeText={setpeso}
      />

      <TextInput
        style={styles.input}
        placeholder="Ingresa tu altura en cm (ej.175)"
        keyboardType="numeric"
        value={altura}
        onChangeText={setaltura}
      />

      <View style={styles.botonesRow}>
        <TouchableOpacity style={styles.boton} onPress={() => operar("Hombre")}>
          <Text style={styles.botonTexto}>Hombre</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.boton} onPress={() => operar("Mujer")}>
          <Text style={styles.botonTexto}>Mujer</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subtitulo}>Historial de Registros</Text>
      <FlatList
        style={styles.lista}
        data={registros}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.fila}>
            <Text style={styles.celda}>{item.fecha}</Text>
            <Text style={styles.celda}>Peso: {item.peso}kg</Text>
            <Text style={styles.celda}>Altura: {item.altura}cm</Text>
            <Text style={[styles.celda, { color: colorEstado(item.estado), fontWeight: 'bold' }]}>{item.estado}</Text>
          </View>
        )}
      />

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#6086acff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "bold",
    color: "white",
    marginBottom: 20,
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "white",
    fontSize: 16,
  },
  botonesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  boton: {
    flex: 1,
    backgroundColor: "#0e56e6ff",
    padding: 16,
    margin: 5,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  botonTexto: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  resultadoBox: {
    minHeight: 140,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    marginBottom: 20,
    padding: 12,
  },
  resultado: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
  },
  estado: {
    fontSize: 18,
    marginTop: 6,
  },
  error: {
    color: "red",
    fontWeight: "600",
    fontSize: 16,
  },
  placeholder: {
    color: "#6b7280",
    fontSize: 16,
  },
  subtitulo: {
    fontSize: 20,
    color: "white",
    marginTop: 25,
    marginBottom: 8,
    fontWeight: "600",
  },
  lista: {
    width: "100%",
    backgroundColor: "#f9fafb",
    borderRadius: 10,
    padding: 10,
    maxHeight: 250,
  },
  fila: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderColor: "#e5e7eb",
    paddingVertical: 6,
  },
  celda: {
    fontSize: 14,
    color: "#111827",
  },
  /* 🔵 Estilos del medidor */
  medidorContainer: {
    marginTop: 12,
    width: "90%",
    height: 20,
    position: "relative",
  },
  barraFondo: {
    flexDirection: "row",
    width: "100%",
    height: "100%",
    borderRadius: 10,
    overflow: "hidden",
  },
  segmento: {
    height: "100%",
  },
  marcador: {
    position: "absolute",
    top: -6,
    width: 2,
    height: 32,
    backgroundColor: "black",
  },
  etiquetaMedidor: {
    marginTop: 4,
    color: "#374151",
    fontSize: 13,
    letterSpacing: 3,
  },
});
