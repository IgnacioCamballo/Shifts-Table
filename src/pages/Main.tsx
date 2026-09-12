import React, { useState } from 'react'
import { View, StyleSheet, StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

import { CalendarProvider } from '@/context/CalendarProvider'
import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'

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
import DeleteAccount from '@/pages/DeleteAccount'
import PrePurchaseLogin from '@/pages/PrePurchaseLogin'
//Premium pages
import PremiumPurchase from '@/pages/PremiumPurchase'
import PremiumPurchaseSuccess from '@/pages/PremiumPurchaseSuccess'
import PremiumPurchaseIos from '@/pages/PremiumPurchaseIos'

const Stack = createNativeStackNavigator<RootStackParamList>()

type RouteName = keyof RootStackParamList

function RouterContent({ routeName }: { routeName: RouteName }) {
  const { configInfo } = useCalendar()
  const statusBarColor = routeName === 'LoadingPage' ? '#ffffff' : configInfo.baseColor

  return (
    <View style={styles.containerGeneral}>
      <StatusBar backgroundColor={statusBarColor} />
      <LayoutHeader />
      <View style={styles.routesContainer}>
        <Stack.Navigator
          initialRouteName='LoadingPage'
          screenOptions={{ headerShown: false, animationDuration: 600}}
          
        >
          <Stack.Screen name='LoadingPage' component={LoadingPage} />

          <Stack.Screen name='Calendar' component={Calendar} options={{animation: "fade", animationDuration: 200}}/>
          <Stack.Screen name='Shifts' component={Shifts} options={{animation: "none"}}/>
          <Stack.Screen name='NewShift' component={NewShift} />
          <Stack.Screen name='EditShift' component={EditShift} />

          <Stack.Screen name='Config' component={Config} options={{animation: "fade", animationDuration: 200}}/>
          <Stack.Screen name='NewEmployer' component={NewEmployer} />
          <Stack.Screen name='EditEmployer' component={EditEmployer} />

          <Stack.Screen name='Totals' component={Totals} options={{animation: "fade", animationDuration: 200}}/>
          <Stack.Screen name='MonthDetail' component={MonthDetail} />

          <Stack.Screen name='AccountIntro' component={AccountIntro} />
          <Stack.Screen name='SelectLenguage' component={SelectLenguage} />
          <Stack.Screen name='Login' component={Login} />
          <Stack.Screen name='PassRecover' component={PassRecover} />
          <Stack.Screen name='CreateAccount' component={CreateAccount} />
          <Stack.Screen name='PrePurchaseLogin' component={PrePurchaseLogin} />
          <Stack.Screen name='DeleteAccount' component={DeleteAccount} />

          <Stack.Screen name='PremiumPurchase' component={PremiumPurchase} />
          <Stack.Screen name='PremiumPurchaseIos' component={PremiumPurchaseIos} />
          <Stack.Screen name='PremiumPurchaseSuccess' component={PremiumPurchaseSuccess} />
        </Stack.Navigator>
      </View>
      <LayoutFooter />
    </View>
  )
}

export default function Main() {
  const [routeName, setRouteName] = useState<RouteName>('LoadingPage')

  return (
    <NavigationContainer
      onStateChange={(state) => {
        const currentRoute = state?.routes[state.index]?.name
        if (currentRoute) {
          setRouteName(currentRoute as RouteName)
        }
      }}
    >
      <CalendarProvider routeName={routeName}>
        <RouterContent routeName={routeName} />
      </CalendarProvider>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  containerGeneral: {
    flex: 1,
    backgroundColor: '#ffffff',
    color: '#000000'
  },
  routesContainer: {
    flex: 1,
    backgroundColor: '#ffffff'
  }
})