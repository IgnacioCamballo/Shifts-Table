import React, { useEffect, useRef, useState } from 'react'
import { Text, ScrollView, StyleSheet, View, Animated} from 'react-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
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

export default function Shifts() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[1].params as { date: string }
  const pressedDate = params.date

  const {shifts, lenguage, addsInitialized, configInfo, userInfo, setAnimateReturnToCalendar} = useCalendar()
  
  //gets variable heigth for the screen without statusbar
  const insets = useSafeAreaInsets()
  const shiftsViewHeight = theme.heigth.screenHeight - insets.top - Math.max(insets.bottom, theme.heigth.bottomSystemBar) - (userInfo.premium ? theme.heigth.shiftScrollViewPremium : theme.heigth.shiftScrollView)

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
      <SwiftArrows 
        leftAction={prevDay} 
        text={`${firstLetterUpper(date.toLocaleDateString(lenguage, {month: 'short'}))} / ${date.toLocaleDateString(lenguage, {day:"numeric"})} (${textDay(date, lenguage)})`}
        rightAction={nextDay} 
      />

      <Button margintop={12} onPress={() => navigation.navigate('NewShift', { date: date.toISOString() })} color={configInfo.buttonsColor}>
        <Text style={styles.textoBoton}>{translateFn("createNewShift")}</Text>
      </Button>

      <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollView, {maxHeight: shiftsViewHeight}]}>
        {shifts.length === 0 ? <View></View> : 
          shifts.filter(shift => shift.shiftEntry.getFullYear() === date.getFullYear() && shift.shiftEntry.getMonth() === date.getMonth() && shift.shiftEntry.getDate() === date.getDate())
          .map(
            (mapedShift: ShiftProps) => <Shift shift={mapedShift} key={mapedShift.key}/>
          )
        }

      </ScrollView>
        {!userInfo.premium && <BannerPremium style={styles.bannerPremium}/>}

      {!userInfo.premium && addsInitialized && (
        <View style={styles.banner}>
        <BannerAd 
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          unitId={theme.banners.shifts}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true
          }}
          />
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: theme.colors.blanco,
  },
  scrollView: {
    position: "relative",
    marginTop: 16,
    overflow: "hidden",
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500",
    color: theme.colors.negro,    
  },
  banner:{
    height: 70, 
    position: 'absolute',
    justifyContent: "center", 
    alignContent: "center", 
    bottom: 80
  },
  bannerPremium: {
    alignSelf: "flex-end",
    marginBottom: 140,
    left: 10
  }
})