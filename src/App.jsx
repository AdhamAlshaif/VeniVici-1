import React, { useEffect, useState, useRef, useCallback } from "react"; // ADD useCallback here
import "./App.css";
import Visited from "../Components/Visited";

const ACCESS_KEY = import.meta.env.VITE_APP_ACCESS_KEY;

const CAMERA_ABBREVIATIONS = [
  "fhaz",
  "rhaz",
  "mast",
  "chemcam",
  "mahli",
  "mardi",
  "navcam",
];

function App() {
  const [imgSrc, setImgSrc] = useState(null);
  const [camName, setCamName] = useState(null);
  const [earthDate, setEarthDate] = useState(null);
  const [sol, setSol] = useState(null);
  const [roverName, setRoverName] = useState(null);
  const [roverStatus, setRoverStatus] = useState(null);
  const [landingDate, setLandingDate] = useState(null);
  const [launchDate, setLaunchDate] = useState(null);
  const [visitedList, setVisitedList] = useState([]);

  const [banList, setBanList] = useState([]);

  const handleToggleBan = (attribute, value) => {
    setBanList((prevBanList) => {
      const newItemIdentifier = `${attribute}:${String(value)}`;

      const isBanned = prevBanList.some(item =>
        `${item.attribute}:${String(item.value)}` === newItemIdentifier
      );

      if (isBanned) {
        return prevBanList.filter(item =>
          `${item.attribute}:${String(item.value)}` !== newItemIdentifier
        );
      } else {
        return [...prevBanList, { attribute, value }];
      }
    });
  };

  // Define isPhotoBanned with useCallback, as makeQuery depends on it
  const isPhotoBanned = useCallback((photo, currentBanList) => {
    if (!photo) return true;

    const attributesToCheck = [
      { attribute: 'camName', value: String(photo.camera.full_name) },
      { attribute: 'earthDate', value: String(photo.earth_date) },
      { attribute: 'sol', value: String(photo.sol) },
      { attribute: 'roverName', value: String(photo.rover.name) },
      { attribute: 'roverStatus', value: String(photo.rover.status) },
      { attribute: 'landingDate', value: String(photo.rover.landing_date) },
      { attribute: 'launchDate', value: String(photo.rover.launch_date) },
    ];

    return currentBanList.some(bannedItem =>
      attributesToCheck.some(photoAttr =>
        photoAttr.attribute === bannedItem.attribute && photoAttr.value === String(bannedItem.value)
      )
    );
  }, []); // isPhotoBanned doesn't depend on any state/props from App, so its dependencies are empty


  // Wrap makeQuery with useCallback and list all its dependencies
  const makeQuery = useCallback(async () => {
    const roverName = "curiosity";
    let photoFound = false;
    let attempts = 0;
    const maxAttempts = 100;

    while (!photoFound && attempts < maxAttempts) {
      attempts++;
      const solDay = Math.floor(Math.random() * 3900) + 1;
      const randomIndex = Math.floor(Math.random() * CAMERA_ABBREVIATIONS.length);
      const selectedCamera = CAMERA_ABBREVIATIONS[randomIndex];

      const query = `https://api.nasa.gov/mars-photos/api/v1/rovers/${roverName}/photos?sol=${solDay}&camera=${selectedCamera}&api_key=${ACCESS_KEY}`;

      const response = await fetch(query);
      const data = await response.json();
      const photo = data.photos[0];

      if (photo == null) {
        console.log(`Attempt ${attempts}: No photo found for this query, trying again.`);
        continue;
      }

      const isVisited = visitedList.some(item => item.img_src === photo.img_src);
      if (isVisited) {
        console.log(`Attempt ${attempts}: Photo already visited, trying again.`);
        continue;
      }

      const isBanned = isPhotoBanned(photo, banList); // Uses isPhotoBanned
      if (isBanned) {
        console.log(`Attempt ${attempts}: Photo contains banned attribute(s), trying again.`);
        continue;
      }

      setImgSrc(photo.img_src);
      setCamName(photo.camera.full_name);
      setEarthDate(photo.earth_date);
      setSol(photo.sol);
      setRoverName(photo.rover.name);
      setRoverStatus(photo.rover.status);
      setLandingDate(photo.rover.landing_date);
      setLaunchDate(photo.rover.launch_date);

      setVisitedList((prevList) => [...prevList, photo]);
      photoFound = true;
    }

    if (!photoFound) {
      alert("Could not find a new unbanned photo after many attempts. Try removing some items from the ban list to get more results!");
    }
  }, [
    visitedList,
    banList,
    setImgSrc, setCamName, setEarthDate, setSol, setRoverName, setRoverStatus, setLandingDate, setLaunchDate, setVisitedList,
    ACCESS_KEY,
    CAMERA_ABBREVIATIONS,
    isPhotoBanned // Add isPhotoBanned as a dependency here
  ]);

  const effectRan = useRef(false);

  useEffect(() => {
    if (!effectRan.current) {
      makeQuery();
      effectRan.current = true;
    }
  }, [makeQuery]); // makeQuery is now a stable dependency

  return (
    <div className="app-container">
      <div className="visited-column">
        <h2>Who have we seen so far?</h2>
        <Visited photos={visitedList} />
      </div>

      <div className="main-content">
        <h1>Mars Rover Photos</h1>
        {imgSrc && <img src={imgSrc} alt="Mars Rover" />}
        <div>
          <button onClick={() => handleToggleBan('camName', camName)}>{camName}</button>
          <button onClick={() => handleToggleBan('earthDate', earthDate)}>{earthDate}</button>
          <button onClick={() => handleToggleBan('sol', sol)}>{sol}</button>
          <button onClick={() => handleToggleBan('roverName', roverName)}>{roverName}</button>
          <button onClick={() => handleToggleBan('roverStatus', roverStatus)}>{roverStatus}</button>
          <button onClick={() => handleToggleBan('landingDate', landingDate)}>{landingDate}</button>
          <button onClick={() => handleToggleBan('launchDate', launchDate)}>{launchDate}</button>
        </div>
        <button className="fetch-button" onClick={makeQuery}>Fetch New Photo</button>
      </div>

      <div className="ban-list">
        <h2>Ban List</h2>
        <p>Select an attribute in your listing to ban it</p>
        {banList.length > 0 ? (
          <div>
            {banList.map((item, index) => (
              <button
                key={`${item.attribute}-${item.value}-${index}`}
                onClick={() => handleToggleBan(item.attribute, item.value)}
              >
                {item.attribute}: {item.value}
              </button>
            ))}
          </div>
        ) : (
          <p>No attributes currently banned.</p>
        )}
      </div>
    </div>
  );
}

export default App;