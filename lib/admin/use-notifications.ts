"use client"

import { useCallback, useEffect, useState } from "react"
import {
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  type DocumentData,
  type QueryDocumentSnapshot,
} from "firebase/firestore"
import { db } from "@/lib/firebase/client"

export type NotifTipo = "vencimiento" | "cobro" | "tarea"

export interface Notificacion {
  id: string
  tipo: NotifTipo
  titulo: string
  cuerpo: string
  href?: string
  creadoEn: Date | null
  leidoPor: string[]
}

export function useNotifications(userEmail: string | null | undefined) {
  const [notificaciones, setNotificaciones] = useState<Notificacion[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, "notificaciones"), orderBy("creadoEn", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setNotificaciones(
        snap.docs.map((d: QueryDocumentSnapshot<DocumentData>) => {
          const data = d.data()
          return {
            id: d.id,
            tipo: (data.tipo ?? "vencimiento") as NotifTipo,
            titulo: String(data.titulo ?? ""),
            cuerpo: String(data.cuerpo ?? ""),
            href: data.href as string | undefined,
            // Firestore Timestamp → JS Date
            creadoEn: data.creadoEn?.toDate?.() ?? null,
            leidoPor: (data.leidoPor ?? []) as string[],
          }
        }),
      )
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const unreadCount = userEmail
    ? notificaciones.filter((n) => !n.leidoPor.includes(userEmail)).length
    : 0

  const markRead = useCallback(
    async (id: string) => {
      if (!userEmail) return
      await updateDoc(doc(db, "notificaciones", id), {
        leidoPor: arrayUnion(userEmail),
      })
    },
    [userEmail],
  )

  const markAllRead = useCallback(async () => {
    if (!userEmail) return
    const unread = notificaciones.filter((n) => !n.leidoPor.includes(userEmail))
    await Promise.all(
      unread.map((n) =>
        updateDoc(doc(db, "notificaciones", n.id), {
          leidoPor: arrayUnion(userEmail),
        }),
      ),
    )
  }, [notificaciones, userEmail])

  return { notificaciones, loading, unreadCount, markRead, markAllRead }
}

/**
 * Creates a notification only if it doesn't already exist (based on dedupeKey).
 * existingIds: the set of IDs already in the collection (from the realtime subscription).
 */
export async function ensureNotification(
  dedupeKey: string,
  existingIds: Set<string>,
  data: { tipo: NotifTipo; titulo: string; cuerpo: string; href?: string },
) {
  if (existingIds.has(dedupeKey)) return
  await setDoc(doc(db, "notificaciones", dedupeKey), {
    ...data,
    leidoPor: [],
    creadoEn: serverTimestamp(),
  })
}
