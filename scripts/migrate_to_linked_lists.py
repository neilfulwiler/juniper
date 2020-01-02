import argparse
from functools import wraps
from itertools import groupby
import pickle

import firebase_admin
from firebase_admin import firestore

firebase_admin.initialize_app()

db = firestore.client()


def pickled(filename):
    def decorator(delegate):
        @wraps(delegate)
        def wrapper(*args, **kwargs):
            try:
                with open(filename, 'rb') as f:
                    return pickle.load(f)
            except FileNotFoundError:
                pass

            result = delegate(*args, **kwargs)

            with open(filename, 'wb') as f:
                pickle.dump(result, f)

            return result

        return wrapper

    return decorator


@pickled('todos.pickle')
def get_todos():
    return {
        doc.id: doc.to_dict()
        for doc in
        db.collection(u'todos').stream()
    }


def make_linked_list(args):
    if args.commit:
        batch = db.batch()

    todos_by_id = get_todos()

    def print_link(todo, prev, next):
        prev = todos_by_id[prev]['name'] if prev is not None else 'None'
        next = todos_by_id[next]['name'] if next is not None else 'None'
        print('%s <= %s => %s' % (prev, todo['name'], next))

    todos_by_id = get_todos()
    print(len(todos_by_id))
    for uid, todos in groupby(
        sorted(todos_by_id.items(), key=lambda x: x[1]['uid']),
        key=lambda x: x[1]['uid'],
    ):
        todos_sorted = sorted(todos, key=lambda x: x[1]['sortOrder'])
        for idx, (id, todo) in enumerate(todos_sorted):

            if idx > 0:
                prev_id, _ = todos_sorted[idx - 1]
            else:
                prev_id = None
            if idx < len(todos_sorted) - 1:
                next_id, _ = todos_sorted[idx + 1]
            else:
                next_id = None

            if not args.commit:
                print_link(todo, prev_id, next_id)
            else:
                ref = db.collection(u'todos').document(id)
                batch.update(ref, {
                    u'prev': prev_id,
                    u'next': next_id,
                })

    if args.commit:
        batch.commit()


def _parse_args():
    parser = argparse.ArgumentParser()
    parser.add_argument('--commit', action='store_true')
    return parser.parse_args()


def main():
    args = _parse_args()
    make_linked_list(args)


if __name__ == '__main__':
    main()
