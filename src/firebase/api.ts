import {
  UpdateData, DocumentReference, DocumentData,
} from '@firebase/firestore-types';

export interface QuerySnapshot {
  docs: any[],
}

export interface CollectionApi {
  add: (data: DocumentData) => Promise<{id: string}>,
  doc: (id: string) => {
    update: (data: UpdateData) => Promise<void>,
    delete: () => Promise<void>,
  }
  where: (a: string, b: string, c: string) => {
    get: () => Promise<QuerySnapshot>
  },
}

export interface Api {
  collection: (collectionName: string) => CollectionApi,
}
