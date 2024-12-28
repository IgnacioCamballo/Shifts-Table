import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Platform } from 'react-native';
import theme from '../theme/theme';
import { useLocation } from 'react-router-native';
import useCalendar from '../hooks/useCalendar';
import { translate } from '../utils';

function NombreLayout () {
  const {pathname} = useLocation()
  const {lenguage} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  if(pathname === "/") return translateFn("calendar")
  if(pathname.startsWith("/calendar/shifts/")) return translateFn("shifts")
  if(pathname === "/totals") return translateFn("totals")
  if(pathname.startsWith("/totals/")) return translateFn("totals")
  if(pathname.startsWith("/totalsDetail/")) return translateFn("workedDays")
  if(pathname === "/config") return translateFn("settings")
  if(pathname === "/config/newEmployer") return translateFn("createEmployer")
  if(pathname.startsWith("/config/editEmployer/")) return translateFn("editEmployer")
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