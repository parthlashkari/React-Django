import React, { useState, useEffect } from "react";
import { Grid, Button, ButtonGroup, Typography } from "@material-ui/core";
import {
    BrowserRouter as Router,
    Route,
    Switch,
    Link,
    Redirect
} from 'react-router-dom';
import CreateRoomPage from "./CreateRoomPage";
import Room from "./Room";
import RoomJoinPage from "./RoomJoinPage";

const HomePage = () => {

    const [roomCode, setRoomCode] = useState(null);

    useEffect(() => {
        const abortCont = new AbortController();
        fetch("/api/user-in-room", {signal : abortCont.signal })
          .then((response) => {
            return response.json();
            console.log(response);
          })
          .then((data) => {
            // console.log(data, roomCode)
            setRoomCode(data.code);
            console.log(data, roomCode, data.code, data.host)
          });

          return () => abortCont.abort();

      }, []);

    const renderHomePage = () => {
        return (
          <Grid container spacing={3}>
            <Grid item xs={12} align="center">
              <Typography variant="h3" compact="h3">
                House Party
              </Typography>
            </Grid>
            <Grid item xs={12} align="center">
              <ButtonGroup disableElevation variant="contained" color="primary">
                <Button color="primary" to="/join" component={Link}>
                  Join a Room
                </Button>
                <Button color="secondary" to="/create" component={Link}>
                  Create a Room
                </Button>
              </ButtonGroup>
            </Grid>
          </Grid>
        );
      }

      const clearRoomCode = () => {
        setRoomCode(null);
      }

    return ( 
        <Router>
            <Switch>
                <Route
                exact
                path="/"
                render={() => {
                return roomCode ? (
                    <Redirect to={`/room/${roomCode}`} />
                ) : (
                    renderHomePage()
                );
                }}
                />
                <Route path = "/join">
                    <RoomJoinPage />
                </Route>
                <Route path = "/create">
                    <CreateRoomPage />
                </Route>
                <Route
                    path="/room/:roomCode"
                    render={(props) => {
                    return <Room {...props} leaveRoomCallback={clearRoomCode} setRoomCode = {setRoomCode}/>;
                    }}
                />
                <Route path='*'>
                    <HomePage />
                </Route>
            </Switch>
        </Router>
     );
}
 
export default HomePage;