import React, { useEffect, useState } from 'react';
import firebase from '@firebase/app';
import '@firebase/auth';
import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import IconButton from '@material-ui/core/IconButton';
import Popper from '@material-ui/core/Popper';
import { makeStyles } from '@material-ui/core/styles';
import AppsIcon from '@material-ui/icons/Apps';
import ListAltIcon from '@material-ui/icons/ListAlt';
import NotesIcon from '@material-ui/icons/Notes';
import Typography from '@material-ui/core/Typography';
import { useDispatch, useSelector } from 'react-redux';

import { changeApp } from '../redux/actions/nav';
import { logIn, logOut } from '../redux/actions/user';
import { State, User } from '../types';


function signUp() {

}

const useStyles = makeStyles({
  card: {
    minWidth: 275,
  },
  bullet: {
    display: 'inline-block',
    margin: '0 2px',
    transform: 'scale(0.8)',
  },
  title: {
    fontSize: 14,
  },
  pos: {
    marginBottom: 12,
  },
});

const AppList: React.FC<{anchorEl: HTMLElement}> = ({ anchorEl }: {anchorEl: HTMLElement}) => {
  const dispatch = useDispatch();
  const classes = useStyles();
  const bull = <span className={classes.bullet}>•</span>;

  return (
    <Popper open anchorEl={anchorEl}>
      <Card>
        <CardContent>
          <IconButton onClick={() => dispatch(changeApp('Todos'))}>
            <ListAltIcon />
          </IconButton>

          <IconButton onClick={() => dispatch(changeApp('Notes'))}>
            <NotesIcon />
          </IconButton>

          <Typography className={classes.title} color="textSecondary" gutterBottom>
              Word of the Day
          </Typography>
          <Typography variant="h5" component="h2">
              be
            {bull}
  nev
            {bull}
  o
            {bull}
  lent
          </Typography>
          <Typography className={classes.pos} color="textSecondary">
              adjective
          </Typography>
          <Typography variant="body2" component="p">
              well meaning and kindly.
            <br />
              "a benevolent smile"
          </Typography>
        </CardContent>
      </Card>
    </Popper>
  );
};

export default function Header() {
  const dispatch = useDispatch();
  const user = useSelector<State, User | undefined>((state) => state.user.entity);
  const [appListButtonEl, setAppListButtonEl] = useState<HTMLElement | null>(null);
  const [showAppsList, setShowAppsList] = useState(false);

  useEffect(() => {
    firebase.auth && firebase.auth().onAuthStateChanged((currentUser: any) => {
      if (currentUser) {
        dispatch(logIn(currentUser as User));
      }
    });
  });

  const content = user !== undefined
    ? (
      <>
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
        <div className="header-button">
          <IconButton ref={(el) => appListButtonEl !== el && setAppListButtonEl(el)} onClick={() => setShowAppsList(!showAppsList)}>
            <AppsIcon />
          </IconButton>
        </div>
        {showAppsList && appListButtonEl && <AppList anchorEl={appListButtonEl} />}
      </>
    )
    : (
      <>
        <div
          className="header-button"
          onClick={() => firebase.auth && firebase.auth().signInWithPopup(new firebase.auth.GoogleAuthProvider()).then((result) => {
            dispatch(logIn(result.user as User));
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
