import React from 'react'
import { useParams } from 'react-router-native'
import { ShiftProps } from '@/types'

import useCalendar from '@/hooks/useCalendar'
import ShiftForm from '@/components/organisms/ShiftForm'

export default function EditShift() {
  const { shifts, setShifts} = useCalendar()

  const params = useParams()
  const pressedDate = new Date(params.date!)
  const editingShiftKey = params.shift!
  const editingShift = shifts.find(shift => shift.key === editingShiftKey)
  const editingShiftIndex = shifts.findIndex(shift => shift.key === editingShiftKey)

  //saves the new edited info when submiting
  const handleEditShift = (formData: ShiftProps) => {
    const updatedshifts = [...shifts]
    updatedshifts.splice(editingShiftIndex, 1, formData)
    setShifts(updatedshifts)
  }
  
  return (
    <ShiftForm isCreate={false} pressedDate={pressedDate} onSubmit={handleEditShift} editingShift={editingShift}/>
  )
}
