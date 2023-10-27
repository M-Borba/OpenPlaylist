

import './ExportPlaylist.css'
import { useParams } from 'react-router-dom'; 
import { requestUserAuth } from './SpotifyUtils';

function ExportPlaylist() {
  let { from } = useParams();
  return (
    <div>
      <h1>Export your playlist from : {from}</h1>
      <button onClick={requestUserAuth}>RequestUserAuth</button>
    </div>
  )
}

export default ExportPlaylist



