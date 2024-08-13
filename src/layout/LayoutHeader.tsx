import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Platform } from 'react-native';
import theme from '../theme/theme';
import { useLocation } from 'react-router-native';
import translations from "../lenguages/lenguages.json"
import useCalendar from '../hooks/useCalendar';

function NombreLayout () {
  const {pathname} = useLocation()
  const {lenguage} = useCalendar()

  if(pathname === "/") return translations.calendar.find(i => i.lenguage === lenguage)?.text
  if(pathname.startsWith("/calendar/shifts/")) return translations.shifts.find(i => i.lenguage === lenguage)?.text
  if(pathname === "/totals") return translations.totals.find(i => i.lenguage === lenguage)?.text
  if(pathname.startsWith("/totals/")) return translations.totals.find(i => i.lenguage === lenguage)?.text
  if(pathname.startsWith("/totalsDetail/")) return translations.workedDays.find(i => i.lenguage === lenguage)?.text
  if(pathname === "/config") return translations.settings.find(i => i.lenguage === lenguage)?.text
  if(pathname === "/config/newEmployer") return translations.createEmployer.find(i => i.lenguage === lenguage)?.text
  if(pathname.startsWith("/config/editEmployer/")) return translations.editEmployer.find(i => i.lenguage === lenguage)?.text
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
    height: 36,
    backgroundColor: theme.colors.verdeBase,
    paddingTop: Platform.OS === "ios" ? 5 : 0,
    paddingBottom: 10,
    alignItems: "center",
  },
  text: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F20,
    fontWeight: "bold"
  }
})