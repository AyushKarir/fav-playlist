"use client"
import Image from "next/image";
import axios from 'axios';
import { useState, useEffect } from "react";

export default function Home() {
  const CLIENT_ID = "108716b6509a4550ba6e4b8ff58ed6a6";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";

  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([]);
  const [playlistURI, SetplaylistURI] = useState([])

  // const getToken = () => {
  //     let urlParams = new URLSearchParams(window.location.hash.replace("#","?"));
  //     let token = urlParams.get('access_token');
  // }

  useEffect(() => {
    const hash = window.location.hash
    let token = window.localStorage.getItem("token")

    // getToken()


    if (!token && hash) {
      token = hash.substring(1).split("&").find(elem => elem.startsWith("access_token")).split("=")[1]

      window.location.hash = ""
      window.localStorage.setItem("token", token)
    }

    setToken(token)

  }, [])

  const logout = () => {
    setToken("")
    window.localStorage.removeItem("token")
  }

  const searchArtists = async (e) => {
    e.preventDefault()
    const { data } = await axios.get("https://api.spotify.com/v1/search", {
      headers: {
        Authorization: `Bearer ${token}`
      },
      params: {
        q: searchKey,
        type: "artist"
      }
    })

    setArtists(data.artists.items)
  }

  const getPlaylists = async () => {
    const { data } = await axios.get("https://api.spotify.com/v1/me/playlists?", {
      headers: {
        Authorization: `Bearer ${token}`
      },
    })
    console.log(data.items);

    const uris = data.items.map((playlist) => playlist.uri.split(":")[2]);

    SetplaylistURI(uris);

    console.log(playlistURI);


  }

  const renderArtists = () => {
    return artists.map(artist => (
      <div key={artist.id}>
        {artist.images.length ? <img width={"100%"} src={artist.images[0].url} alt="" /> : <div>No Image</div>}
        {artist.name}
      </div>
    ))
  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      heello

      {!token ?
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
          to Spotify</a>
        : <button onClick={logout}>Logout</button>}

      {token ?
        <form onSubmit={searchArtists}>
          <input type="text" onChange={e => setSearchKey(e.target.value)} />
          <button type={"submit"}>Search</button>
        </form>

        : <h2>Please login</h2>
      }

      <button onClick={getPlaylists}>get playlists</button>

      {renderArtists()}
    </main>
  );
}
