import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import firebase from '@firebase/app';
import { logIn, logOut } from './redux/actions';


function signUp() {

}

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  useEffect(() => {
    firebase.auth().onAuthStateChanged((currentUser) => {
      if (currentUser) {
        dispatch(logIn(currentUser));
      }
    });
  });

  const content = user !== undefined
    ? (
      <div
        className="header-button"
        onClick={() => {
          firebase.auth().signOut().then(() => {
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
          onClick={() => firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
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
