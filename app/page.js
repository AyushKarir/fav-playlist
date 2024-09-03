"use client"
import Image from "next/image";
import axios from 'axios';
import { useState, useEffect } from "react";
// import { createPlaylist } from './components'

export default function Home() {
  const CLIENT_ID = "108716b6509a4550ba6e4b8ff58ed6a6";
  const REDIRECT_URI = "http://localhost:3000";
  const AUTH_ENDPOINT = "https://accounts.spotify.com/authorize";
  const RESPONSE_TYPE = "token";
  const SCOPES = 'playlist-modify-public playlist-modify-private user-library-read';


  // let userId = 'yo';


  const [token, setToken] = useState("")
  const [searchKey, setSearchKey] = useState("")
  const [artists, setArtists] = useState([]);
  const [playlistURI, SetplaylistURI] = useState([])
  const [playlistImages, SetplaylistImages] = useState([])

  const [SavedTracks, SetSavedTracks] = useState([])
  // const [userId, setUserId] = useState();

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

    const user_id = data.items[0].owner.id;


    const images = data.items.map((playlist) => {
      return playlist.images &&
        playlist.images[0] ? playlist.images[0].url : null;

    });

    const uris = data.items.map((playlist) => playlist.uri.split(":")[2]);

    SetplaylistURI(uris);
    SetplaylistImages(images);
    // console.log(images);
  }

  const getSavedTracks = async () => {

    let savedTracks = [];
    let limit = 50; // Maximum number of items to retrieve per request
    let offset = 0;
    let total = 0;

    try {
      do {
        const { data } = await axios.get("https://api.spotify.com/v1/me/tracks", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            limit: limit,
            offset: offset,
          },
        });

        const saved = data.items.map((saved) => saved.track.uri);
        savedTracks = [...savedTracks, ...saved];
        offset += limit;
        total = data.total;
      } while (offset < total);

      SetSavedTracks(savedTracks);

      console.log(savedTracks);
    } catch (error) {
      console.error('Error fetching saved tracks:', error);
    }





    // const { userID } = await axios.get('https://api.spotify.com/v1/me', {
    //   headers: {
    //     Authorization: `Bearer ${token}`, // Replace 'token' with your actual access token
    //   },
    // });

    // userId = userID.id; // This is the user_id
    // console.log(userId);




  }


  const getUserId = async () => {
    try {
      const { data } = await axios.get('https://api.spotify.com/v1/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log(data.id);
      return data.id;

    } catch (error) {
      console.error('Error fetching user ID:', error);
    }
  };


  const createPlaylist = async (userId, token) => {
    try {
      const response = await axios.post(
        `https://api.spotify.com/v1/users/${userId}/playlists`,
        {
          name: "web-api",
          description: "A new playlist created via the Spotify API",
          public: true,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error creating playlist:', error.response.data);
      return null;
    }
  };

  const addTracksToPlaylist = async (playlistId, SavedTracks, token) => {
    try {
      // Split the track URIs into chunks of 100 or fewer
      const chunkSize = 100;
      for (let i = 0; i < SavedTracks.length; i += chunkSize) {
        const chunk = SavedTracks.slice(i, i + chunkSize);

        await axios.post(
          `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
          {
            uris: chunk,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );

        console.log('Tracks added to playlist successfully!');
      }
    } catch (error) {
      console.error('Error adding tracks to playlist:', error);
    }
  };


  const createAndAddTracksToPlaylist = async (token) => {
    const userId = await getUserId();
    if (userId) {
      const playlistId = await createPlaylist(userId, token);
      if (playlistId) {
        await addTracksToPlaylist(playlistId, SavedTracks, token);
      }
    }
  };





  // const getSavedTracks = async () => {
  //   const { data } = await axios.get("https://api.spotify.com/v1/me/tracks", {
  //     headers: {
  //       Authorization: `Bearer ${token}`
  //     },
  //   })
  //   const saved = data.items.map((saved) => saved.track.uri)
  //   console.log(saved);
  // }


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

      {/* {!token ?
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}`}>Login
          to Spotify</a>
        : <button onClick={logout}>Logout</button>} */}
      {!token ?
        <a href={`${AUTH_ENDPOINT}?client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&response_type=${RESPONSE_TYPE}&scope=${encodeURIComponent(SCOPES)}`}>Login
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

      {playlistURI &&
        playlistURI.length > 0 ? (
        playlistURI.map((playlist, index) => (
          <div key={index} className="flex gap-3">
            <img src={playlistImages[index]} height="50" width="50" alt={`Playlist ${index + 1}`} />
            {playlist}
          </div>
        ))
      ) : (
        <div>No data to show</div>
      )
      }

      <button onClick={getSavedTracks}>get saved tracks</button>
      <button onClick={() => createAndAddTracksToPlaylist(token)}>Generate Playlist</button>

      {renderArtists()}
    </main>
  );
}
