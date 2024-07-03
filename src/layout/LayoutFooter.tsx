import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import IonIcon from "react-native-vector-icons/Ionicons"
import theme from '../theme'
import { Link, useLocation } from 'react-router-native';

const MenuItem = ({ children, to }: { children: any, to: string}) => {
    return (
        <Link to={to} activeOpacity={0.7} underlayColor="none">
            <View style={styles.menuItem}>
                {children}
            </View>
        </Link>
    )
}

export default function LayoutFooter() {
    const { pathname } = useLocation()

    return (
        <View style={styles.containerGrande}>
            <View style={styles.publicidad}>
                <Text>Publicidad</Text>
            </View>
            <View style={styles.container}>
                <MenuItem to="/" >
                        <IonIcon name='calendar-outline' size={30}  color={pathname === "/" ? theme.colors.verdeOscuro : theme.colors.negro}/>
                        <Text>Calendario</Text>
                </MenuItem>
                <MenuItem to="/totals">
                        <IonIcon name='bar-chart-outline' size={30} color={pathname === "/totals" ? theme.colors.verdeOscuro : theme.colors.negro}/>
                        <Text>Totales</Text>
                </MenuItem>
                <MenuItem to="/config">
                        <IonIcon name='settings-outline' size={30} color={pathname === "/config" ? theme.colors.verdeOscuro : theme.colors.negro}/>
                        <Text>Configuración</Text>
                </MenuItem>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    containerGrande: {
        position: "absolute",
        bottom: 0,
        left: 0,
        width: "100%",
    },
    publicidad: {
        alignItems: "center",
        justifyContent: "center",
        height: theme.heigth.publicidad,
        backgroundColor: theme.colors.grisClaro
    },
    container: {
        height: 76,
        backgroundColor: theme.colors.verdeBase,
        flexDirection: "row",
        justifyContent: "space-around",
        paddingVertical: 10
    },
    menuItem: {
        width: 120,
        alignItems: "center"
    },
    icono: {
        margin: 0,
        padding: 0,
        fontSize: 45,
        fontWeight: 'medium',
        color: theme.colors.negro
    }
})
