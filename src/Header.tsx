import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebase from '@firebase/app';
import '@firebase/auth';
import { logIn, logOut } from './redux/actions';
import { State, User } from './types';


function signUp() {

}

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector<State, User | undefined>((state) => state.user);

  useEffect(() => {
    firebase.auth && firebase.auth().onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        dispatch(logIn(currentUser as User));
      }
    });
  });

  const content = user !== undefined
    ? (
      <div
        className="header-button"
        onClick={() => {
          firebase.auth && firebase.auth().signOut().then(() => {
            dispatch(logOut());
          });
        }}
      >
      Sign Out
      </div>
    )
    : (
      <>
        <div
          className="header-button"
          onClick={() => firebase.auth && firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
            dispatch(logIn(result.user));
          })}
        >
          Log In
        </div>
        <div>|</div>
        <div
          className="header-button"
          onClick={() => signUp()}
        >
          Sign Up
        </div>
      </>
    );

  return (
    <div className="header">
      {content}
    </div>
  );
}