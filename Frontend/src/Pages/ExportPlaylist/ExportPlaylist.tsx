

import './ExportPlaylist.css'
import { useParams } from 'react-router-dom'; 

function ExportPlaylist() {
  let { from } = useParams();
  return (
    <div>
      <h1>Export your playlist from : {from}</h1>
    
    </div>
  )
}

export default ExportPlaylist



