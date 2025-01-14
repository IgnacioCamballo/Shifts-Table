import { Dimensions } from "react-native"
import Constants from "expo-constants"

let screenHeight = Dimensions.get("window").height

const theme = {
    colors: {
        verdeBase: "#3C819A",
        verdeOscuro: "#3D5B0D",
        verdeMedio: "#AFD839",
        verdeBoton: "#6CAE75",
        negro: "#000",
        gris: "grey",
        grisOscuro: "#343434",
        grisMedio: "#BABABA",
        grisClaro: "#D2D2D2",
        grisMasClaro: "#e1e1e1",
        blanco: "#fff",
        rojoBin: "#A30000",
        rojo: "red",
        rojoClaro: "#EA7E7E",
        azulClaro: "#C9DDE0",
        slider: "#397B63"
    },
    fontSizes: {
        F24: 24,
        F20: 20,
        F18: 18,
        F16: 16,
        F14: 14,
        F12: 12,
        F10: 10,
    },
    heigth: {
        publicidad: 80,
        daysContainer: (screenHeight - Constants.statusBarHeight - 265)/6,
        configScrollView: (screenHeight - Constants.statusBarHeight - 540),
        shiftScrollView: (screenHeight - Constants.statusBarHeight - 300),
        monthDetailScrollView: (screenHeight - Constants.statusBarHeight - 340),
        shiftNewEditScrollView: (screenHeight - Constants.statusBarHeight - 200),
        noFooterNoHeader: (screenHeight - Constants.statusBarHeight - 110)
    },
    banners: {
        // calendar: "ca-app-pub-4926030013898312/2502969552",
        // detail: "ca-app-pub-4926030013898312/4565563096",
        // shifts: "ca-app-pub-4926030013898312/8504808104",
        // totals: "ca-app-pub-4926030013898312/7191726433"
        // the bottom ones are test ads
         calendar: "ca-app-pub-3940256099942544/9214589741",
         detail: "ca-app-pub-3940256099942544/9214589741",
         shifts: "ca-app-pub-3940256099942544/9214589741",
         totals: "ca-app-pub-3940256099942544/9214589741"
    }
}

export default theme