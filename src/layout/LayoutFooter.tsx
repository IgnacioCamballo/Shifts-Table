import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useNavigationState } from '@react-navigation/native'

import useCalendar from '@/hooks/useCalendar';
import theme from '@/theme/theme'
import { getRouteName } from '@/utils';

import LogoCalendar from '@/components/Atoms/Logos/LogoCalendar';
import LogoTotals from '@/components/Atoms/Logos/LogoTotals';
import LogoConfig from '@/components/Atoms/Logos/LogoConfig';

export default function LayoutFooter() {
const routeName = getRouteName()

  const { configInfo } = useCalendar()
  const backgroundColor = routeName === "LoadingPage" ? theme.colors.blanco : configInfo.baseColor
  return (
    <View style={styles.containerGrande}>
      <View style={[styles.container, { backgroundColor }]}>
        { routeName === "LoadingPage" ||
          routeName === "SelectLenguage" ||
          routeName === "AccountIntro" ||
          routeName === "Login" ||
          routeName === "PassRecover" ||
          routeName === "CreateAccount" ||
          routeName === "PrePurchaseLogin" ||
          routeName === "DeleteAccount"
          ? <></> : <>
          <LogoCalendar routeName={routeName} />
          <LogoTotals routeName={routeName} />
          <LogoConfig routeName={routeName} />
        </>}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  containerGrande: {
    position: "absolute",
    bottom: 0,
    left: 0,
    width: "100%",
  },
  publicidad: {
    alignItems: "center",
    justifyContent: "center",
    height: theme.heigth.publicidad,
    backgroundColor: theme.colors.grisClaro
  },
  container: {
    height: 76,
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 10
  }
})
