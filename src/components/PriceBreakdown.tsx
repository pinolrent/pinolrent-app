import { Text, View } from 'react-native'
import { formatPrice, formatPricePerDay } from '@/utils/currency'
import { formatDays } from '@/utils/dates'
import {
  SELLER_FEE_PERCENT,
  SERVICE_FEE_PERCENT,
  type ReservationPricing,
} from '@/utils/reservations'
import { NUMERIC } from '@/constants/typography'
import {
  SELLER_FEE_LABEL,
  SELLER_NET_LABEL,
  SERVICE_FEE_LABEL,
  TOTAL_DUE_LABEL,
} from '@/constants/reservation-ui'

export function PriceBreakdown({
  pricePerDay,
  pricing,
  audience,
}: {
  pricePerDay: number
  pricing: ReservationPricing
  audience: 'buyer' | 'seller'
}) {
  const buyer = audience === 'buyer'
  const feeLabel = buyer
    ? `${SERVICE_FEE_LABEL} (${SERVICE_FEE_PERCENT}%)`
    : `${SELLER_FEE_LABEL} (${SELLER_FEE_PERCENT}%)`

  return (
    <View className="gap-2">
      <Text style={NUMERIC} className="text-sm text-muted-foreground">
        {formatPricePerDay(pricePerDay)} × {formatDays(pricing.days)}
      </Text>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm text-muted-foreground">Subtotal</Text>
        <Text style={NUMERIC} className="text-sm text-foreground">
          {formatPrice(pricing.subtotal)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between gap-3">
        <Text className="text-sm text-muted-foreground">{feeLabel}</Text>
        <Text style={NUMERIC} className="text-sm text-foreground">
          {buyer
            ? `+${formatPrice(pricing.serviceFee)}`
            : formatPrice(-pricing.sellerFee)}
        </Text>
      </View>
      <View className="flex-row items-center justify-between gap-3 border-t border-border pt-2">
        <Text className="text-sm font-semibold text-foreground">
          {buyer ? TOTAL_DUE_LABEL : SELLER_NET_LABEL}
        </Text>
        <Text style={NUMERIC} className="text-2xl font-bold text-foreground">
          {formatPrice(buyer ? pricing.buyerTotal : pricing.sellerNet)}
        </Text>
      </View>
    </View>
  )
}
