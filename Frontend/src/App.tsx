import youtubeLogo from '/public/youtube_logo.svg'
import spotifyLogo from '/public/spotify_logo.svg'
import { Link } from 'react-router-dom';


import './App.css'

function App() {

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
        <Link to="youtube-to-spotify">
        <button >
          
          Move from youtube to spotify
        </button>
        </Link>

          <Link to="youtube-to-spotify">
                    <button >
          Move from spotify to youtube
        </button>
          </Link>
        <p>
          Move freely your playlist from one plataform to another .
        </p>
      </div>
      <p className="light-text">
        Created by Martín Borba
      </p>
    </>
  )
}

export default App
