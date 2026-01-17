import { parseWMM, WMMCoeff } from "./parseCof"

let cachedCoeffs: WMMCoeff[] | null = null

export function getWMMCoefficients() {
  if (!cachedCoeffs) {
    cachedCoeffs = parseWMM()
  }
  return cachedCoeffs
}
