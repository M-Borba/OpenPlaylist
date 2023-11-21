import youtubeLogo from '/public/youtube_logo.svg'
import spotifyLogo from '/public/spotify_logo.svg'
import { Link } from 'react-router-dom';


import './App.css'
import { fetchProfile, getPlaylistsItems, getUsersPlaylists, loginSpotify, testingEndpoint } from './Pages/ExportPlaylist/SpotifyUtils';
import { useState } from 'react';
import { useEffect } from 'react';
import { loginYoutube } from './Pages/ExportPlaylist/YouTubeUtils';

function App() {
 //TODO CONSIDER ADDING PAYED ADDS https://adsense.google.com/start/?subid=uy-en-ha-ads-bk-a-search!o3

  //spoty
  const [spotifyUser,setSpotifyUser] =useState<any>(null)
  const [spotifyAuth,setSpotifyAuth] =useState<any>(null)
  const [spotifyPlaylists,setSpotifyPlaylists] =useState<any>([])
  const [spotifyTotalPlaylists,setSpotifyTotalPlaylists] =useState<any>(0)

  //yt

  const [youtubeAuth,setYoutubeAuth] =useState<any>(null)




 const urlParams = new URLSearchParams(window.location.search);



 const app = urlParams.get('app');

 if( app=="spotify" && !spotifyAuth){
  const access_token = urlParams.get('access_token');
  const refresh_token = urlParams.get('refresh_token');
  const scope =urlParams.get('scope');
  const token_type =urlParams.get('token_type');
  const expires_in = urlParams.get('expires_in');
  const spotify_data = {access_token,refresh_token,scope,token_type,expires_in}

  localStorage.setItem('spotify_data', JSON.stringify(spotify_data));
  setSpotifyAuth(spotify_data)
  // localStorage.setItem('spotify_refresh_token', refresh_token); TODO
  fetchProfile().then((user)=>setSpotifyUser(user)).catch((err)=>console.log(err))

  // fetchSpotifyPlaylists()
 }

 useEffect(()=>{
   if(spotifyUser?.id) getUsersPlaylists(spotifyUser.id)
      .then((playlistsResponse)=>{
        setSpotifyPlaylists(playlistsResponse.items)
        setSpotifyTotalPlaylists(playlistsResponse.total)

      });

 },[spotifyUser])
 
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
      <p>
          Move freely your playlist from one plataform to another .
        </p>
      <div className="card">
         {!youtubeAuth ?  <Link to="#">
        <button onClick={() => loginYoutube()} >
          Link Youtube account
        </button>
        </Link> : "LINKEADO"
        // <div className="platform-container">
        //   <div>
        //  <img src={youtubeUser?.images[0] ? youtubeUser?.images[0].url : "./src/assets/UserIcon.svg"} /> <strong> {youtubeUser?.display_name}</strong>
        //  <p> Total playlists : {youtubeTotalPlaylists}</p>
        //  </div>
        //   <ol class="platform-list">
        //   {spotifyPlaylists.map((playlist) =>(
        //     <li key={playlist.id}>
        //       <img src={playlist.images[0] ? playlist.images[0].url : "./src/assets/PlaylistIcon.svg"} onClick={ () => getPlaylistsItems(playlist.id).then(console.log)}/>
        //     <strong>{playlist.name}  <a href={playlist.external_urls.spotify}>🔗</a> </strong> <p> total:{playlist.tracks.total}</p>
        //   </li>
        //   ))}
        // </ol>
        //   </div>
        }
          {/* todo:delete testing button */}
        <button onClick={() => testingEndpoint(spotifyUser.id)}  >
         TESTING
        </button>
          {!spotifyAuth ?  <Link to="#">
        <button onClick={() => loginSpotify()} >
          Link Spotify account
        </button>
        </Link> : <div className="platform-container">
          <div>
         <img src={spotifyUser?.images[0] ? spotifyUser?.images[0].url : "./src/assets/UserIcon.svg"} /> <strong> {spotifyUser?.display_name}</strong>
         <p> Total playlists : {spotifyTotalPlaylists}</p>
         </div>
          <ol class="platform-list">
          {spotifyPlaylists.map((playlist) =>(
            <li key={playlist.id}>
              <img src={playlist.images[0] ? playlist.images[0].url : "./src/assets/PlaylistIcon.svg"} onClick={ () => getPlaylistsItems(playlist.id).then(console.log)}/>
            <strong>{playlist.name}  <a href={playlist.external_urls.spotify}>🔗</a> </strong> <p> total:{playlist.tracks.total}</p>
          </li>
          ))}
        </ol>
          </div>
        }
       
        
      </div>
      <p className="light-text">
        Created by  <Link to="m-borba">Martín Borba </Link>
      </p>
    </>
  )
}

export default App
