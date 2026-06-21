"use client"

import { useEffect, useState } from "react"
import { REFERENCE_USD_RATE } from "@/lib/admin/format"

const CACHE_KEY = "lumar_usd_oficial_venta"
const TTL_MS = 1000 * 60 * 60 * 6 // 6 horas

/**
 * Cotización del dólar OFICIAL (venta) desde dolarapi.com.
 * Cachea 6h en localStorage y cae al valor de referencia si falla.
 */
export function useDollarRate() {
  const [rate, setRate] = useState<number>(REFERENCE_USD_RATE)
  const [source, setSource] = useState<"vivo" | "cache" | "fallback">("fallback")

  useEffect(() => {
    try {
      const raw = localStorage.getItem(CACHE_KEY)
      if (raw) {
        const { rate: r, ts } = JSON.parse(raw)
        if (typeof r === "number" && r > 0 && Date.now() - ts < TTL_MS) {
          setRate(r)
          setSource("cache")
        }
      }
    } catch {
      /* ignore */
    }

    fetch("https://dolarapi.com/v1/dolares/oficial")
      .then((r) => r.json())
      .then((d) => {
        const venta = Number(d?.venta)
        if (venta > 0) {
          setRate(venta)
          setSource("vivo")
          try {
            localStorage.setItem(CACHE_KEY, JSON.stringify({ rate: venta, ts: Date.now() }))
          } catch {
            /* ignore */
          }
        }
      })
      .catch(() => {
        /* se queda con cache o fallback */
      })
  }, [])

  return { rate, source }
}
