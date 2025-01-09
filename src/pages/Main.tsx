import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Route, Routes } from 'react-router-native'
import LayoutHeader from '@/layout/LayoutHeader'
import LayoutFooter from '@/layout/LayoutFooter'
import Calendar from '@/pages/Calendar'
import Totals from '@/pages/Totals'
import Config from '@/pages/Config'
import NewEmployer from '@/pages/NewEmployer'
import EditEmployer from '@/pages/EditEmployer'
import Shifts from '@/pages/Shifts'
import NewShift from '@/pages/NewShift'
import EditShift from '@/pages/EditShift'
import MonthDetail from '@/pages/MonthDetail'

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
            <Route path='/config/newEmployer/:date' element={<NewEmployer />}/>
            <Route path='/config/editEmployer/:employer' element={<EditEmployer />}/>

          <Route path='/totals' element={<Totals />}/>
            <Route path='/totals/:month' element={<Totals />}/>
            <Route path='/totalsDetail/:month/:employer' element={<MonthDetail />}/>

          <Route path='/account' element={<></>}/>
            <Route path='/account/lenguage' element={<></>}/>
            <Route path='/account/login' element={<></>}/>
            <Route path='/account/createAccount' element={<></>}/>
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