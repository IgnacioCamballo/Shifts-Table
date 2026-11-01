import { useEffect, useRef } from 'react'
import { initConnection, getAvailablePurchases, finishTransaction } from 'expo-iap'

import { IosPaymentConfirmation } from '@/api/PaymentsAPI'

export const IOS_PREMIUM_SKU = 'com.kanatzu.shiftstable.premium.yearly'

type Props = {
  //only logged in users that are not premium yet can have a purchase to recover
  enabled: boolean
  //a purchase in progress in PremiumPurchase handles its own transaction
  isPurchasingRef: React.MutableRefObject<boolean>
  onRecovered: () => void
}

//If the app was closed (or the wait timed out) after Apple charged but before the backend was told, StoreKit still holds the
//unfinished transaction. This confirms it with the backend the next time the app opens, same as PremiumPurchase does
export default function useRecoverPurchases({ enabled, isPurchasingRef, onRecovered }: Props) {
  const isRunningRef = useRef(false)
  const confirmedRef = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled) return

    const recover = async () => {
      if (isRunningRef.current || isPurchasingRef.current) return
      isRunningRef.current = true
      try {
        //endConnection is never called here: PremiumPurchase shares the StoreKit connection through useIAP
        await initConnection()
        const purchases = await getAvailablePurchases()

        for (const purchase of purchases) {
          if (purchase.productId !== IOS_PREMIUM_SKU) continue
          const transactionId = purchase.transactionId ?? ''
          if (confirmedRef.current.has(transactionId)) continue
          if (isPurchasingRef.current) return

          await IosPaymentConfirmation({
            productId: purchase.productId,
            transactionId,
            purchaseToken: purchase.purchaseToken ?? ''
          })
          //only finished after the backend accepted it, otherwise StoreKit keeps it for the next launch
          await finishTransaction({ purchase, isConsumable: false })
          confirmedRef.current.add(transactionId)
          onRecovered()
        }
      } catch (error) {
        console.log(error)
      } finally {
        isRunningRef.current = false
      }
    }

    recover()
  }, [enabled])
}
