import youtubeLogo from '/public/youtube_logo.svg'
import spotifyLogo from '/public/spotify_logo.svg'
import { Link } from 'react-router-dom';


import './App.css'
import { fetchProfile, getSpotifyPlaylistsItems as getSpotifyPlaylistItems, getUsersPlaylists, loginSpotify } from './Pages/ExportPlaylist/SpotifyUtils';
import { useState } from 'react';
import { useEffect } from 'react';
import { getYoutubePlaylistItems, loginYoutube, transformSpotifytoYoutube } from './Pages/ExportPlaylist/YouTubeUtils';

function App() {
 //TODO CONSIDER ADDING PAYED ADDS https://adsense.google.com/start/?subid=uy-en-ha-ads-bk-a-search!o3

  //spoty
  const [spotifyUser,setSpotifyUser] =useState<any>(JSON.parse(localStorage.getItem('spotify_data') || "null"))
  const [spotifyPlaylists,setSpotifyPlaylists] =useState<any>(JSON.parse(localStorage.getItem('spotify_playlists') || "null") || {items: [], total: 0})


  // if(spotifyUser?.expire_datetime && new Date(spotifyUser.expire_datetime) > new Date()){ // TODO : if expires reset user
  //   setSpotifyUser(null);
  //   setSpotifyPlaylists(null)
  // }


  //yt

  const [youtubeUser,setYoutubeUser] =useState<any>(JSON.parse(localStorage.getItem('youtube_data') || "null"))
  const [youtubePlaylists,setYoutubePlaylists] =useState<any>(JSON.parse(localStorage.getItem('youtube_playlists') || "null") || {items: [], total: 0})

   const fetchSpotifyData = async (spoty_data:any) => {
    try {
      const user = await fetchProfile(spoty_data);
      setSpotifyUser({...spotifyUser , ...user});
      console.log("user", user);
      const spotify_data = JSON.parse(localStorage.getItem('spotify_data') || '{}');
      
      localStorage.setItem('spotify_data', JSON.stringify({...spotify_data,id:user.id, display_name:user.display_name,images:user.images}));

      const playlistsResponse = await getUsersPlaylists(user.id);
      setSpotifyPlaylists({items: playlistsResponse.items, total: playlistsResponse.total});
  
      console.log("playlistsResponse", playlistsResponse);
      localStorage.setItem('spotify_playlists', JSON.stringify({items: playlistsResponse.items, total: playlistsResponse.total}));

      
    } catch (error) {
      console.error("Error fetching spotify data:", error);
    }
  };

  const fetchYoutubePlaylists = async (yt_data:any) => {
    try {
      const youtubePlaylsitsResponse = await getYoutubePlaylistItems(yt_data.access_token,yt_data.channel_id)
      console.log("youtubePlaylsits",youtubePlaylsitsResponse)
      setYoutubePlaylists(youtubePlaylsitsResponse)
      localStorage.setItem('youtube_playlists', JSON.stringify(youtubePlaylsitsResponse));

      
    } catch (error) {
      console.error("Error fetching youtube data:", error);
    }
  };

  const handleSpotifytoYoutube= (response:any)=>{ 
    console.log("response--",response.failed_migrations)
    if(response.failed_migrations && response.failed_migrations.length>0){
      alert("Failed to export some songs:\n "+response.failed_migrations.map((song:any) =>song.nombreCancion+"\n"))
    }
    fetchYoutubePlaylists(youtubeUser)
  }


useEffect(() => {
 

 const urlParams = new URLSearchParams(window.location.search);
 const app = urlParams.get('app');


 if( app=="spotify" && !spotifyUser){
  const access_token = urlParams.get('access_token');
  const refresh_token = urlParams.get('refresh_token');
  const scope =urlParams.get('scope');
  const token_type =urlParams.get('token_type');
  const expires_in = urlParams.get('expires_in') as string;
  var expire_datetime = new Date();
  expire_datetime.setSeconds(expire_datetime.getSeconds() + parseInt(expires_in));

  const spotify_data = {access_token,refresh_token,scope,token_type,expires_in,expire_datetime}
  localStorage.setItem('spotify_data', JSON.stringify(spotify_data));
  console.log("setItemspotify_data",spotify_data)
  setSpotifyUser(spotify_data)
  // localStorage.setItem('spotify_refresh_token', refresh_token); TODO
  fetchSpotifyData(spotify_data)

 }else if(app =='youtube' && !youtubeUser){

  const access_token = urlParams.get('access_token');
  const channel_id = urlParams.get('channel_id');
  const username = urlParams.get('username');
  const user_image = urlParams.get('user_image');
  const youtube_data = {channel_id,access_token,username,user_image,}
  setYoutubeUser(youtube_data)
  
  localStorage.setItem('youtube_data', JSON.stringify(youtube_data));

  fetchYoutubePlaylists(youtube_data)
 
 }


}, []); 



 
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
         {!youtubeUser ?  <Link to="#">
        <button onClick={() => loginYoutube()} >
          Link Youtube account
        </button>
        </Link> :
        <div className="platform-container">
          <button onClick={() => { localStorage.removeItem("youtube_data");loginYoutube()}}>reload credentials &#x21bb;</button>

          <div>

         <img className="rounded" src={youtubeUser?.user_image  || "./src/assets/UserIcon.svg"} /> <strong> {youtubeUser?.username}</strong>
         <p> Total playlists : {youtubePlaylists?.pageInfo?.totalResults}</p>
         </div>
          <ol className="platform-list">
          {youtubePlaylists?.items?.map((playlist) =>(
            <li key={playlist.id}>
            <img className="rounded" src={playlist.snippet?.thumbnails?.default?.url || "./src/assets/PlaylistIcon.svg"}/>
            <strong>{playlist.snippet?.title}  <a href={"https://www.youtube.com/playlist?list="+playlist.id}>🔗</a> </strong> 
            {/* <p> total:?</p> */}
            <img className="exportBtn" src="./src/assets/export_icon.png" onClick={() => console.log("export")}/>

          </li>
          ))}
        </ol>
          </div>
        } 

          {!spotifyUser ?  <Link to="#">
        <button onClick={() => loginSpotify()} >
          Link Spotify account
        </button>
        </Link> : <div className="platform-container">
          <button onClick={() => { localStorage.removeItem("spotify_data");loginSpotify()}}>reload credentials &#x21bb;</button>
          <div>
         <img className="rounded" src={spotifyUser?.images?.length>0 && spotifyUser?.images[0] ? spotifyUser?.images[0].url : "./src/assets/UserIcon.svg"} /> <strong> {spotifyUser?.display_name}</strong>
         <p> Total playlists : {spotifyPlaylists?.total}</p>
         </div>
          <ol className="platform-list">
          {spotifyPlaylists?.items.map((playlist:any) =>(
            <li key={playlist.id}>
                <img className="exportBtn" src="./src/assets/export_icon.png" style={{transform: "scaleX(-1)"}} 
                onClick={() => transformSpotifytoYoutube(playlist.id,playlist.name).then(handleSpotifytoYoutube)}/>
              <img className="rounded" src={playlist.images[0] ? playlist.images[0].url : "./src/assets/PlaylistIcon.svg"} onClick={ () => getSpotifyPlaylistItems(playlist.id).then(console.log)}/>
            <strong>{playlist.name}  <a href={playlist.external_urls.spotify}>🔗</a> </strong>
             <p> total:{playlist.tracks?.total}</p>
          </li>
          ))}
        </ol>
          </div>
        }
       
        
      </div>
      {/* <p className="light-text">
        Created by  <Link to="m-borba">Martín Borba </Link>
      </p> */}
    </>
  )
}

export default App
