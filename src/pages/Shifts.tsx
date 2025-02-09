import React, { useState } from 'react'
import { Text, ScrollView, StyleSheet, View} from 'react-native'
import { useParams } from 'react-router-native'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import Icon from 'react-native-vector-icons/AntDesign'

import useCalendar from '@/hooks/useCalendar'
import { ShiftProps } from '@/types'
import { firstLetterUpper, textDay, translate } from '@/utils'
import theme from '@/theme/theme'

import Shift from '@/components/Molecules/Shift'
import SwiftArrows from '@/components/Molecules/SwiftArrows'
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent'
import Button from '@/components/Atoms/Buttons/Button'
import BannerPremium from '@/components/Atoms/Buttons/BannerPremium'

export default function Shifts() {
  const params = useParams()
  const pressedDate = params.date!

  const {shifts, lenguage, addsInitialized, configInfo, userInfo} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  const [date, setDate] = useState(new Date(pressedDate))

  const prevDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() - 1);
    setDate(newDate)
  };
  
  const nextDay = () => {
    const newDate = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    setDate(newDate)
  };

  return (
    <View style={styles.container}>
      <TransparentButton link="/calendar" style={styles.link}>
        <Icon 
          name="doubleleft" 
          color={theme.colors.negro} 
          size={17}
        />
        <Text style={styles.textLine}>{translateFn("back")}</Text>
      </TransparentButton>

      <SwiftArrows 
        leftAction={prevDay} 
        text={`${firstLetterUpper(date.toLocaleDateString(lenguage, {month: 'short'}))} / ${date.toLocaleDateString(lenguage, {day:"numeric"})} (${textDay(date, lenguage)})`}
        rightAction={nextDay} 
      />

      <Button margintop={12} to={`/calendar/shifts/${date}/newShift`} color={configInfo.buttonsColor}>
        <Text style={styles.textoBoton}>{translateFn("createNewShift")}</Text>
      </Button>

      <ScrollView showsVerticalScrollIndicator={false} style={[styles.scrollView, {maxHeight: userInfo.premium ? theme.heigth.shiftScrollViewPremium : theme.heigth.shiftScrollView}]}>
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
    padding: 10  
  },
  scrollView: {
    position: "relative",
    marginTop: 16,
    overflow: "hidden",
  },
  link: {
    position: "absolute",
    top: -32,
    left: 12
  },
  textoBoton: {
    fontSize: theme.fontSizes.F18,
    fontWeight: "500"    
  },
  textLine: {
    fontSize: theme.fontSizes.F18,
    fontWeight: '500'
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