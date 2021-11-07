import React from "react";
import ReactDOM from 'react-dom';
import CreateRoomPage from "./CreateRoomPage";
import HomePage from "./HomePage";
import RoomJoinPage from "./RoomJoinPage";

const App = () => {
    return ( 
        <div className="center">
        <HomePage />
        </div>
     );
}
 
export default App;

const appDiv = document.getElementById("app");
ReactDOM.render(<App />, appDiv);