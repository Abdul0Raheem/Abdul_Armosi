'use client';

import { useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface AdminCollectionPageProps {
  collectionName: 'users' | 'categories';
  title: string;
  columns: string[];
}

export function AdminCollectionPage({ collectionName, title, columns }: AdminCollectionPageProps) {
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadRows = async () => {
      setLoading(true);
      setError('');

      try {
        const collectionRef = collection(db, collectionName);
        const snapshot = collectionName === 'categories'
          ? await getDocs(query(collectionRef, orderBy('order', 'asc')))
          : await getDocs(collectionRef);

        setRows(snapshot.docs.map((document) => ({ id: document.id, ...document.data() })));
      } catch (err) {
        console.error(`Admin ${collectionName} load error`, err);
        setError(`Could not load ${collectionName}.`);
      } finally {
        setLoading(false);
      }
    };

    loadRows();
  }, [collectionName]);

  return (
    <div className="adm-page">
      <div style={{ marginBottom: 24 }}>
        <h1 className="adm-page-title">{title}</h1>
        <p className="adm-page-subtitle">Read-only overview from Firestore.</p>
      </div>

      {error && <div className="adm-error" style={{ marginBottom: 16 }}>{error}</div>}

      <div className="adm-card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div className="adm-empty">Loading...</div>
        ) : rows.length === 0 ? (
          <div className="adm-empty">No records found.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ background: 'var(--adm-primary-soft)' }}>
                  {columns.map((column) => (
                    <th
                      key={column}
                      style={{
                        padding: '12px 16px',
                        textAlign: 'left',
                        fontWeight: 700,
                        color: 'var(--adm-primary-dark)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={String(row.id)} style={{ borderTop: index === 0 ? 'none' : '1px solid var(--adm-line)' }}>
                    {columns.map((column) => (
                      <td key={column} style={{ padding: '12px 16px', color: 'var(--adm-ink)', verticalAlign: 'top' }}>
                        {String(row[column] ?? '')}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
