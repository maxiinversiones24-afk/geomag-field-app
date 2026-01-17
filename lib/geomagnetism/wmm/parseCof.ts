import fs from "fs"
import path from "path"

export type WMMCoeff = {
  n: number
  m: number
  gnm: number
  hnm: number
  dgnm: number
  dhnm: number
}

export function parseWMM(): WMMCoeff[] {
  const filePath = path.join(
    process.cwd(),
    "lib/geomagnetism/wmm/WMM.COF"
  )

  const raw = fs.readFileSync(filePath, "utf-8")
  const lines = raw.split("\n").slice(1)

  return lines
    .map(l => l.trim())
    .filter(Boolean)
    .filter(l => !l.startsWith("999"))
    .map(line => {
      const [n, m, gnm, hnm, dgnm, dhnm] = line.split(/\s+/).map(Number)
      return { n, m, gnm, hnm, dgnm, dhnm }
    })

}
