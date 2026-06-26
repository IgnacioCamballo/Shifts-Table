import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";

import theme from "@/theme/theme";
import useCalendar from "@/hooks/useCalendar";
import { translate } from "@/utils";

type LogoTotalsProps = {
  routeName: string
}

export default function LogoTotals({routeName}: LogoTotalsProps) {
  const navigation = useNavigation()
  const {lenguage} = useCalendar()

  const handlePress = () => {
    if(routeName === "Totals") return
    navigation.reset({index: 0, routes: [{ name: 'Totals' as never, params: { month: new Date().toString() } }]})
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.menuItem}>
        <View 
          style={[
            styles.border, 
            routeName === "Totals" || routeName === "MonthDetail" ? styles.borderBlack : {}
          ]}
        >
          <IonIcon 
            name='bar-chart-outline' 
            size={30}  
            color={(routeName === "Totals" || routeName === "MonthDetail") ? theme.colors.azulClaro : theme.colors.negro}/>
          <Text>{translate({text: "totals", lenguage})}</Text>
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
  }
})
