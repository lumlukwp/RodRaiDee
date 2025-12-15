'use client'

import { useState } from 'react'

/* ===== helper สำหรับ format ตัวเลข ===== */
const fmt = (n: number) =>
  n.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })

/* ===== preset type ===== */
type Powertrain = 'ICE' | 'Hybrid' | 'EV'

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
    insurance: 35000,
    maintenance: 4000,
    registration: 500,
    resalePct: 10,
    miscellaneous: 0,
    fuelPerKm: 0.8,
    maintenanceAtEnd: 300000,
  },
}

/* ===== type รถหนึ่งคัน ===== */
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
  fuelPerKm: number
}

/* ===== ค่าเริ่มต้น ===== */
const defaultCar = (index: number): CarInput => {
  const p = PRESETS.ICE
  return {
    name: `Car ${index + 1}`,
    powertrain: 'ICE',
    carPrice: 1000000,
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
    fuelPerKm: p.fuelPerKm,
  }
}

export default function Home() {
  const [cars, setCars] = useState<CarInput[]>([defaultCar(0)])

  /* ===== helpers ===== */
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

  const removeCar = (index: number) => {
    setCars(cars.filter((_, i) => i !== index))
  }

  /* ===== calculation ===== */
  const calculate = (car: CarInput) => {
    const netCarPrice =
      car.carPrice - car.discount - car.otherDiscount

    const fuelPerYear = car.fuelPerKm * car.kmPerYear

    const yearlyCost =
      car.insurance +
      car.maintenance +
      car.registration +
      car.miscellaneous +
      fuelPerYear

    const resaleValue = car.carPrice * (car.resalePct / 100)

    const totalCost =
      netCarPrice + yearlyCost * car.years + car.maintenanceAtEnd - resaleValue

    return {
      netCarPrice,
      fuelPerYear,
      yearlyCost,
      resaleValue,
      totalCost,
    }
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cars.map((car, i) => {
          const r = calculate(car)

          return (
            <div key={i} className="border rounded p-4 shadow space-y-2">
              {/* name + remove */}
              <div className="flex justify-between items-center">
                <input
                  className="text-xl font-semibold w-full"
                  value={car.name}
                  onChange={e => updateCar(i, 'name', e.target.value)}
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

              {/* ===== preset ===== */}
              <label>ประเภทระบบขับเคลื่อน</label>
              <div className="flex gap-2">
                <select
                  value={car.powertrain}
                  onChange={e => {
                    const pt = e.target.value as Powertrain
                    const p = PRESETS[pt]
                    updateCarBulk(i, {
                      powertrain: pt,
                      insurance: p.insurance,
                      maintenance: p.maintenance,
                      registration: p.registration,
                      resalePct: p.resalePct,
                      miscellaneous: p.miscellaneous,
                      fuelPerKm: p.fuelPerKm,
                      maintenanceAtEnd: p.maintenanceAtEnd,
                    })
                  }}
                >
                  <option value="ICE">ICE (น้ำมัน)</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="EV">EV</option>
                </select>

                <button
                  className="px-2 border rounded"
                  onClick={() => {
                    const p = PRESETS[car.powertrain]
                    updateCarBulk(i, {
                      insurance: p.insurance,
                      maintenance: p.maintenance,
                      registration: p.registration,
                      miscellaneous: p.miscellaneous,
                      fuelPerKm: p.fuelPerKm,
                      maintenanceAtEnd: p.maintenanceAtEnd,
                    })
                  }}
                >
                  🔄 Reset
                </button>
              </div>

              <hr />

              <label>ค่ารถเริ่มต้น</label>
              <input
                type="number"
                value={car.carPrice}
                onChange={e => updateCar(i, 'carPrice', +e.target.value)}
              />

              <label>ส่วนลด</label>
              <input
                type="number"
                value={car.discount}
                onChange={e => updateCar(i, 'discount', +e.target.value)}
              />

              <label>ส่วนลดอื่น ๆ</label>
              <input
                type="number"
                value={car.otherDiscount}
                onChange={e => updateCar(i, 'otherDiscount', +e.target.value)}
              />

              <label>% ราคาขายต่อ</label>
              <input
                type="number"
                value={car.resalePct}
                onChange={e => updateCar(i, 'resalePct', +e.target.value)}
              />

              <label>ระยะขับต่อปี (กม.)</label>
              <input
                type="number"
                value={car.kmPerYear}
                onChange={e => updateCar(i, 'kmPerYear', +e.target.value)}
              />

              <label>จำนวนปีที่จะใช้รถ</label>
              <input
                type="number"
                value={car.years}
                onChange={e => updateCar(i, 'years', +e.target.value)}
              />

              <hr />

              <label>ค่าประกันต่อปี</label>
              <input
                type="number"
                value={car.insurance}
                onChange={e => updateCar(i, 'insurance', +e.target.value)}
              />

              <label>ซ่อมบำรุงต่อปี</label>
              <input
                type="number"
                value={car.maintenance}
                onChange={e => updateCar(i, 'maintenance', +e.target.value)}
              />

              <label>ต่อทะเบียน (ภาษีและพรบ.)</label>
              <input
                type="number"
                value={car.registration}
                onChange={e => updateCar(i, 'registration', +e.target.value)}
              />

              <label>ค่าใช้จ่ายอื่น ๆ ต่อปี</label>
              <input
                type="number"
                value={car.miscellaneous}
                onChange={e => updateCar(i, 'miscellaneous', +e.target.value)}
              />

              <label>ค่าเชื้อเพลิง (บาท/กม.)</label>
              <input
                type="number"
                step="0.01"
                value={car.fuelPerKm}
                onChange={e => updateCar(i, 'fuelPerKm', +e.target.value)}
              />

              <label>ค่าบำรุงรักษาเมื่อครบอายุ (ครั้งเดียว)</label>
              <input
                type="number"
                value={car.maintenanceAtEnd}
                onChange={e =>
                  updateCar(i, 'maintenanceAtEnd', +e.target.value)
                }
              />

              <hr />

              <p>💰 ราคาซื้อสุทธิ: <b>{fmt(r.netCarPrice)}</b></p>
              <p>⛽ ค่าเชื้อเพลิง/ปี: <b>{fmt(r.fuelPerYear)}</b></p>
              <p>📅 ค่าใช้จ่าย/ปี: <b>{fmt(r.yearlyCost)}</b></p>
              <p>🔁 ราคาขายต่อ: <b>{fmt(r.resaleValue)}</b></p>
              <p className="text-lg">
                🧮 รวม {car.years} ปี: <b>{fmt(r.totalCost)}</b>
              </p>
            </div>
          )
        })}
      </div>
    </main>
  )
}
