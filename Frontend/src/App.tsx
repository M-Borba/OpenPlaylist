import youtubeLogo from '/public/youtube_logo.svg'
import spotifyLogo from '/public/spotify_logo.svg'
import { Link } from 'react-router-dom';


import './App.css'
import { fetchProfile, loginSpotify } from './Pages/ExportPlaylist/SpotifyUtils';

function App() {
 //TODO CONSIDER ADDING PAYED ADDS https://adsense.google.com/start/?subid=uy-en-ha-ads-bk-a-search!o3

 const urlParams = new URLSearchParams(window.location.search);

 const access_token = urlParams.get('access_token');
 console.log("access_token",access_token)

 const refresh_token = urlParams.get('refresh_token');
 const scope =urlParams.get('scope');
 const token_type =urlParams.get('token_type');
 const expires_in = urlParams.get('expires_in');
 const app = urlParams.get('app');

 console.log("app",app)

 if( app=="spotify" && access_token){
  
  localStorage.setItem('spotify_access_token', access_token);
  const profile = fetchProfile();
  console.log("fetchProfile",profile);
 }
 
  return (
    <>
      <div>
        <a href="https://developers.google.com/youtube/v3/getting-started" target="_blank">
          <img src={youtubeLogo} className="logo" alt="Youtube logo" />
        </a>
        <a href="https://developer.spotify.com/documentation/web-api" target="_blank">
          <img src={spotifyLogo} className="logo spotify" alt="Spotify logo" />
        </a>
      </div>
      <h1>Open Playlist</h1>
      <div className="card">
        <Link to="export-playlist/youtube">
          <button >
          Link YouTube account
        </button>
          </Link>

          {/* export-playlist/spotify */}
        <Link to="#">
        <button onClick={() => loginSpotify()} >
          Link Spotify account
        </button>
        </Link>
        <p>
          Move freely your playlist from one plataform to another .
        </p>
      </div>
      <p className="light-text">
        Created by  <Link to="m-borba">Martín Borba </Link>
      </p>
    </>
  )
}

export default App
