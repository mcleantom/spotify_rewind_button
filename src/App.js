import React from "react";
import { useState, useEffect } from "react";
import {
    requestUserAuthorization,
    exchangeToken,
    getProfile,
    pauseSong,
    getCurrentlyPlaying,
    play,
    seekToPosition,
    getAccessToken
} from "./spotify_api";
import {
    Route, HashRouter as Router, Routes
} from "react-router-dom";

let playScratchSoundEffect = () => {
    const payload = {
            "uris": ["spotify:track:5XzfFGeU2GQf8bhOlKx0uD"],
            "position_ms": 0
    };
    return play(payload);
}


let playRewindSound = () => {
    getCurrentlyPlaying().then(data => {
        console.log(data);
        pauseSong().then(_ => {
            let audio = new Audio("/rewind_sound_effect.mp3");
            audio.play();
            seekToPosition(data.progress_ms - 10000);
            setTimeout(() => {
                play().then(_ => {
                    console.log("Playing");
                });
            }, 2000);
        });
    });
};

const playS = () => {
    playScratchSoundEffect().then(_ => {
        console.log("Playing");
    });
}

const MainPage = () => {
    const accessToken = getAccessToken();

    if (accessToken === '') {
        requestUserAuthorization();
    }

    const divStyle = {
        backgroundColor: 'black',
        height: '100vh', // 100% of the viewport height
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const buttonStyle = {
        backgroundColor: 'white',
        color: 'black',
        padding: '20px', // Adjust the size as needed
        borderRadius: '50%', // Make it round
        fontSize: '24px', // Adjust the font size as needed
        width: '200px',
        height: '200px',
        fontWeight: 'bold',
    };

    return (
        <div style={divStyle}>
            <button style={buttonStyle} onClick={playRewindSound}>
                REWIND
            </button>
        </div>
    );
};

const UserAuthRedirectEndpoint = () => {
    exchangeToken().then(_ => {
       window.location.href = "/";
    });
}

const App = () => {
    return (
        <Routes>
            <Route exact path="/" element={<MainPage/>}/>
            <Route path="/redirect" element={<UserAuthRedirectEndpoint/>}/>
        </Routes>
    )
}

export default App;
