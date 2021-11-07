import React, { useState } from "react";
import Button from "@material-ui/core/Button";
import Grid from "@material-ui/core/Grid";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import { Link, useHistory } from "react-router-dom";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import { Collapse } from "@material-ui/core";
import Alert from "@material-ui/lab/Alert";

const CreateRoomPage = (props) => {

  console.log(props);

    const blankFunc = () => {};

    const update = props.update || false;
    const roomCode = props.roomCode || null;
    const updateCallback = props.updateCallback || blankFunc;

    const [userRequest, setUserRequest] = useState(
      {
        guest_can_pause : props.guest_can_pause || true,
        votes_to_skip : props.votes_to_skip || 1,
        errorMsg : "",
        successMsg: ""
      })

    // const [guest_can_pause, setGuest_can_pause] = useState(props.guest_can_pause || true);
    console.log(props, props.guest_can_pause, userRequest.guest_can_pause, update, roomCode, updateCallback);
    // const [votes_to_skip, setVotes_to_skip] = useState(props.votes_to_skip || 1);
    // const [errorMsg, setErrorMsg] = useState("");
    // const [successMsg, setSuccessMsg] = useState("");
    const history = useHistory();

    const handleVotesChange  = (e) => {
      setUserRequest({...userRequest, votes_to_skip : e.target.value});
    }
     
    const handleGuestCanPauseChange  = (e) => {
        if(e.target.value === "true"){
          setUserRequest({...userRequest, guest_can_pause : true});
        }
        else{
          setUserRequest({...userRequest, guest_can_pause : false});
        }
    }

     const handleRoomButtonPressed = () => {
        const requestOptions = {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            votes_to_skip : userRequest.votes_to_skip,
            guest_can_pause : userRequest.guest_can_pause
          }),
        };
        fetch("/api/create-room", requestOptions)
          .then((response) => response.json())
          .then((data) => history.push(`/room/${data.code}`));
      }

      const handleUpdateButtonPressed = () => {
        const requestOptions = {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            votes_to_skip: userRequest.votes_to_skip,
            guest_can_pause: userRequest.guest_can_pause,
            code: roomCode,
          }),
        }
        fetch("/api/update-room", requestOptions)
        .then((response) => {
          if (response.ok) {
            setUserRequest({...userRequest, successMsg : "Room updated successfully!"});
          } else {
            setUserRequest({...userRequest, errorMsg : "Error updating room..."});
          }
          updateCallback();
        });
      }

      const renderCreateButtons = () => {
        return (
          <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <Button
                color="primary"
                variant="contained"
                onClick={handleRoomButtonPressed}
              >
                Create A Room
              </Button>
            </Grid>
            <Grid item xs={12} align="center">
              <Button color="secondary" variant="contained" to="/" component={Link}>
                Back
              </Button>
            </Grid>
          </Grid>
        );
      }

      const renderUpdateButtons = () => {
        return (
          <Grid item xs={12} align="center">
            <Button
              color="primary"
              variant="contained"
              onClick={handleUpdateButtonPressed}
            >
              Update Room
            </Button>
          </Grid>
        );
      }

    return ( 
        <Grid container spacing={1}>
            <Grid item xs={12} align="center">
              <Collapse
                in={userRequest.errorMsg != "" || userRequest.successMsg != ""}
              >
                {userRequest.successMsg != "" ? (
                  <Alert
                    severity="success"
                    onClose={() => {
                      setUserRequest({...userRequest, successMsg : ""});
                    }}
                  >
                    {userRequest.successMsg}
                  </Alert>
                ) : (
                  <Alert
                    severity="error"
                    onClose={() => {
                      setUserRequest({...userRequest, errorMsg : ""});
                    }}
                  >
                    {userRequest.errorMsg}
                  </Alert>
                )}
              </Collapse>
            </Grid>
            <Grid item xs={12} align="center">
            <Typography component="h4" variant="h4">
                {update ? "Update Room" : "Create a Room"}
            </Typography>
            </Grid>
        <Grid item xs={12} align="center">
          <FormControl component="fieldset">
            <FormHelperText component="div">
              <div align="center">Guest Control of Playback State</div>
            </FormHelperText>
            <RadioGroup
              row
              value={userRequest.guest_can_pause.toString()}
              defaultValue={userRequest.guest_can_pause.toString()}
              onChange={handleGuestCanPauseChange}
            >
              <FormControlLabel
                value="true"
                control={<Radio color="primary" />}
                label="Play/Pause"
                labelPlacement="bottom"
              />
              <FormControlLabel
                value="false"
                control={<Radio color="secondary" />}
                label="No Control"
                labelPlacement="bottom"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Grid item xs={12} align="center">
          <FormControl>
            <TextField
              required={true}
              type="number"
              onChange={handleVotesChange}
              defaultValue={userRequest.votes_to_skip}
              inputProps={{
                min: 1,
                style: { textAlign: "center" },
              }}
            />
            <FormHelperText component="div">
              <div align="center">Votes Required To Skip Song</div>
            </FormHelperText>
          </FormControl>
        </Grid>
        {update ? renderUpdateButtons() : renderCreateButtons()}
      </Grid>
     );
}
 
export default CreateRoomPage;