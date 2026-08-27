import React from 'react'
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads'
import { Platform } from 'react-native'
import theme from '@/theme/theme'

export const BannerAdds = () => {
  return (
    <BannerAd
      size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
      unitId={theme.banners[Platform.OS === 'ios' ? 'ios' : 'android'].banner}
      requestOptions={{
        requestNonPersonalizedAdsOnly: true
      }}
    />
  )
}
