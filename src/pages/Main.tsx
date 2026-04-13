import React from 'react'
import { View, StyleSheet } from 'react-native'
import { Route, Routes } from 'react-router-native'

import LayoutHeader from '@/layout/LayoutHeader'
import LayoutFooter from '@/layout/LayoutFooter'
import LoadingPage from './LoadingPage'
//Calendar pages
import Calendar from '@/pages/Calendar'
import Shifts from '@/pages/Shifts'
import NewShift from '@/pages/NewShift'
import EditShift from '@/pages/EditShift'
//config pages
import Config from '@/pages/Config'
import NewEmployer from '@/pages/NewEmployer'
import EditEmployer from '@/pages/EditEmployer'
//Totals pages
import Totals from '@/pages/Totals'
import MonthDetail from '@/pages/MonthDetail'
//Account pages
import AccountIntro from '@/pages/AccountIntro'
import SelectLenguage from '@/pages/SelectLenguage'
import Login from '@/pages/Login'
import CreateAccount from '@/pages/CreateAccount'
import PassRecover from '@/pages/PassRecover'
import DeleteAccount from './DeleteAccount'
import PrePurchaseLogin from './PrePurchaseLogin'
//Premium pages
import PremiumPurchase from '@/pages/PremiumPurchase'
import PremiumPurchaseSuccess from './PremiumPurchaseSuccess'

export default function Main() {
  return (
    <View style={styles.containerGeneral}>
        <LayoutHeader />
        <View style={styles.routesContainer}>
          <Routes>
            <Route path='/' element={<LoadingPage />} index/>

            <Route path='/calendar' element={<Calendar />}/>
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

            <Route path='/account/:lg' element={<AccountIntro />}/>
              <Route path='/account/lenguage' element={<SelectLenguage />}/>
              <Route path='/account/:lg/login/:type' element={<Login />}/> {/* type 1 comes from first time opening the account, type 2 comes from prePurchase, used for back button */}
              <Route path='/account/:lg/recoverPassword' element={<PassRecover />}/>
              <Route path='/account/:lg/createAccount/:type' element={<CreateAccount />}/>
              <Route path='/account/prePurchaseLogin' element={<PrePurchaseLogin />}/>
              <Route path='/account/deleteAccount' element={<DeleteAccount />}/>

            <Route path="/premium-purchase" element={<PremiumPurchase />}/>
              <Route path="/premium-purchase/success" element={<PremiumPurchaseSuccess />}/>
          </Routes>
        </View>
        <LayoutFooter />
    </View>
  )
}

const styles = StyleSheet.create ({
  containerGeneral: {
    flex: 1
  },
  routesContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
})