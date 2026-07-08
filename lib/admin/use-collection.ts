"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
  type Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface DocRecord {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

/**
 * Ordena por createdAt descendente EN EL CLIENTE (no en la query).
 * Ojo: si usáramos orderBy("createdAt") en Firestore, cualquier documento sin
 * ese campo (importado, migrado o creado desde la consola) quedaría EXCLUIDO
 * del resultado y "desaparecería" del panel. Ordenando acá, todos aparecen.
 * Los que no tienen fecha (o tienen el serverTimestamp pendiente de un alta
 * recién hecha) van arriba, que es lo que uno espera ver primero.
 */
function createdAtMillis(rec: DocRecord): number {
  const ts = rec.createdAt as Timestamp | undefined;
  if (ts && typeof ts.toMillis === "function") return ts.toMillis();
  return Number.POSITIVE_INFINITY;
}

function byCreatedDesc(a: DocRecord, b: DocRecord): number {
  return createdAtMillis(b) - createdAtMillis(a);
}

/**
 * Realtime Firestore collection with CRUD helpers.
 * Subscribes via onSnapshot so the 3 socios see each other's changes live.
 */
export function useCollection(name: string) {
  const [data, setData] = useState<DocRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, name),
      (snapshot: QuerySnapshot<DocumentData>) => {
        const rows = snapshot.docs.map(
          (d: QueryDocumentSnapshot<DocumentData>) =>
            ({ id: d.id, ...d.data() }) as DocRecord,
        );
        rows.sort(byCreatedDesc);
        setData(rows);
        setLoading(false);
        setError(null);
      },
      (err: FirestoreError) => {
        setError(err.message);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [name]);

  const add = useCallback(
    (values: Record<string, unknown>) =>
      addDoc(collection(db, name), {
        ...values,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }),
    [name],
  );

  const update = useCallback(
    (id: string, values: Record<string, unknown>) =>
      updateDoc(doc(db, name, id), { ...values, updatedAt: serverTimestamp() }),
    [name],
  );

  const remove = useCallback(
    (id: string) => deleteDoc(doc(db, name, id)),
    [name],
  );

  return { data, loading, error, add, update, remove };
}
