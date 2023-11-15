

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

    export async function getProfile() {
        let accessToken = localStorage.getItem('access_token');

        const response = await fetch('https://api.spotify.com/v1/me', {
            headers: {
            Authorization: 'Bearer ' + accessToken
            }
        });

        return await response.json();
    }


    export async function fetchProfile(): Promise<any> {
    const access_token = JSON.parse(localStorage.getItem('spotify_data')|| "").access_token;
    const response = await fetch("https://api.spotify.com/v1/me", {
        method: "GET", headers: { Authorization: `Bearer ${access_token}` }
    });
    return response.json()
}
  export async function getUsersPlaylists(user_id: number){
    const access_token = JSON.parse(localStorage.getItem('spotify_data') || "").access_token;
    const response = await fetch(`https://api.spotify.com/v1/users/${user_id}/playlists`, {
        method: "GET", headers: { Authorization: `Bearer ${access_token}` }
    });
    return response.json()
  }

  export async function getPlaylistsItems(playlist_id: number){
    const access_token = JSON.parse(localStorage.getItem('spotify_data') || "").access_token;
    const response = await fetch(`https://api.spotify.com/v1/playlists/${playlist_id}/tracks`, {
        method: "GET", headers: { Authorization: `Bearer ${access_token}` }
    });
    return response.json()
  }

   export async function transformPlaylist(){
    const access_token = JSON.parse(localStorage.getItem('spotify_data') || "").access_token;
    // TODO
    return {}
      
  }
  

  export async function testingEndpoint(user_id: number){
    const access_token = JSON.parse(localStorage.getItem('spotify_data') || "").access_token;
    const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/testing/', {
        method: "POST", 
        headers: { Authorization: `Bearer ${access_token}`,'Content-Type': 'application/json;charset=UTF-8' },
        body: JSON.stringify({user_id})
    });
    return response.json()
      
  }