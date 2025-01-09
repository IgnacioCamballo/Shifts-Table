import React from 'react'
import { useParams } from 'react-router-native'

import useCalendar from '@/hooks/useCalendar'
import { ShiftProps } from '@/types'

import ShiftForm from '@/components/organisms/ShiftForm'

export default function NewShift() {
  const params = useParams()
  const pressedDate = new Date(params.date!)

  const {shifts, setShifts} = useCalendar()


  //Saves the new shift info when submiting  
  const handleSaveShift = (formData: ShiftProps) => {
    const updatedshifts = [...shifts, formData]
    setShifts(updatedshifts)
  }

  
  return (
    <ShiftForm isCreate={true} pressedDate={pressedDate} onSubmit={handleSaveShift}/>
  )
}

