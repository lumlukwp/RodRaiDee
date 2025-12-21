'use client'

import { useState } from 'react'

/* ===== helpers ===== */
const fmt = (n: number, decimals = 0) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })

const fmtInput = (n: number) => n.toLocaleString('en-US')
const parseInput = (s: string) => parseFloat(s.replace(/,/g, '')) || 0

/* ===== types ===== */
type Powertrain = 'ICE' | 'Hybrid' | 'EV'
type FuelMode = 'city' | 'highway' | 'custom'

/* ===== fuel presets ===== */
const FUEL_CONSUMPTION_PRESET: Record<
  FuelMode,
  Record<Powertrain, number>
> = {
  city: { ICE: 12, Hybrid: 22, EV: 11 },
  highway: { ICE: 15, Hybrid: 19, EV: 14 },
  custom: { ICE: 14, Hybrid: 20, EV: 12 },
}

/* ===== cost presets ===== */
const PRESETS: Record<
  Powertrain,
  {
    insurance: number
    maintenance: number
    registration: number
    resalePct: number
    miscellaneous: number
    fuelPerKm: number
    maintenanceAtEnd: number
  }
> = {
  ICE: {
    insurance: 22000,
    maintenance: 8000,
    registration: 2500,
    resalePct: 30,
    miscellaneous: 0,
    fuelPerKm: 2.2,
    maintenanceAtEnd: 0,
  },
  Hybrid: {
    insurance: 22000,
    maintenance: 8000,
    registration: 2500,
    resalePct: 30,
    miscellaneous: 0,
    fuelPerKm: 1.6,
    maintenanceAtEnd: 150000,
  },
  EV: {
    insurance: 32000,
    maintenance: 4000,
    registration: 1000,
    resalePct: 10,
    miscellaneous: 0,
    fuelPerKm: 0.8,
    maintenanceAtEnd: 300000,
  },
}

/* ===== fuel helper ===== */
const calcFuelPerKm = (
  powertrain: Powertrain,
  fuelPrice: number,
  fuelConsumption: number
) => {
  if (powertrain === 'EV') {
    return (fuelConsumption / 100) * fuelPrice // kWh/100km
  }
  return fuelPrice / fuelConsumption // km/L
}

/* ===== Car type ===== */
type CarInput = {
  name: string
  powertrain: Powertrain
  carPrice: number
  discount: number
  otherDiscount: number
  resalePct: number
  kmPerYear: number
  years: number
  insurance: number
  maintenance: number
  maintenanceAtEnd: number
  registration: number
  miscellaneous: number

  fuelMode: FuelMode
  fuelConsumption: number
  fuelPrice: number
  fuelPerKm: number
}

/* ===== default car ===== */
const defaultCar = (index: number): CarInput => {
  const p = PRESETS.ICE
  const fuelConsumption = 14
  const fuelPrice = 30

  return {
    name: `Car ${index + 1}`,
    powertrain: 'ICE',
    carPrice: 1_000_000,
    discount: 0,
    otherDiscount: 0,
    resalePct: p.resalePct,
    kmPerYear: 20000,
    years: 10,
    insurance: p.insurance,
    maintenance: p.maintenance,
    maintenanceAtEnd: p.maintenanceAtEnd,
    registration: p.registration,
    miscellaneous: p.miscellaneous,

    fuelMode: 'custom',
    fuelConsumption,
    fuelPrice,
    fuelPerKm: calcFuelPerKm('ICE', fuelPrice, fuelConsumption),
  }
}

