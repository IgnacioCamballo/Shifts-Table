import React from 'react'
import { Text, View, StyleSheet } from 'react-native'
import { Route, Routes } from 'react-router-native'
import LayoutHeader from '../layout/LayoutHeader'
import LayoutFooter from '../layout/LayoutFooter'
import Calendar from './Calendar'
import Totals from './Totals'
import Config from './Config'
import NewEmployer from './NewEmployer'

export default function Main() {
  return (
    <View style={styles.containerGeneral}>
        <LayoutHeader />
        <Routes>
          <Route path='/' element={<Calendar />}/>
          <Route path='/totals' element={<Totals />}/>
          <Route path='/config' element={<Config />}/>
          <Route path='/config/newEmployer' element={<NewEmployer />}/>
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