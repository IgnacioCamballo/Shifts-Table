import React from 'react'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { Dimensions, Platform, StyleSheet, View } from 'react-native'
import theme from '@/theme/theme'

export const BannerAdds = () => {
  return (
    <View style={styles.container}>
      <BannerAd
        size={BannerAdSize.LARGE_ANCHORED_ADAPTIVE_BANNER}
        unitId={theme.banners[Platform.OS === 'ios' ? 'ios' : 'android'].banner}
        requestOptions={{
          requestNonPersonalizedAdsOnly: true
        }}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  //white and full width, so nothing that is hidden behind the ad shows through its sides or while it loads
  //minHeight is the reserved space: a taller adaptive banner grows it instead of being cut
  container: {
    width: Dimensions.get("window").width,
    minHeight: theme.heigth.bannerReserved,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: theme.colors.blanco
  }
})