/* ===== main ===== */
export default function Home() {
  const [cars, setCars] = useState<CarInput[]>([defaultCar(0)])

  const updateCar = <K extends keyof CarInput>(
    index: number,
    key: K,
    value: CarInput[K]
  ) => {
    const next = [...cars]
    next[index] = { ...next[index], [key]: value }
    setCars(next)
  }

  const updateCarBulk = (index: number, values: Partial<CarInput>) => {
    const next = [...cars]
    next[index] = { ...next[index], ...values }
    setCars(next)
  }

  const addCar = () => setCars([...cars, defaultCar(cars.length)])
  const removeCar = (index: number) =>
    setCars(cars.filter((_, i) => i !== index))

  const calculate = (car: CarInput) => {
    const netCarPrice = car.carPrice - car.discount - car.otherDiscount
    const fuelPerYear = car.fuelPerKm * car.kmPerYear
    const yearlyCost =
      car.insurance +
      car.maintenance +
      car.registration +
      car.miscellaneous +
      fuelPerYear
    const resaleValue = car.carPrice * (car.resalePct / 100)
    const totalCost =
      netCarPrice +
      yearlyCost * car.years +
      car.maintenanceAtEnd -
      resaleValue

    return { netCarPrice, fuelPerYear, yearlyCost, resaleValue, totalCost }
  }

  return (
    <main className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          🚗 RodRaiDee – เปรียบเทียบต้นทุนรถ
        </h1>
        <button
          onClick={addCar}
          className="px-4 py-2 bg-black text-white rounded"
        >
          ➕ เพิ่มรถ
        </button>
      </div>

      <div className="overflow-x-auto py-4">
        <div className="flex gap-4">
          {cars.map((car, i) => {
            const r = calculate(car)

            return (
              <div
                key={i}
                className="min-w-[320px] border rounded p-4 shadow space-y-2"
              >
                {/* name */}
                <div className="flex justify-between items-center">
                  <input
                    className="text-xl font-semibold w-full"
                    value={car.name}
                    onChange={e =>
                      updateCar(i, 'name', e.target.value)
                    }
                  />
                  {cars.length > 1 && (
                    <button
                      className="ml-2 px-2 py-1 bg-red-500 text-white rounded"
                      onClick={() => removeCar(i)}
                    >
                      🗑️ Remove
                    </button>
                  )}
                </div>

                {/* powertrain */}
                <label>ประเภทระบบขับเคลื่อน</label>
                <div className="flex gap-2">
                  <select
                    value={car.powertrain}
                    onChange={e => {
                      const pt = e.target.value as Powertrain
                      const p = PRESETS[pt]
                      const fuelPrice = pt === 'EV' ? 5 : 30
                      const fc =
                        FUEL_CONSUMPTION_PRESET[car.fuelMode][pt]

                      updateCarBulk(i, {
                        powertrain: pt,
                        insurance: p.insurance,
                        maintenance: p.maintenance,
                        registration: p.registration,
                        resalePct: p.resalePct,
                        miscellaneous: p.miscellaneous,
                        maintenanceAtEnd: p.maintenanceAtEnd,
                        fuelPrice,
                        fuelConsumption: fc,
                        fuelPerKm: calcFuelPerKm(
                          pt,
                          fuelPrice,
                          fc
                        ),
                      })
                    }}
                    className="flex-1"
                  >
                    <option value="ICE">ICE (น้ำมัน)</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="EV">EV</option>
                  </select>
                </div>

                <hr />

                {/* price */}
                <label>ค่ารถเริ่มต้น</label>
                <input
                  type="text"
                  value={fmtInput(car.carPrice)}
                  onChange={e =>
                    updateCar(
                      i,
                      'carPrice',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ส่วนลด</label>
                <input
                  type="text"
                  value={fmtInput(car.discount)}
                  onChange={e =>
                    updateCar(
                      i,
                      'discount',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ส่วนลดอื่น ๆ</label>
                <input
                  type="text"
                  value={fmtInput(car.otherDiscount)}
                  onChange={e =>
                    updateCar(
                      i,
                      'otherDiscount',
                      parseInput(e.target.value)
                    )
                  }
                />

                <p>💰 ราคาซื้อสุทธิ: <b>{fmt(r.netCarPrice)}</b></p>

                <hr />

                <label>ราคาขายต่อ (%)</label>
                <input
                  type="number"
                  value={car.resalePct}
                  onChange={e =>
                    updateCar(i, 'resalePct', +e.target.value)
                  }
                />

                <p>🔁 ราคาขายต่อ: <b>{fmt(r.resaleValue)}</b></p>

                <hr />

                {/* ===== FUEL SECTION (NEW) ===== */}
                <label>ราคาพลังงาน (บาท)</label>
                <input
                  type="number"
                  value={car.fuelPrice}
                  onChange={e => {
                    const fuelPrice = +e.target.value
                    updateCarBulk(i, {
                      fuelPrice,
                      fuelPerKm: calcFuelPerKm(
                        car.powertrain,
                        fuelPrice,
                        car.fuelConsumption
                      ),
                    })
                  }}
                />

                <label>ลักษณะการขับขี่</label>
                <select
                  value={car.fuelMode}
                  onChange={e => {
                    const mode = e.target.value as FuelMode
                    const fc =
                      FUEL_CONSUMPTION_PRESET[mode][
                        car.powertrain
                      ]
                    updateCarBulk(i, {
                      fuelMode: mode,
                      fuelConsumption: fc,
                      fuelPerKm: calcFuelPerKm(
                        car.powertrain,
                        car.fuelPrice,
                        fc
                      ),
                    })
                  }}
                >
                  <option value="city">ขับในเมืองเป็นส่วนใหญ่</option>
                  <option value="highway">ขับนอกเมืองเป็นส่วนใหญ่</option>
                  <option value="custom">กำหนดเอง</option>
                </select>

                {car.fuelMode === 'custom' && (
                  <>
                    <label>
                      <br />อัตราการใช้พลังงาน{' '}
                      {car.powertrain === 'EV'
                        ? '(kWh/100km)'
                        : '(กม./ลิตร)'}
                    </label>
                    <input
                      type="number"
                      value={car.fuelConsumption}
                      onChange={e => {
                        const fc = +e.target.value
                        updateCarBulk(i, {
                          fuelConsumption: fc,
                          fuelPerKm: calcFuelPerKm(
                            car.powertrain,
                            car.fuelPrice,
                            fc
                          ),
                        })
                      }}
                    />
                  </>
                )}

                <p>
                  ⚖️ อัตราสิ้นเปลือง:{' '}
                  <b>{fmt(car.fuelConsumption, 2)}</b>
                </p>

                <p>
                  ⚡ ค่าเชื้อเพลิงต่อกม.:{' '}
                  <b>{fmt(car.fuelPerKm, 2)}</b>
                </p>

                <p>
                  ⛽ ค่าเชื้อเพลิง/ปี:{' '}
                  <b>{fmt(r.fuelPerYear)}</b>
                </p>

                <hr />

                <label>ระยะขับต่อปี (กม.)</label>
                <input
                  type="text"
                  value={fmtInput(car.kmPerYear)}
                  onChange={e =>
                    updateCar(
                      i,
                      'kmPerYear',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ค่าประกันต่อปี</label>
                <input
                  type="text"
                  value={fmtInput(car.insurance)}
                  onChange={e =>
                    updateCar(
                      i,
                      'insurance',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ซ่อมบำรุงต่อปี</label>
                <input
                  type="text"
                  value={fmtInput(car.maintenance)}
                  onChange={e =>
                    updateCar(
                      i,
                      'maintenance',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ต่อทะเบียน (ภาษีและ พ.ร.บ.)</label>
                <input
                  type="text"
                  value={fmtInput(car.registration)}
                  onChange={e =>
                    updateCar(
                      i,
                      'registration',
                      parseInput(e.target.value)
                    )
                  }
                />

                <label>ค่าใช้จ่ายอื่น ๆ ต่อปี</label>
                <input
                  type="text"
                  value={fmtInput(car.miscellaneous)}
                  onChange={e =>
                    updateCar(
                      i,
                      'miscellaneous',
                      parseInput(e.target.value)
                    )
                  }
                />

                <p>📅 ค่าใช้จ่าย/ปี: <b>{fmt(r.yearlyCost)}</b></p>

                <hr />

                <label>จำนวนปีที่จะใช้รถ</label>
                <input
                  type="number"
                  value={car.years}
                  onChange={e =>
                    updateCar(i, 'years', +e.target.value)
                  }
                />

                <label>ค่าบำรุงรักษาเมื่อครบอายุ (ครั้งเดียว)</label>
                <input
                  type="text"
                  value={fmtInput(car.maintenanceAtEnd)}
                  onChange={e =>
                    updateCar(
                      i,
                      'maintenanceAtEnd',
                      parseInput(e.target.value)
                    )
                  }
                />

                <hr />
                <p className="text-lg">
                  🧮 รวม {car.years} ปี:{' '}
                  <b>{fmt(r.totalCost)}</b>
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </main>
  )
}
