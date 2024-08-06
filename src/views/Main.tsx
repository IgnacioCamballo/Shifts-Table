import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Navigate, Route, Routes } from 'react-router-native'
import LayoutHeader from '../layout/LayoutHeader'
import LayoutFooter from '../layout/LayoutFooter'
import Calendar from './Calendar'
import Totals from './Totals'
import Config from './Config'
import NewEmployer from './NewEmployer'
import EditEmployer from './EditEmployer'
import Shifts from './Shifts'
import NewShift from './NewShift'
import EditShift from './EditShift'
import MonthDetail from './MonthDetail'

export default function Main() {
  return (
    <View style={styles.containerGeneral}>
        <LayoutHeader />
        <Routes>
          <Route path='/' element={<Calendar />}/>
            <Route path='/calendar/shifts/:date' element={<Shifts />}/>
              <Route path='/calendar/shifts/:date/newShift' element={<NewShift />}/>
              <Route path='/calendar/shifts/:date/editShift/:shift' element={<EditShift />}/>
          <Route path='/config' element={<Config />}/>
            <Route path='/config/newEmployer' element={<NewEmployer />}/>
            <Route path='/config/editEmployer/:employer' element={<EditEmployer />}/>
          <Route path='/totals' element={<Totals />}/>
            <Route path='/totals/:month' element={<Totals />}/>
            <Route path='/totalsDetail/:month/' element={<MonthDetail />}/>
        </Routes>
        <LayoutFooter />
    </View>
  )
}

const styles = StyleSheet.create ({
  containerGeneral: {
    flexGrow: 1
  }
})