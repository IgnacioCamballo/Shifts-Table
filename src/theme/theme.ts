import { Dimensions, Platform, StatusBar } from "react-native"

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
        screenHeight: Dimensions.get("screen").height,
        bottomSystemBar: Platform.OS === 'android' ? Math.max(Dimensions.get("screen").height - Dimensions.get("window").height - (StatusBar.currentHeight || 0), 0) : 0,
        daysContainer: Platform.OS === 'ios' ? 234 : 315,
        daysContainerPremium: Platform.OS === 'ios' ? 170 : 245,
        shiftScrollView: 300,
        shiftScrollViewPremium: Platform.OS === 'ios' ? 200 : 270,
        monthDetailScrollView: Platform.OS === 'ios' ? 340 : 440,
        monthDetailScrollViewPremium: Platform.OS === 'ios' ? 280 : 370,
        shiftNewEditScrollView: 230,
        noFooterNoHeader: Platform.OS === 'ios' ? 80 : 150
    },
    banners: {
      calendar: "ca-app-pub-4926030013898312/2502969552",
      detail: "ca-app-pub-4926030013898312/4565563096",
      shifts: "ca-app-pub-4926030013898312/8504808104",
      totals: "ca-app-pub-4926030013898312/7191726433",
      intersticial: "ca-app-pub-4926030013898312/8353147676"

        // the bottom ones are test ads
      // calendar: "ca-app-pub-3940256099942544/9214589741",
      // detail: "ca-app-pub-3940256099942544/9214589741",
      // shifts: "ca-app-pub-3940256099942544/9214589741",
      // totals: "ca-app-pub-3940256099942544/9214589741",
      // intersticial: "ca-app-pub-3940256099942544/1033173712"
    }
}

export default theme