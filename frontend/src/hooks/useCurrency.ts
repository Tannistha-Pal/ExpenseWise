import { useAppContext } from "@/contexts/AppContext";
import { CURRENCIES } from "@/types";

export function useCurrency() {
  const { currency, setCurrency } = useAppContext();
  const currencyOption = CURRENCIES.find((c) => c.code === currency) || CURRENCIES[0];

  const formatAmount = (amount: number): string => {
    return `${currencyOption.symbol}${amount.toLocaleString("en-IN", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    })}`;
  };

  return { currency, setCurrency, currencyOption, formatAmount };
}