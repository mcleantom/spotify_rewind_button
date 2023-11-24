const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint32Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

const makeCookie = (name, value, duration_s) => {
    const now = new Date();
    let time = now.getTime();
    time += duration_s * 1000;
    now.setTime(time);
    let expires = "expires=" + now.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

const maybeGetCookie = (name) => {
    let cookies = document.cookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i].trim();
        if (cookie.startsWith(name)) {
            return cookie.substring(name.length + 1);
        }
    }
    return '';
}

const setAccessToken = (token) => {
    const duration_1_hour = 60 * 60;
    makeCookie('access_token', token, duration_1_hour);
}

const refreshAccessToken = (_) => {
    let refreshToken = localStorage.getItem('refresh_token');
    const url = 'https://accounts.spotify.com/api/token';
    const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken,
          client_id: clientId,
        }),
    }
    fetch(url, payload)
        .then(response => response.json())
        .then(data => {
            setAccessToken(data.access_token);
        })
        .catch(error => console.error(error));
}

export const getAccessToken = (_) => {
    let accessToken = maybeGetCookie('access_token');
    if (accessToken === '') {
        refreshAccessToken();
        return maybeGetCookie('access_token');
    } else {
        return accessToken;
    }
}


const sha256 = (plain) => {
    const encoder = new TextEncoder();
    const data = encoder.encode(plain);
    return window.crypto.subtle.digest('SHA-256', data);
}

const base64encode = (input) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

const areWeOnLocalhost = () => {
    return window.location.hostname === "localhost";
}

const clientId = '63013162bacc41f29f68ce6114ae395b';

let redirectUri = '';
if (areWeOnLocalhost()) {
    redirectUri = "http://localhost:3031/redirect"
}
else {
    redirectUri = "https://mcleantom.github.io/spotify_rewind_button/redirect"
}

const scope = 'user-read-private user-read-email user-modify-playback-state user-read-currently-playing';
const authUrl = new URL('https://accounts.spotify.com/authorize');

export const requestUserAuthorization = async () => {
    const codeVerifier = generateRandomString(128);
    const hashed = await sha256(codeVerifier);
    const codeChallenge = base64encode(hashed);
    window.localStorage.setItem('code_verifier', codeVerifier);
    const params =  {
          response_type: 'code',
          client_id: clientId,
          scope,
          code_challenge_method: 'S256',
          code_challenge: codeChallenge,
          redirect_uri: redirectUri,
    }

    authUrl.search = new URLSearchParams(params).toString();
    window.location.href = authUrl.toString();
}


export const exchangeToken = async _ => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const url = 'https://accounts.spotify.com/api/token';
    let codeVerifier = window.localStorage.getItem('code_verifier');
    const payload = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          client_id: clientId,
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier,
        }),
    }

    const body = await fetch(url, payload).catch(error => console.error(error));
    const response = await body.json();
    console.log(response);
    setAccessToken(response.access_token);
}


export async function getProfile() {
  let accessToken = localStorage.getItem('access_token');

  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: 'Bearer ' + accessToken
    }
  });

    const data = await response.json();
    return data;
}


export const pauseSong = async () => {
    console.log("Pausing");
    let accessToken = getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    return response.status;
}


export const getCurrentlyPlaying = async () => {
    let accessToken = getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/player/currently-playing', {
        method: 'GET',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    const data = await response.json();
    return data;
}

export const play = async () => {
    console.log("Playing");
    let accessToken = getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/player/play', {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    return response.status;
}

export const seekToPosition = async (position) => {
    console.log("Seeking to position " + position);
    let accessToken = getAccessToken();
    const response = await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + position, {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    return response.status;
}