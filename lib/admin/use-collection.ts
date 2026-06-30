"use client";

import { useCallback, useEffect, useState } from "react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  type DocumentData,
  type FirestoreError,
  type QueryDocumentSnapshot,
  type QuerySnapshot,
} from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export interface DocRecord {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
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
    const q = query(collection(db, name), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        setData(
          snapshot.docs.map(
            (d: QueryDocumentSnapshot<DocumentData>) =>
              ({ id: d.id, ...d.data() }) as DocRecord,
          ),
        );
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
