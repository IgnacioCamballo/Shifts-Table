import React from "react"; 
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import IonIcon from "react-native-vector-icons/Ionicons"
import { useNavigation } from "@react-navigation/native";

import theme from "@/theme/theme";
import useCalendar from "@/hooks/useCalendar";
import { translate } from "@/utils";

type LogoConfigProps = {
  routeName: string
}

export default function LogoConfig({routeName}: LogoConfigProps) {
  const navigation = useNavigation()
  const {lenguage} = useCalendar()

  const handlePress = () => {
    if(routeName === "Config") return
    navigation.reset({index: 0, routes: [{ name: 'Config' as never }]})
  }

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={handlePress}>
      <View style={styles.menuItem}>
        <View 
          style={[
            styles.border, 
            routeName === "Config" ||
            routeName === "NewEmployer" ||
            routeName === "EditEmployer" 
            ? styles.borderBlack : {}
          ]}
        >
          <IonIcon 
            name='settings-outline' 
            size={30}  
            color={
              routeName === "Config" ||
              routeName === "NewEmployer" ||
              routeName === "EditEmployer" 
              ? theme.colors.azulClaro : theme.colors.negro
            }
          />
          <Text style={styles.text}>{translate({text: "settings", lenguage})}</Text>
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
