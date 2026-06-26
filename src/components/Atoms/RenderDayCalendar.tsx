import React from "react"
import { TouchableOpacity, View, Text, StyleSheet } from "react-native"
import { Dimensions } from "react-native"
import Icon from 'react-native-vector-icons/AntDesign';
import Icon2 from 'react-native-vector-icons/FontAwesome';
import { useSafeAreaInsets } from "react-native-safe-area-context";

import useCalendar from "@/hooks/useCalendar"
import { DayProps } from "@/types"
import theme from "@/theme/theme"

type RenderDayCalendarProps = {
  item : DayProps,
  currentDay: Date,
  onPress: (key: string) => void
}

let screenWidth = Dimensions.get("window").width
const containerWidth = (screenWidth - 22)/7

export default function RenderDayCalendar({item, currentDay, onPress}: RenderDayCalendarProps) {
  const {shifts, companysInfo, userInfo} = useCalendar()

  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const dayContainerHeight = (theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - (userInfo.premium ? theme.heigth.daysContainerPremium : theme.heigth.daysContainer)) / 6

  const {day, key, isCurrentDay, shadowed} = item

  const date = new Date(currentDay.getFullYear(), currentDay.getMonth(), day)

  const colorShifts = shifts.filter(shift => shift.shiftEntry.getFullYear() === date.getFullYear() && shift.shiftEntry.getMonth() === date.getMonth() && shift.shiftEntry.getDate() === date.getDate())

  return (
    <TouchableOpacity
      activeOpacity={0.95}
      key={key}
      onPress={() => onPress(key)}
    >
      <View style={[shadowed ? styles.dayContainerEmpty : styles.dayContainer, {height: dayContainerHeight}]}>
        {shadowed === true ? <View></View> : colorShifts.map(shiftColor => 
          <View 
            key={shiftColor.key} 
            style={[styles.coloredShiftBox, {backgroundColor: companysInfo.find(employer => employer.key === shiftColor.employer)?.color || shiftColor.color}]}
          >
            <Text style={styles.coloredShiftText}>{companysInfo.some(employer => employer.key === shiftColor.employer) ? companysInfo.find(employer => employer.key === shiftColor.employer)!.short : shiftColor.short}</Text>
            
            {shiftColor.paid &&
              <Icon2
                name="money"
                size={10}
                style={styles.bill}
              />
            }

            {shiftColor.note && 
              <Icon
                name="tagso"
                size={12}
                style={[styles.tag, !shiftColor.paid && {left: 3}]}
              />
            }
          </View>
        )}
        <Text style={shadowed ? styles.emptyDayText : [styles.dayText, isCurrentDay && styles.selectedDayText]}>{day.toLocaleString()}</Text>
      </View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  dayContainer: {
    width: containerWidth,
    borderColor: theme.colors.negro,
    borderWidth: 0.5
  },
  dayContainerEmpty: {
    width: containerWidth,
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
    position: "relative",
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopColor: theme.colors.gris,
    borderBottomColor: theme.colors.gris,
    borderTopWidth: 0.5,
    borderBottomWidth: 0.5
  },
  coloredShiftText: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F18,
    fontWeight: "400"
  },
  tag: {
    position: "absolute",
    top: 0,
    left: 18
  },
  bill: {
    position: "absolute",
    top: 1,
    left: 4
  }
})