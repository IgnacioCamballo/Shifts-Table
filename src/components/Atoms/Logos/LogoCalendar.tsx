import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";

import useCalendar from "@/hooks/useCalendar";
import theme from "@/theme/theme";
import { translate } from "@/utils";

type LogoCalendarProps = {
  routeName: string
}

export default function LogoCalendar({routeName}: LogoCalendarProps) {
  const navigation = useNavigation()
  const {lenguage} = useCalendar()

  const handlePress = () => {
    if(routeName === "Calendar") return
    navigation.reset({index: 0, routes: [{ name: 'Calendar' as never }]})
  }
  
  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.menuItem}>
        <View 
          style={[
            styles.border, 
            routeName === "Calendar" || 
            routeName === "Shifts" ||
            routeName === "NewShift" ||
            routeName === "EditShift" 
            ? styles.borderBlack : {}
          ]}
        >
          <IonIcon 
            name='calendar-outline' 
            size={30}  
            color={routeName === "Calendar" || 
            routeName === "Shifts" ||
            routeName === "NewShift" ||
            routeName === "EditShift" 
            ? theme.colors.azulClaro : theme.colors.negro}
          />
          <Text style={styles.text}>{translate({text:"calendar", lenguage})}</Text>
        </View>
      </View>
    </TouchableOpacity>
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
  },
  text: {
    color: theme.colors.negro
  }
})
