const express = require('express');
const app = express();
const axios = require('axios');
const server =  app.listen(3000);
const io = require('socket.io')(server);
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));
let STATE = { isValid: true, since: 0 }

io.on('connection', (socket) => {
    socket.emit("state", STATE);
});

const fetchAPI = () => {
    return new Promise((resolve) => {
        axios.get('https://dev.fractal-it.fr:8443/fake_health_test?dynamic=true')
            .then(response => {
                if (response.data.status === 'error')
                    resolve({ error: true })
                else
                    resolve({ error: false })
            })
            .catch(error => {
                console.log("Looks like API is having trouble...")
                resolve({ error: true })
            });
    })
}

const sleep = (s) => {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

const checkAPI = async () => {

    while (true) {
        const res = await fetchAPI();
        if (res.error) {
            if (STATE.isValid === true)
                STATE = { isValid: false, since: 0 }
            else
                STATE.since++;
            if (STATE.since === 30)
                console.log('Sending error email')
            io.emit("state", STATE);
        }
        else {
            if (STATE.isValid === false) {
                STATE = { isValid: true, since: 0 }
            }
            io.emit("state", STATE);
            STATE.since++;
        }
        await sleep(1);
    }
}

checkAPI();
