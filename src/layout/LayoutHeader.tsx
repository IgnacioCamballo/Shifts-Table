import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Platform } from 'react-native';
import { useLocation } from 'react-router-native';

import useCalendar from '@/hooks/useCalendar';
import theme from '@/theme/theme';
import { translate } from '@/utils';

function NombreLayout () {
  const {pathname} = useLocation()
  const {lenguage} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  if(pathname === "/calendar") return translateFn("calendar")
  if(pathname.startsWith("/calendar/shifts/")) return translateFn("shifts")
  if(pathname === "/totals") return translateFn("totals")
  if(pathname.startsWith("/totals/")) return translateFn("totals")
  if(pathname.startsWith("/totalsDetail/")) return translateFn("workedDays")
  if(pathname === "/config") return translateFn("settings")
  if(pathname === "/config/newEmployer") return translateFn("createEmployer")
  if(pathname.startsWith("/config/editEmployer/")) return translateFn("editEmployer")
  if(pathname.startsWith("/account")) return translateFn("account")
}

export default function LayoutHeader() {
  const {configInfo} = useCalendar()
  const { pathname } = useLocation()
  const backgroundColor = pathname === "/" ? theme.colors.blanco : configInfo.baseColor

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <Text style={styles.text}>{NombreLayout()}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === "ios" ? 88 : 36,
    paddingTop: Platform.OS === "ios" ? 52 : 0,
    paddingBottom: 10,
    alignItems: "center",
  },
  text: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F20,
    fontWeight: "bold"
  }
})