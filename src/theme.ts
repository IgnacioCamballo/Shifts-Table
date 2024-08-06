import { ThemeProvider } from "@react-navigation/native"
import { Dimensions } from "react-native"
import Constants from "expo-constants"

let screenHeight = Dimensions.get("window").height

const theme = {
    colors: {
        verdeBase: "#517481",
        verdeOscuro: "#3D5B0D",
        verdeMedio: "#AFD839",
        verdeBoton: "#6CAE75",
        negro: "#000",
        gris: "grey",
        grisOscuro: "#343434",
        grisMedio: "#BABABA",
        grisClaro: "#D2D2D2",
        grisMasClaro: "#e1e1e1",
        blanco: "fff",
        rojoBin: "#A30000",
        rojo: "red",
        rojoClaro: "#EA7E7E",
        azulClaro: "#6392A3"
    },
    fontSizes: {
        F20: 20,
        F18: 18,
        F16: 16,
        F14: 14,
        F12: 12,
        F10: 10,
    },
    heigth: {
        publicidad: 80,
        daysContainer: (screenHeight - Constants.statusBarHeight - 194)/6,
        configScrollView: (screenHeight - Constants.statusBarHeight - 440),
        shiftScrollView: (screenHeight - Constants.statusBarHeight - 220),
        monthDetailScrollView: (screenHeight - Constants.statusBarHeight - 260)
    }
}

export default theme