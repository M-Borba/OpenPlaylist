import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import MBorba from './Pages/MBorba/MBorba.tsx'
// import ExportPlaylist from './Pages/ExportPlaylist/ExportPlaylist.tsx'

import './index.css'

import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import { Link } from '../node_modules/react-router-dom/dist/index';

const router = createBrowserRouter([
  {
    path: "/*",
    element: <App/>,
    
  },
  {
    path: "/m-borba",
    element: <MBorba/>,
  },
  {
    path: "*",
    element:  <div>
        <p>Error 404 Route Not Found</p>
        <p>
          I don't know what you are looking for buddy. Go back to the{" "}
          <Link to="/">Homepage</Link>
        </p>
      </div>,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
   <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
)
