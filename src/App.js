import React, { useState, useEffect } from "react";
import { Map } from "./components/map/Map";
import { DateTime } from "luxon";
import { findNearestMunicipality } from "./components/map/functions";
import { bearingToAzimuth, point } from "@turf/helpers";
import { bearing } from "@turf/bearing";
import { LineChart } from "@mui/x-charts";
import { LinearProgress } from "@mui/material";

function App() {
  const [bbox, setBbox] = useState([0, 0, 0, 0]);
  const [tiderWaterStationName, setTiderWaterStationName] = useState(undefined);
  const [lowSpots, setLowSpots] = useState([])
  const [nearestPoint, setNearestPoint] = useState(undefined)
  const [nearestNextPoint, setNearestNextPoint] = useState(undefined)
  const [currentWind, setCurrentWind] = useState(undefined)
  const [municipality, setMunicipality] = useState(undefined)
  const [loading, setLoading] = useState(false)

  const [resultOpen, setResultOpen] = useState(false)

  const [debug, setDebug] = useState(false)

  useEffect(() => {
    if (!nearestPoint) {
      return;
    }
    const fetchData = async () => {
      setLoading(true);
      const municipality = findNearestMunicipality(nearestPoint)
      setMunicipality(municipality);
      if (!municipality) {
        setLoading(false);
        return;
      }
      const azimuth = bearingToAzimuth(bearing(point([nearestPoint.lng, nearestPoint.lat]), point([nearestNextPoint.lng, nearestNextPoint.lat])));
      const res = await fetch(`https://hayxmiy9qg.execute-api.eu-north-1.amazonaws.com/forecast?&position=${JSON.stringify({ longitude: nearestPoint.lng, latitude: nearestPoint.lat })}&municipalityId=${municipality.MunicipalityID}&azimuth=${azimuth}`);
      const json = await res.json();
      setBbox(json.boundingBox);
      setLowSpots(json.spots)
      setTiderWaterStationName(json.tiderWaterStationName);
      setCurrentWind(json.currentWind);
      setLoading(false);
      setResultOpen(true);
    }
    fetchData();
  }, [nearestPoint, nearestNextPoint])

  // Add key listener to toggle debug mode
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'd') {
        setDebug(debug => !debug)
      }
    }
    document.addEventListener('keyup', handleKeyDown, true)
    return () => {
      document.removeEventListener('keyup', handleKeyDown, true)
    }
  }, [])

  const calculateChance = (hours) => {
    if (hours < 3) {
      return "Dårlig 👎";
    } else if (hours < 7) {
      return "Moderat 🤷";
    } else if (hours > 10) {
      return "God 👍";
    }
  }

  const getDates = (d) => {
    const dates = [];
    for (const item of d) {
      dates.push(item.time);
    }
    return dates;
  }

  const getData = (windItem) => {
    const data = [];
    for (const item of windItem) {
      data.push(item.speed);
    }
    return data;
  }

  return (
    <div >
      {resultOpen ?
        <div style={{ position: 'absolute', zIndex: 401, overflowY: 'auto', height: '100vh', right: 0 }} className="card"    >
          <div className="column">
            {loading ? <LinearProgress /> :
              <div>
                <button className="button is-warning" onClick={(() => setResultOpen(!resultOpen))}>Luk</button>
                {/* <h1>{municipality?.Name}</h1> */}
                <h1 className="is-size-4 has-text-weight-bold">{tiderWaterStationName}</h1>
                <span style={{ display: 'inline-block', transform: `rotate(${currentWind.direction}deg)`, transformOrigin: 'center center' }}>⬇️</span>
                <span>{currentWind?.speed}ms ({currentWind?.isOnshore ? 'Pålandsvind' : 'Fralandsvind'})</span>
                <hr />
                <div>
                  {lowSpots.map(lowSpot => {
                    if (calculateChance(lowSpot.hours) === "Dårlig 👎") {
                      return null;
                    }
                    return (
                      <div className="card" key={lowSpot.height}>
                        <div className="card-content">
                          <div className="content">
                            <p>{DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.DATE_MED)} - {DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.TIME_24_SIMPLE)}</p>
                            <p title="Vandstand">🌊: {Math.round(lowSpot.height)}</p>
                            <p title="Timer med pålandsvind">💨: {lowSpot.hours}</p>
                            <p className="has-text-weight-medium" style={{ fontSize: 18 }}>Chance: {calculateChance(lowSpot.hours)}</p>
                          </div>

                          {/* <LineChart
                          xAxis={[
                            {
                              id: 'barCategories',
                              data: getDates(lowSpot?.windItem),
                              scaleType: 'band',
                            },
                          ]}
                          series={[
                            {
                              data: getData(lowSpot?.windItem),
                            },
                          ]}
                          // width={800}
                          height={200}
                        /> */}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>}
          </div>
        </div> : null}
      <Map
        debug={debug}
        nearestPoint={nearestPoint}
        setNearestPoint={setNearestPoint}
        nearestNextPoint={nearestNextPoint}
        setNearestNextPoint={setNearestNextPoint}
        setBbox={setBbox}
        bbox={bbox}
      />
    </div >
  );
}

export default App;
