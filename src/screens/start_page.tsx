import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Image, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";
import Button from "../components/button";

export default function StartScreen() {
    const [fontsLoaded] = useFonts({
        RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
    });
    const router = useRouter();
    const [rows, setRows] = useState("8");
    const [cols, setCols] = useState("8");
    const [mines, setMines] = useState("10");

    const startGame = () => {
        router.push(`/game?rows=${rows}&cols=${cols}&mines=${mines}`);
    };

    return (
      <View style={styles.container}>
        <Image
          source={require("../assets/images/logo.png")}
          style={styles.image}
          resizeMode="contain"
        />
         <View style={styles.container_a}>
            <Text style={styles.label}>Grid Größe (Reihen max. 22):</Text>
            <TextInput
            style={styles.input}
            value={rows}
            onChangeText={setRows}
            keyboardType="numeric"
            placeholder="8"
            />
            <Text style={styles.label}>Grid Größe (Spalten max. 13):</Text>
            <TextInput
            style={styles.input}
            value={cols}
            onChangeText={setCols}
            keyboardType="numeric"
            placeholder="8"
            />
            <Text style={styles.label}>Bombenanzahl:</Text>
            <TextInput
            style={styles.input}
            value={mines}
            onChangeText={setMines}
            keyboardType="numeric"
            placeholder="10"
            />
        </View>
        <Button style={styles.button} title="Spiel starten" onPress={startGame} />
      </View>
    );
    }

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        padding: 20,
        justifyContent: "space-between", // Oben und unten platzieren
        alignItems: "center",
      },
      container_a: {
        flex: 1,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "grey",
        justifyContent: "center", // Oben und unten platzieren
        padding: 20,
      },
      image: {
        width: "100%",
      },
      title: {
        fontSize: 32,
        fontWeight: "bold",
        color: "#fff",
        marginBottom: 20,
      },
      label: {
        alignSelf: "flex-start",
        fontSize: 16,
        marginVertical: 5,
      },
      input: {
        width: "100%",
        borderRadius: 8,
        borderWidth: 1,
        borderColor: "grey",
        padding: 10,
        marginBottom: 15,
        fontSize: 16,
      },
      button: {
        width: "100%",
        alignSelf: "flex-end", // horizontale Ausrichtung, nicht vertikal
      },
    });
