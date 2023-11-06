

// AUTH flow https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

    export async function loginSpotify(){
        try{
            console.log(import.meta.env.VITE_BACKEND_URL)
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/login-spotify/', {
            method: "GET",
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*/*',
            },
        }).then(response=>response.json());
        window.location.href = response.redirect;
    }catch(error){console.log(error)}
    }



    function base64encode  (string:any) {
        return btoa(String.fromCharCode.apply(null, new Uint8Array(string) as any))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
    }


    export async function generateRandomString(length:number)  {
        let text = '';
        let possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

        for (let i = 0; i < length; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    export async function generateCodeChallenge (codeVerifier: string){
        const encoder = new TextEncoder();
        const data = encoder.encode(codeVerifier);
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        return base64encode(digest);
    }


    export async function requestUserAuth(){
        console.log(import.meta.env)

        let codeVerifier = await generateRandomString(128);

        generateCodeChallenge(codeVerifier).then(async codeChallenge => {
        let state = await generateRandomString(16);
        let scope = 'user-read-private user-read-email playlist-read-private playlist-read-collaborative';

        localStorage.setItem('code_verifier', codeVerifier);

        let args = new URLSearchParams({
            response_type: 'code',
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
            scope: scope,
            redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI, // TODO REDIRECT URI SHOULD GO TO BACKEND??
            state: state,
            code_challenge_method: 'S256',
            code_challenge: codeChallenge
        });

        window.location.href = 'https://accounts.spotify.com/authorize?' + args;
        });
    }

    export async function getProfile() {
        let accessToken = localStorage.getItem('access_token');

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
            Authorization: 'Bearer ' + accessToken
            }
        });

        return await response.json();
    }
    export async function getAccessToken(code: string) {
        let codeVerifier = localStorage.getItem('code_verifier');
        let body = new URLSearchParams({
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: import.meta.env.VITE_SPOTIFY_REDIRECT_URI,
            client_id: import.meta.env.VITE_SPOTIFY_CLIENT_ID,
            code_verifier: codeVerifier
        }as Record<string, string>);
            fetch('https://accounts.spotify.com/api/token', {
            method: 'POST',
            headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('HTTP status ' + response.status);
            }
            return response.json();
            })
            .then(data => {
            localStorage.setItem('spotify_access_token', data.access_token);
            })
            .catch(error => {
            console.error('Error:', error);
            });
    }

    export async function fetchProfile(): Promise<any> {
    const access_token = localStorage.getItem('spotify_access_token');
    const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${access_token}` }
    });
    const result = await response.json()
    console.log("result",result);

    return result;

  
}
  export async function getAllPlaylists(user_id){
      
  }