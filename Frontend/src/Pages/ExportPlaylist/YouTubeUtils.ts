    export async function loginYoutube(){
        try{
            console.log(import.meta.env.VITE_BACKEND_URL)
        const response = await fetch(import.meta.env.VITE_BACKEND_URL + '/authorize/', {
            method: "GET",
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*/*',
            },
        }).then(response=>response.json());
        window.location.href = response.redirect;
    }catch(error){console.log(error)}
    }



    export function getYoutubePlaylistItems(access_token:any,userId: string ){
        try{
            console.log(import.meta.env.VITE_BACKEND_URL)
        return fetch(import.meta.env.VITE_BACKEND_URL + '/listasReproduccionYT/?idUsuarioYT='+userId, {
            method: "GET",
          headers: {
            'Content-Type': 'multipart/form-data',
            'Access-Control-Allow-Origin': '*/*',
            'Authorization':"Bearer " + access_token,
            },
        }).then(response=>response.json());
    }catch(error){console.log(error)}
    }
