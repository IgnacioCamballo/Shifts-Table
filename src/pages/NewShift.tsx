import React, { useState } from 'react'
import { useParams } from 'react-router-native'
import { AdEventType, InterstitialAd } from 'react-native-google-mobile-ads'

import useCalendar from '@/hooks/useCalendar'
import { ShiftProps } from '@/types'

import ShiftForm from '@/components/organisms/ShiftForm'
import theme from '@/theme/theme'
import { isSameDay } from '@/utils/datesCompare'

export default function NewShift() {
  const params = useParams()
  const pressedDate = new Date(params.date!)

  const {shifts, lastShiftCreated, userInfo, setShifts, setLastShiftCreated} = useCalendar()
  const [loaded, setLoaded] = useState(false)

  const sameDay = lastShiftCreated ? isSameDay({day1: lastShiftCreated, day2: new Date()}) : false 
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
  }

  
  return (
    <ShiftForm isCreate={true} pressedDate={pressedDate} onSubmit={handleSaveShift}/>
  )
}

