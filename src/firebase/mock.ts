import {
  UpdateData, DocumentReference, DocumentData,
} from '@firebase/firestore-types';
import { Api, CollectionApi, QuerySnapshot } from './api';

function immediatePromise<T>(t: T): Promise<T> {
  const promise = new Promise<T>(
    (resolve: ((t: T) => void)) => resolve(t),
  );
  return promise;
}

class MockDocument {
  id: string;

  constructor(id: string) {
    this.id = id;
  }

  update: (data: UpdateData) => Promise<void> = () => immediatePromise(undefined);

  delete: () => Promise<void> = () => immediatePromise(undefined);
}

class MockCollection implements CollectionApi {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  add: (data: DocumentData) => Promise<{id: string}> = () => immediatePromise({ id: 'new-id' })

  doc: (id: string) => MockDocument = (id: string) => new MockDocument(id);

  where: (a: string, b: string, c: string) => {get: () => Promise<QuerySnapshot>} =
    () => ({ get: () => immediatePromise({ docs: [] }) });
}

class Mock implements Api {
  collection: (name: string) => CollectionApi = (name: string) => new MockCollection(name);
}

export default new Mock();
