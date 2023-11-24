const generateRandomString = (length) => {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const values = crypto.getRandomValues(new Uint32Array(length));
    return values.reduce((acc, x) => acc + possible[x % possible.length], '');
};

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

const clientId = '63013162bacc41f29f68ce6114ae395b';
// if we are on localhost
const redirectUri = window.location.href;

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
    localStorage.setItem('access_token', response.access_token);
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
    let accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://api.spotify.com/v1/me/player/pause', {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    return response.status;
}


export const getCurrentlyPlaying = async () => {
    let accessToken = localStorage.getItem('access_token');
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
    let accessToken = localStorage.getItem('access_token');
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
    let accessToken = localStorage.getItem('access_token');
    const response = await fetch('https://api.spotify.com/v1/me/player/seek?position_ms=' + position, {
        method: 'PUT',
        headers: {
            Authorization: 'Bearer ' + accessToken
        }
    });
    return response.status;
}