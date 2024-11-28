import React from 'react';
import { LinearProgress } from '@mui/material';
import { DateTime } from 'luxon';
export function Sidebar({ loading, tiderWaterStationName, currentWind, lowSpots, setResultOpen, resultOpen }) {

    const calculateChance = (hours) => {
        if (hours < 3) {
            return "Dårlig 👎";
        } else if (hours < 7) {
            return "Moderat 🤷";
        } else if (hours > 10) {
            return "God 👍";
        }
    }

    // const getDates = (d) => {
    //   const dates = [];
    //   for (const item of d) {
    //     dates.push(item.time);
    //   }
    //   return dates;
    // }

    // const getData = (windItem) => {
    //   const data = [];
    //   for (const item of windItem) {
    //     data.push(item.speed);
    //   }
    //   return data;
    // }
    return (
        <div style={{ position: 'absolute', zIndex: 401, overflowY: 'auto', height: '100vh', right: 0 }} className="card is-radiusless">
            <div className="column">
                {loading ? <LinearProgress /> :
                    <div>
                        <button className="button is-warning" onClick={(() => setResultOpen(!resultOpen))}>Luk</button>
                        {/* <h1>{municipality?.Name}</h1> */}
                        <h1 className="is-size-4 has-text-weight-bold">{tiderWaterStationName}</h1>
                        <span style={{ display: 'inline-block', transform: `rotate(${currentWind?.direction}deg)`, transformOrigin: 'center center' }}>⬇️</span>
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
                                                <p title="Vandstand">🌊: {Math.round(lowSpot.height)}cm</p>
                                                <p title="Timer med pålandsvind">💨: {lowSpot.hours} timer</p>
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
        </div>
    )
}