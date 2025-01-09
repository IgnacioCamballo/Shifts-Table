import React from 'react'
import { View, StyleSheet } from 'react-native'
import { useLocation } from 'react-router-native';

import useCalendar from '@/hooks/useCalendar';
import theme from '@/theme/theme'

import LogoCalendar from '@/components/Atoms/Logos/LogoCalendar';
import LogoTotals from '@/components/Atoms/Logos/LogoTotals';
import LogoConfig from '@/components/Atoms/Logos/LogoConfig';

export default function LayoutFooter() {
  const { pathname } = useLocation()
  const { configInfo } = useCalendar()

  return (
    <View style={styles.containerGrande}>
      <View style={[styles.container, { backgroundColor: configInfo.baseColor }]}>
        {!pathname.startsWith("/account") && <>
          <LogoCalendar to='/' pathName={pathname} />
          <LogoTotals to='/totals' pathName={pathname} />
          <LogoConfig to='/config' pathName={pathname} />
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
