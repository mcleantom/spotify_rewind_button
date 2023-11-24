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

const App = () => {
    const accessToken = getAccessToken();

    if (accessToken === '') {
        requestUserAuthorization();
    }

    const [profile, setProfile] = useState(null);

    useEffect(() => {
        function fetchData() {
            console.log("Fetching data");
            getProfile().then(profile => {
                console.log(profile);
                setProfile(profile);
            });
        }
        fetchData();
    }, []);

    return (
        <div>
            <button onClick={requestUserAuthorization}>Login</button>
            <button onClick={exchangeToken}>Get Token</button>
            <button onClick={playRewindSound}>Rewind</button>
            <p>{accessToken}</p>
        </div>
    );
}

export default App;
