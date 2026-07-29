import React from 'react'
import { View, StyleSheet, Text } from 'react-native'
import { Platform } from 'react-native';
import Icon from 'react-native-vector-icons/AntDesign'
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import useCalendar from '@/hooks/useCalendar';
import { RootStackParamList } from '@/types';
import theme from '@/theme/theme';
import { getRouteName, translate } from '@/utils';
import TransparentButton from '@/components/Atoms/Buttons/ButtonTransparent';

function NombreLayout () {
  const routeName = getRouteName()
  const {lenguage} = useCalendar()

  //this way avoid of calling useCalendar in utils and translate can be used inside if functions
  function translateFn(text:string){
    return translate({text, lenguage})
  }

  if(routeName === "Calendar") return translateFn("calendar")
  if(routeName === "Shifts") return translateFn("shifts")
  if(routeName === "Totals") return translateFn("totals")
  if(routeName === "TotalsDetail") return translateFn("workedDays")
  if(routeName === "Config") return translateFn("settings")
  if(routeName === "NewEmployer") return translateFn("createEmployer")
  if(routeName === "EditEmployer") return translateFn("editEmployer")
  if(routeName === "Account") return translateFn("account")
}

export default function LayoutHeader() {
  const {configInfo, lenguage} = useCalendar()
  const routeName = getRouteName()
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const backgroundColor = routeName === "LoadingPage" ? theme.colors.blanco : configInfo.baseColor

  function translateFn(text:string){
    return translate({text, lenguage})
  } 

  return (
    <View style={[styles.container, {backgroundColor}]}>
      <Text style={styles.text}>{NombreLayout()}</Text>
      {(routeName === "Shifts" || routeName === "MonthDetail") && (
        <TransparentButton onPress={() => navigation.goBack()} style={styles.link}>
          <Icon 
            name="doubleleft" 
            color={theme.colors.negro} 
            size={17}
          />
          <Text style={styles.textLine}>{translateFn("back")}</Text>
        </TransparentButton>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: Platform.OS === "ios" ? 88 : 68,
    paddingTop: Platform.OS === "ios" ? 52 : 32,
    paddingBottom: 10,
    alignItems: "center",
    zIndex: 1
  },
  text: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F20,
    fontWeight: "bold"
  },
   link: {
    position: "absolute",
    left: 12,
    top: Platform.OS === "ios" ? 52 : 32
  },
  textLine: {
    color: theme.colors.negro,
    fontSize: theme.fontSizes.F18,
    fontWeight: '500'
  }
})