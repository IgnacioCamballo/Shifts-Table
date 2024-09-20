import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import { Navigate } from "react-router-native"
import useCalendar from "../../hooks/useCalendar"
import { DayProps } from "../../types"
import theme from "../../theme/theme"
import { Dimensions } from "react-native"

type RenderDayCalendarProps = {
  item : DayProps,
  currentDay: Date,
  pressedDate: Date,
  nav: boolean,
  onPress: (key: string) => void
}

let screenWidth = Dimensions.get("window").width

export default function RenderDayCalendar({item, currentDay, pressedDate, nav, onPress}: RenderDayCalendarProps) {
  const {shifts, companysInfo} = useCalendar()

  const {day, key, isCurrentDay, shadowed} = item

  const date = new Date(currentDay.getFullYear(), currentDay.getMonth(), day)

  const colorShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === date.getFullYear() && shift.shiftEntry.getMonth() === date.getMonth() && shift.shiftEntry.getDate() === date.getDate())

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      key={key}
      onPress={() => onPress(key)}
    >
      <View style={shadowed ? styles.dayContainerEmpty : styles.dayContainer}>
        {nav && <Navigate to={`/calendar/shifts/${pressedDate}`}/>}
        {shadowed === true ? <View></View> : colorShifts.map(shiftColor => 
          <View key={shiftColor.key} style={[styles.coloredShiftBox, {backgroundColor: companysInfo.some(employer => employer.key === shiftColor.employer) ? companysInfo.find(employer => employer.key === shiftColor.employer)!.color : shiftColor.color}]}>
            <Text style={styles.coloredShiftText}>{companysInfo.some(employer => employer.key === shiftColor.employer) ? companysInfo.find(employer => employer.key === shiftColor.employer)!.short : shiftColor.short}</Text>
          </View>
        )}
        <Text style={shadowed ? styles.emptyDayText : [styles.dayText, isCurrentDay && styles.selectedDayText]}>{day.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  dayContainer: {
    height: theme.heigth.daysContainer,
    width: (screenWidth - 20)/7,
    borderColor: theme.colors.negro,
    borderWidth: 0.5
  },
  dayContainerEmpty: {
    width: (screenWidth - 20)/7,
    height: theme.heigth.daysContainer,
    backgroundColor: theme.colors.grisMasClaro,
    borderColor: theme.colors.gris,
    borderWidth: 0.5    
  },
  dayText: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: theme.fontSizes.F12
  },
  emptyDayText: {
    position: "absolute",
    top: 1,
    right: 3,
    fontSize: theme.fontSizes.F12,
    color: theme.colors.gris
  },
  selectedDayText: {
    color: theme.colors.rojo,
  },
  coloredShiftBox: {
    flex:1,
    alignItems: "center",
    justifyContent: "center",
    borderTopColor: theme.colors.gris,
    borderBottomColor: theme.colors.gris,
    borderTopWidth:0.5,
    borderBottomWidth: 0.5
  },
  coloredShiftText: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F18,
    fontWeight: "400"
  }
})