import useCalendar from '@/hooks/useCalendar'
import React from 'react'
import { TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Text, StyleProp, ViewStyle } from 'react-native'
import { useNavigate } from 'react-router-native'

type Props = {
  style?: StyleProp<ViewStyle>
}

export default function BannerPremium({style}: Props) {
  const navigate = useNavigate()
  const {userInfo, lenguage} = useCalendar()

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => navigate(userInfo.mail ? "/premium-purchase" : '/account/prePurchaseLogin')} style={style}>
        <ImageBackground
          source={require("@/../assets/premiumBanner.jpg")}
          style={styles.premiumBanner}
        >
          <Text style={styles.text1}>Consigue Premium</Text>
          <Text style={styles.text2}>solo €2,99/año</Text>
          <Text />
        </ImageBackground>
      </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  premiumBanner: {
    width: Dimensions.get("window").width,
    height: 130,
    justifyContent: "center"
  },
  text1: {
    color: "white", 
    fontSize: 26, 
    fontWeight: "900", 
    textAlign: "center" 
  },
  text2: {
    color: "white", 
    fontSize: 20, 
    fontWeight: "700", 
    textAlign: "center" 
  }
})
