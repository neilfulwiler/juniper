import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useEventListener } from "../../../utils";
import {
  completeTodo,
  deleteTodo as deleteTodoAction,
  ADD_TODOS,
} from "../../../redux/actions/todos";
import { State, Todo as TodoType, User } from "../../../types";
import db from "../../../firebase/firebase";

import CreateTodo from "./CreateTodo";
import Footer from "./Footer";
import Todo from "./Todo";

import "./styles.scss";

function useKeyBindings(addTodo: () => void): void {
  const handlePlus = useCallback(
    (e) => {
      if (e.key === "+") {
        addTodo();
      }
    },
    [addTodo]
  );

  useEventListener("keypress", handlePlus);
}

const Todos: React.FC<{}> = () => {
  const todos = useSelector<State, TodoType[]>((state) =>
    state.todos.ui.sortOrder.map((id) => state.todos.entities.byId[id])
  );
  const user = useSelector<State, User | undefined>(
    (state) => state.user.entity
  );
  const dispatch = useDispatch();
  const [editing, setEditing] = useState<string | undefined>(undefined);

  const addTodo = useCallback(() => {
    if (!user) {
      // put it into local storage?
      return;
    }

    // TODO move this into actions, have the action accept a callback with the
    // new ID
    // hard to put this into actions because I want to set editing equal to the
    // new id. I could put editing state into redux
    const prev = todos[todos.length - 1].id;
    db.collection("todos")
      .add({
        name: "",
        uid: user.uid,
        prev,
        next: null,
      })
      .then(({ id }: { id: string }) => {
        db.collection("todos")
          .doc(prev)
          .update({
            next: id,
          })
          .catch((reason) => {
            console.log(
              `failed to set on previous element for added todo: ${reason}`
            );
          });

        dispatch({
          type: ADD_TODOS,
          todos: [
            {
              name: "",
              id,
              prev,
              next: null,
            },
          ],
        });
        setEditing(id);
      });
  }, [todos, user, dispatch, setEditing]);

  const deleteTodo = useCallback(
    (id) => {
      dispatch(deleteTodoAction(id));
      if (id === editing) {
        setEditing(undefined);
      }
    },
    [dispatch, editing]
  );

  useKeyBindings(addTodo);

  return (
    <div className="todos">
      {todos.map(({ name, id, completed }) => (
        <Todo
          key={id}
          id={id}
          name={name}
          editing={id === editing}
          onDelete={() => deleteTodo(id)}
          onUpdateStatus={(update) => {
            dispatch(completeTodo(id, update));
          }}
          completed={completed}
        />
      ))}
      <Footer>
        <CreateTodo addTodo={addTodo} />
      </Footer>
    </div>
  );
};

export default Todos;
