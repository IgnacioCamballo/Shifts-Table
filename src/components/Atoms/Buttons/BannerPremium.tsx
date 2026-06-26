import React from 'react'
import { TouchableOpacity, ImageBackground, StyleSheet, Dimensions, Text, StyleProp, ViewStyle } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'

import useCalendar from '@/hooks/useCalendar'
import { RootStackParamList } from '@/types'
import { translate } from '@/utils'

type Props = {
  style?: StyleProp<ViewStyle>
}

export default function BannerPremium({ style }: Props) {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>()
  const { userInfo, lenguage } = useCalendar()

  function translateFn(text: string) {
    return translate({ text, lenguage })
  }

  return (
    <TouchableOpacity activeOpacity={1} onPress={() => navigation.navigate(userInfo.mail ? "PremiumPurchase" : 'PrePurchaseLogin')} style={style}>
      <ImageBackground
        source={require("@/../assets/premiumBanner.jpg")}
        style={styles.premiumBanner}
      >
        <Text style={styles.text1}>{translateFn("getPremium")}</Text>
        <Text style={styles.text2}>{translateFn("atPrice")}</Text>
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
