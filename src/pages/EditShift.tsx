import React from 'react'
import { RootStackParamList, ShiftProps } from '@/types'

import useCalendar from '@/hooks/useCalendar'
import ShiftForm from '@/components/organisms/ShiftForm'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

export default function EditShift() {
  const { shifts, setShifts} = useCalendar()

  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const params = navigation.getState().routes[2].params as { date: string; shift: string }
  const pressedDate = new Date(params.date)
  const editingShiftKey = params.shift
  const editingShift = shifts.find(shift => shift.key === editingShiftKey)
  const editingShiftIndex = shifts.findIndex(shift => shift.key === editingShiftKey)

  //saves the new edited info when submiting
  const handleEditShift = (formData: ShiftProps) => {
    const updatedshifts = [...shifts]
    updatedshifts.splice(editingShiftIndex, 1, formData)
    setShifts(updatedshifts)
    navigation.goBack()
  }
  
  return (
    <ShiftForm isCreate={false} pressedDate={pressedDate} onSubmit={handleEditShift} editingShift={editingShift}/>
  )
}
