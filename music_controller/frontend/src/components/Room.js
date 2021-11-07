import React, { useState, useEffect } from "react";
import { Grid, Button, Typography } from "@material-ui/core";
import { Link, useHistory} from "react-router-dom";
import { useParams } from "react-router";
import CreateRoomPage from "./CreateRoomPage";
import { render } from "react-dom";

const Room = (props) => {

    // const [guest_can_pause, setGuest_can_pause] = useState(false);
    // const [isHost, setIsHost] = useState(false);
    // const [votes_to_skip, setVotes_to_skip] = useState(2);
    
    const [userRequest, setUserRequest] = useState(
      {
        guest_can_pause : false,
        isHost: false,
        votes_to_skip : 2,
        showSettings : false,
        spotifyAuthenticated: false
      })
    const history = useHistory();
    const { roomCode } = useParams();

    useEffect(() => {

        const abortCont = new AbortController();

        fetch(`/api/get-room?code=${roomCode}`, {signal : abortCont.signal })
          .then((response) => {
            if (!response.ok) {
              console.log(response);
              props.leaveRoomCallback();
              props.history.push("/");
            }
            console.log('in room.js ', response);
            return response.json();
          })
          .then((data) => {
            // console.log(typeof data);
            // console.log("isHost = ", data.isHost);
            // console.log(typeof guest_can_pause);
            // console.log("guest_can_pause = ", typeof data.guest_can_pause);
            // setVotes_to_skip(data.votes_to_skip);
            // setGuest_can_pause(data.guest_can_pause);
            // setIsHost(data.isHost);
            console.log(data)
            setUserRequest(
              {
                ...userRequest,
                votes_to_skip : data.votes_to_skip,
                guest_can_pause : data.guest_can_pause,
                isHost : data.isHost
              })
              // homeCallBack();
              if (userRequest.isHost) {
                authenticateSpotify();
              }
          })
          .catch(err => {
            if(err.name == "AbortError"){
              props.leaveRoomCallback();
              props.history.push("/");
            }
            else{
              console.log(err.name);
            }
          });

          return () => abortCont.abort();

      }, [userRequest.guest_can_pause, userRequest.isHost, userRequest.votes_to_skip, userRequest.showSettings, userRequest.spotifyAuthenticated]);

      const callsBack = () => {
        
        fetch(`/api/get-room?code=${roomCode}`)
          .then((response) => {
            if (!response.ok) {
              console.log(response);
              props.leaveRoomCallback();
              props.history.push("/");
            }
            // console.log(response);
            return response.json();
          })
          .then((data) => {
            setUserRequest(
              {
                ...userRequest,
                votes_to_skip : data.votes_to_skip,
                guest_can_pause : data.guest_can_pause,
                isHost : data.isHost
              })
              
              // if (isHost) {
              //   authenticateSpotify();
              // }
          })
          .catch(err => {
            if(err.name == "AbortError"){
              props.leaveRoomCallback();
              props.history.push("/");
            }
            else{
              console.log(err.name);
            }
          });
      }

      const authenticateSpotify = () => {
        fetch("/spotify/is-authenticated")
          .then((response) => response.json())
          .then((data) => {
            setUserRequest({ ...userRequest, spotifyAuthenticated: data.status });
            console.log(data.status);
            if (!data.status) {
              fetch("/spotify/get-auth-url")
                .then((response) => {
                  console.log(response);
                  return response.json()
                })
                .then((data) => {
                  console.log(data);
                  // homeCallBack();
                  alert("stop")
                  window.location.replace(data.url);
                  // homeCallBack();
                });
            }
          });
      }

      // const homeCallBack = () => {
      //   // alert("roomcode", roomCode)
      //   console.log(roomCode)
      //   props.setRoomCode(roomCode);
      // }

      const leaveButtonPressed = () => {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        };
        fetch(`/api/leave-room?code=${roomCode}`, requestOptions)
        .then((_response) => {
          props.leaveRoomCallback();
          props.history.push("/");
        });
      }

      const {votes_to_skip, guest_can_pause, isHost, showSettings} = userRequest;

      const updateShowSettings = (value) => {
        // console.log(userRequest);
        setUserRequest({
          ...userRequest,
          showSettings: value,
        });
      }

      const renderSettings = () => {
        // console.log(showSettings)
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <CreateRoomPage
                update={true}
                votes_to_skip={votes_to_skip}
                guest_can_pause={guest_can_pause}
                roomCode={roomCode}
                updateCallback={callsBack}
              />
            </Grid>
            <Grid item xs={12} align="center">
              <Button
                variant="contained"
                color="secondary"
                onClick={() => updateShowSettings(false)}
              >
                Close
              </Button>
            </Grid>
          </Grid>
        );
      }

      const renderSettingsButton = () => {
        return (
          <Grid item xs={12} align="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => updateShowSettings(true)}
            >
              Settings
            </Button>
          </Grid>
        );
      }

    if(showSettings){
      return renderSettings();
    }
    return ( 
      <Grid container spacing={1}>
      <Grid item xs={12} align="center">
        <Typography variant="h4" component="h4">
          Code: {roomCode}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Votes: {votes_to_skip}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Guest Can Pause: {guest_can_pause.toString()}
        </Typography>
      </Grid>
      <Grid item xs={12} align="center">
        <Typography variant="h6" component="h6">
          Host: {isHost.toString()}
        </Typography>
      </Grid>
      {isHost ? renderSettingsButton() : null}
      <Grid item xs={12} align="center">
        <Button
          variant="contained"
          color="secondary"
          onClick={leaveButtonPressed}
        >
          Leave Room
        </Button>
      </Grid>
    </Grid>
     );
}
 
export default Room;