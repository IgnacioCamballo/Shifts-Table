import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import Constants from "expo-constants"
import { Platform } from 'react-native';
import theme from '../theme';
import { useLocation, useParams } from 'react-router-native';

function NombreLayout () {
  const {pathname} = useLocation()

  if(pathname === "/") return "Calendario"
  if(pathname.startsWith("/calendar/shifts/")) return "Turnos"
  if(pathname === "/totals") return "Totales"
  if(pathname.startsWith("/totalsDetail/")) return "Días trabajados"
  if(pathname === "/config") return "Configuración"
  if(pathname === "/config/newEmployer") return "Registrar Empleador"
  if(pathname.startsWith("/config/editEmployer/")) return "Editar Empleador"
}

export default function LayoutHeader() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>{NombreLayout()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: Constants.statusBarHeight + 36,
    backgroundColor: theme.colors.verdeBase,
    paddingTop: Platform.OS === "ios" ? Constants.statusBarHeight : Constants.statusBarHeight -5,
    paddingBottom: 10,
    alignItems: "center"
  },
  text: {
    color: theme.colors.grisOscuro,
    fontSize: theme.fontSizes.F20,
    fontWeight: "bold"
  }
})