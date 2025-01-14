import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Link } from "react-router-native";
import IonIcon from "react-native-vector-icons/Ionicons"

import useCalendar from "@/hooks/useCalendar";
import theme from "@/theme/theme";
import { translate } from "@/utils";

type LogoCalendarProps = {
  to: string,
  pathName: string
}

export default function LogoCalendar({to, pathName}: LogoCalendarProps) {
  const {lenguage} = useCalendar()
  
  return (
    <Link to={to} activeOpacity={0.7} underlayColor="none">
      <View style={styles.menuItem}>
        <View style={[styles.border, pathName === "/calendar" || pathName.startsWith("/calendar") ? styles.borderBlack : {}]}>
          <IonIcon name='calendar-outline' size={30}  color={pathName.startsWith("/calendar") ? theme.colors.azulClaro : theme.colors.negro}/>
          <Text>{translate({text:"calendar", lenguage})}</Text>
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
