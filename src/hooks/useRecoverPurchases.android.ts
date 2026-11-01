type Props = {
  enabled: boolean
  isPurchasingRef: React.MutableRefObject<boolean>
  onRecovered: () => void
}

//Android pays with Stripe, whose webhook updates the backend by itself, so there is nothing to recover in the app
export default function useRecoverPurchases(_props: Props) {}
