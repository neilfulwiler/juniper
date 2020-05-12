import React, { useEffect, useState } from "react";
import firebase from "@firebase/app";
import "@firebase/auth";
import { makeStyles } from "@material-ui/core/styles";
import { useDispatch, useSelector } from "react-redux";

import { logIn, logOut } from "../../redux/actions/user";
import { State, User } from "../../types";

import "./styles.scss";

function signUp() {}

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  bullet: {
    display: "inline-block",
    margin: "0 2px",
    transform: "scale(0.8)",
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector<State, User | undefined>(
    (state) => state.user.entity
  );

  useEffect(() => {
    firebase.auth &&
      firebase.auth().onAuthStateChanged((currentUser: any) => {
        if (currentUser) {
          dispatch(logIn(currentUser as User));
        }
      });
  }, []);

  const content =
    user !== undefined ? (
      <div
        className="header-button"
        onClick={() => {
          firebase.auth &&
            firebase
              .auth()
              .signOut()
              .then(() => {
                dispatch(logOut());
              });
        }}
      >
        Sign Out
      </div>
    ) : (
      <>
        <div
          className="header-button"
          onClick={() =>
            firebase.auth &&
            firebase
              .auth()
              .signInWithPopup(new firebase.auth.GoogleAuthProvider())
              .then((result) => {
                dispatch(logIn(result.user as User));
              })
          }
        >
          Log In
        </div>
        <div>|</div>
        <div className="header-button" onClick={() => signUp()}>
          Sign Up
        </div>
      </>
    );

  return <div className="header">{content}</div>;
}
