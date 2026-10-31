import React, { useEffect, useRef, useState } from 'react'
import { Text, ScrollView, StyleSheet, View } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList, ShiftProps } from '@/types'
import { firstLetterUpper, textDay, translate } from '@/utils'
import theme from '@/theme/theme'

import Shift from '@/components/Molecules/Shift'
import SwiftArrows from '@/components/Molecules/SwiftArrows'
import Button from '@/components/Atoms/Buttons/Button'
import BannerPremium from '@/components/Atoms/Buttons/BannerPremium'
import { BannerAdds } from '@/components/Atoms/BannerAdds'

export default function Shifts() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[1].params as { date: string }
  const pressedDate = params.date

  const {shifts, lenguage, addsInitialized, configInfo, userInfo, setAnimateReturnToCalendar} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  const [date, setDate] = useState(new Date(pressedDate))
  const allowNativeGoBackRef = useRef(false)


  const prevDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    setDate(newDate)
  };
  
  const nextDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    setDate(newDate)
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (allowNativeGoBackRef.current) {
        allowNativeGoBackRef.current = false
        return
      }

      event.preventDefault()

        setAnimateReturnToCalendar(true)
        allowNativeGoBackRef.current = true
        navigation.dispatch(event.data.action)
    })

    return unsubscribe
  }, [navigation, setAnimateReturnToCalendar])

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <SwiftArrows
          leftAction={prevDay}
          text={`${firstLetterUpper(date.toLocaleDateString(lenguage, {month: 'short'}))} / ${date.toLocaleDateString(lenguage, {day:"numeric"})} (${textDay(date, lenguage)})`}
          rightAction={nextDay}
        />

        <Button margintop={12} onPress={() => navigation.navigate('NewShift', { date: date.toISOString() })} color={configInfo.buttonsColor}>
          <Text style={styles.textoBoton}>{translateFn("createNewShift")}</Text>
        </Button>
      </View>

      {/* takes the space left between the button and the ad. The content is at least as tall as it, so the
      premium banner sits at its bottom (right above the ad) and, with enough shifts, it is pushed down and needs scroll */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        style={styles.scrollView}
        contentContainerStyle={[styles.scrollContent, userInfo.premium && styles.scrollContentPremium]}
      >
        <View style={styles.shifts}>
          {shifts.length === 0 ? <View></View> :
            shifts.filter(shift => shift.shiftEntry.getFullYear() === date.getFullYear() && shift.shiftEntry.getMonth() === date.getMonth() && shift.shiftEntry.getDate() === date.getDate())
            .map(
              (mapedShift: ShiftProps) => <Shift shift={mapedShift} key={mapedShift.key}/>
            )
          }
        </View>

        {!userInfo.premium && <BannerPremium />}
      </ScrollView>

      {!userInfo.premium && addsInitialized && <BannerAdds />}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    //footer is absolute, so the margin makes the screen end where the footer starts
    marginBottom: theme.heigth.footer,
    backgroundColor: theme.colors.blanco,
  },
  top: {
    padding: 10,
    paddingBottom: 0
  },
  scrollView: {
    flex: 1,
    position: "relative",
    marginTop: 16,
    overflow: "hidden",
  },
  scrollContent: {
    flexGrow: 1
  },
  scrollContentPremium: {
    paddingBottom: 10
  },
  shifts: {
    flexGrow: 1,
    paddingHorizontal: 10
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    color: theme.colors.negro,    
  }
})