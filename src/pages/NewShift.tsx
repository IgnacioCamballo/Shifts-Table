import React, { useState } from 'react'
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList, ShiftProps } from '@/types'
import { isSameDay } from '@/utils/datesCompare'
import theme from '@/theme/theme'

import ShiftForm from '@/components/organisms/ShiftForm'

export default function NewShift() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[2].params as { date: string }
  const pressedDate = new Date(params.date)

  const {shifts, lastShiftCreated, userInfo, setShifts, setLastShiftCreated} = useCalendar()
  const [loaded, setLoaded] = useState(false)

  const sameDay = isSameDay({day1: lastShiftCreated, day2: new Date()})
  //Interstitial ad, only shows if the user is not premium and if the last shift created was today
  const interstitial = InterstitialAd.createForAdRequest(theme.banners.intersticial)
  if(!userInfo.premium && sameDay) {
    interstitial.addAdEventListener(AdEventType.LOADED, () => setLoaded(true))
    interstitial.load()
  }

  //Saves the new shift info when submiting  
  const handleSaveShift = (formData: ShiftProps) => {
    const updatedshifts = [...shifts, formData]
    setShifts(updatedshifts)

    if(loaded) interstitial.show()
    if(!userInfo.premium) setLastShiftCreated(new Date())
    navigation.goBack()
  }
  
  return (
    <ShiftForm isCreate={true} pressedDate={pressedDate} onSubmit={handleSaveShift}/>
  )
}

