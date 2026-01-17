import { getWMMCoefficients } from "./wmmModel"

/**
 * Parámetros de entrada
 */
type WMMInput = {
  lat: number      // grados geodésicos (con signo)
  lon: number      // grados geodésicos (con signo)
  height: number   // metros sobre MSL
  date: Date
}

/**
 * Resultado del campo
 */
type WMMResult = {
  X: number // nT (Norte)
  Y: number // nT (Este)
  Z: number // nT (Vertical, positivo hacia abajo)
  F: number // nT (Total)
}

/**
 * Constantes WGS84
 */
const A = 6378.137            // km
const B = 6356.7523142        // km
const RE = 6371.2             // km
const DEG2RAD = Math.PI / 180

/**
 * WMM-2025
 */
const MODEL_EPOCH = 2025.0
const MAX_N = 13

/**
 * Factor de normalización Schmidt cuasi-normalizado
 */
function schmidt(n: number, m: number): number {
  if (m === 0) return 1

  let num = 1
  let den = 1

  // (n - m)!
  for (let i = 1; i <= n - m; i++) {
    num *= i
  }

  // (n + m)!
  for (let i = 1; i <= n + m; i++) {
    den *= i
  }

  return Math.sqrt(2 * num / den)
}


/**
 * Polinomios de Legendre asociados (no normalizados)
 */
function computeLegendre(theta: number) {
  const P: number[][] = Array.from({ length: MAX_N + 1 }, () =>
    Array(MAX_N + 1).fill(0)
  )
  const dP: number[][] = Array.from({ length: MAX_N + 1 }, () =>
    Array(MAX_N + 1).fill(0)
  )

  const ct = Math.cos(theta)
  const st = Math.sin(theta)

  P[0][0] = 1
  dP[0][0] = 0

  for (let n = 1; n <= MAX_N; n++) {
    P[n][0] =
      ((2 * n - 1) * ct * P[n - 1][0] -
        (n - 1) * (P[n - 2]?.[0] ?? 0)) / n

    dP[n][0] =
      ((2 * n - 1) * (ct * dP[n - 1][0] - st * P[n - 1][0]) -
        (n - 1) * (dP[n - 2]?.[0] ?? 0)) / n

    for (let m = 1; m <= n; m++) {
      if (n === m) {
        P[n][m] = st * P[n - 1][m - 1]
        dP[n][m] = st * dP[n - 1][m - 1] + ct * P[n - 1][m - 1]
      } else {
        P[n][m] =
          ((2 * n - 1) * ct * P[n - 1][m] -
            (n + m - 1) * (P[n - 2]?.[m] ?? 0)) /
          (n - m)

        dP[n][m] =
          ((2 * n - 1) *
            (ct * dP[n - 1][m] - st * P[n - 1][m]) -
            (n + m - 1) * (dP[n - 2]?.[m] ?? 0)) /
          (n - m)
      }
    }
  }

  return { P, dP }
}

function decimalYear(date: Date): number {
  const year = date.getUTCFullYear()

  const start = Date.UTC(year, 0, 1)
  const end = Date.UTC(year + 1, 0, 1)

  const now = Date.UTC(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds()
  )

  return year + (now - start) / (end - start)
}


/**
 * Función principal
 */
export function computeWMMField({
  lat,
  lon,
  height,
  date,
}: WMMInput): WMMResult {

  const coeffs = getWMMCoefficients()

  // --- Año decimal (exacto, NOAA) ---
const year = decimalYear(date)
const dt = year - MODEL_EPOCH


  // --- Conversión geodésica → geocéntrica ---
  const phi = lat * DEG2RAD
  const lambda = lon * DEG2RAD
  const h = height / 1000

  const sinPhi = Math.sin(phi)
  const cosPhi = Math.cos(phi)

  const e2 = (A * A - B * B) / (A * A)
  const N = A / Math.sqrt(1 - e2 * sinPhi * sinPhi)

  const Xp = (N + h) * cosPhi * Math.cos(lambda)
  const Yp = (N + h) * cosPhi * Math.sin(lambda)
  const Zp = ((B * B) / (A * A) * N + h) * sinPhi

  const r = Math.sqrt(Xp * Xp + Yp * Yp + Zp * Zp)
  const theta = Math.acos(Zp / r) // colatitud geocéntrica

  // --- Legendre ---
  const { P, dP } = computeLegendre(theta)

  let Br = 0
  let Btheta = 0
  let Bphi = 0

  // --- Loop armónico ---
  for (const c of coeffs) {
    const { n, m, gnm, hnm, dgnm, dhnm } = c
    if (n > MAX_N) continue

    const g = gnm + dt * dgnm
    const hcoef = hnm + dt * dhnm

    const cos_mphi = Math.cos(m * lambda)
    const sin_mphi = Math.sin(m * lambda)

    const factor = Math.pow(RE / r, n + 2)
    const S = schmidt(n, m)

    Br +=
      factor *
      (n + 1) *
      S *
      P[n][m] *
      (g * cos_mphi + hcoef * sin_mphi)

    Btheta -=
      factor *
      S *
      dP[n][m] *
      (g * cos_mphi + hcoef * sin_mphi)

    if (m !== 0) {
      Bphi +=
        (factor *
          m *
          S *
          P[n][m] *
          (g * sin_mphi - hcoef * cos_mphi)) /
        Math.sin(theta)
    }
  }

  // --- Rotación final a sistema local ---
  const psi = Math.atan2(Zp, Math.sqrt(Xp * Xp + Yp * Yp))
  const sinPsi = Math.sin(psi)
  const cosPsi = Math.cos(psi)

  const X = -Btheta * cosPsi - Br * sinPsi
  const Y = Bphi
  const Z =  Btheta * sinPsi - Br * cosPsi


  const F = Math.sqrt(X * X + Y * Y + Z * Z)

  return { X, Y, Z, F }
}
