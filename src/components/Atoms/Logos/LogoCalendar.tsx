import { View, Text, StyleSheet } from "react-native";
import { Link } from "react-router-native";
import IonIcon from "react-native-vector-icons/Ionicons"
import theme from "../../../theme/theme";

type LogoCalendarProps = {
  to: string,
  pathName: string
}

export default function LogoCalendar({to, pathName}: LogoCalendarProps) {
  return (
    <Link to={to} activeOpacity={0.7} underlayColor="none">
      <View style={styles.menuItem}>
        <View style={[styles.border, pathName === "/" || pathName.startsWith("/calendar") ? styles.borderBlack : {}]}>
          <IonIcon name='calendar-outline' size={30}  color={pathName === "/" || pathName.startsWith("/calendar") ? theme.colors.azulClaro : theme.colors.negro}/>
          <Text>Calendario</Text>
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
