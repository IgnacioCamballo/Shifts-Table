import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "react-router-native";
import IonIcon from "react-native-vector-icons/Ionicons"

import theme from "@/theme/theme";
import useCalendar from "@/hooks/useCalendar";
import { translate } from "@/utils";

type LogoTotalsProps = {
  to: string,
  pathName: string
}

export default function LogoTotals({to, pathName}: LogoTotalsProps) {
  const {lenguage} = useCalendar()

  return (
    <Link to={to} activeOpacity={0.7} underlayColor="none">
      <View style={styles.menuItem}>
        <View style={[styles.border, pathName.startsWith("/totals") ? styles.borderBlack : {}]}>
          <IonIcon name='bar-chart-outline' size={30}  color={pathName.startsWith("/totals") ? theme.colors.azulClaro : theme.colors.negro}/>
          <Text>{translate({text: "totals", lenguage})}</Text>
        </View>
      </View>
    </Link>
  )
}

const styles = StyleSheet.create({
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
