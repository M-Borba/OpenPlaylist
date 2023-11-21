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