

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