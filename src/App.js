import { useEffect, useState } from 'react';
import './App.css';
import { io } from 'socket.io-client';


function App() {
  const [state, setState] = useState({isValid: true, since: 0}); 
  useEffect(() => {
    const socket = io();
    socket.on("state", setState)
  }, [setState])
  return (
    <div className={state.isValid == true ? "valid" : "invalid"}>
      Status : {state.isValid == true ? "Connected" : "Error"} since {state.since}s
    </div>
  );
}

export default App;
