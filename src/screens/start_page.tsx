import React, { useState } from "react";
import { View, Text, TextInput, Button, StyleSheet } from "react-native";
import { useRouter } from "expo-router";
import { useFonts } from "expo-font";

export default function StartScreen() {
    const [fontsLoaded] = useFonts({
        RajdhaniRegular: require("../assets/fonts/Rajdhani-Regular.ttf"),
    });
    const router = useRouter();
    const [rows, setRows] = useState("8");
    const [cols, setCols] = useState("8");
    const [mines, setMines] = useState("10");

    const startGame = () => {
        router.push({
            pathname: "/game",
            params: {
                rows: Number(rows),
                cols: Number(cols),
                mines: Number(mines),
            },
        });
    };

    return (
        <View style={styles.container}>
        <Text style={styles.title}>Minesweeper Setup</Text>
        <Text>Grid Größe (Reihen):</Text>
        <TextInput
            style={styles.input}
            value={rows}
            onChangeText={setRows}
            keyboardType="numeric"
        />
        <Text>Grid Größe (Spalten):</Text>
        <TextInput
            style={styles.input}
            value={cols}
            onChangeText={setCols}
            keyboardType="numeric"
        />
        <Text>Bombenanzahl:</Text>
        <TextInput
            style={styles.input}
            value={mines}
            onChangeText={setMines}
            keyboardType="numeric"
        />
        <Button title="Spiel starten" onPress={startGame} />
        </View>
    );
    }

    const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        textAlign: "center",
        fontWeight: "bold",
        fontFamily: "RajdhaniRegular",
        marginBottom: 20,
    },
    input: {
        borderWidth: 1,
        padding: 10,
        marginVertical: 10,
        borderRadius: 5,
    },
});
