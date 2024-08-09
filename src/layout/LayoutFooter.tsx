import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import IonIcon from "react-native-vector-icons/Ionicons"
import theme from '../theme/theme'
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
            {/* <View style={styles.publicidad}>
                <Text>Publicidad</Text>
            </View> */}

            <View style={styles.container}>
                <MenuItem to="/" >
                    <View style={[styles.border, pathname === "/" || pathname.startsWith("/calendar") ? styles.borderBlack : {}]}>
                        <IonIcon name='calendar-outline' size={30}  color={pathname === "/" || pathname.startsWith("/calendar") ? theme.colors.azulClaro : theme.colors.negro}/>
                        <Text>Calendario</Text>
                    </View>
                </MenuItem>
                <MenuItem to="/totals">
                    <View style={[styles.border, pathname.startsWith("/totals") ? styles.borderBlack : {}]}>
                        <IonIcon name='bar-chart-outline' size={30} color={pathname.startsWith("/totals") ? theme.colors.azulClaro : theme.colors.negro}/>
                        <Text>Totales</Text>
                    </View>
                </MenuItem>
                <MenuItem to="/config">                   
                    <View style={[styles.border, pathname.startsWith("/config") ? styles.borderBlack : {}]}>
                        <IonIcon name='settings-outline' size={30} color={pathname.startsWith("/config") ? theme.colors.azulClaro : theme.colors.negro}/>
                        <Text>Configuración</Text>
                    </View>
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
        alignItems: "center",
    },
    border:{
        alignItems: "center",
    },
    borderBlack: {
        borderBottomColor: theme.colors.negro,
        borderBottomWidth: 1    
    },
    icono: {
        margin: 0,
        padding: 0,
        fontSize: 45,
        fontWeight: 'medium',
        color: theme.colors.negro
    }
})
