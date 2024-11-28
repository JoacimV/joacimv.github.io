import React from 'react';
import { DateTime } from 'luxon';

export function Sidebar({ loading, tiderWaterStationName, currentWind, lowSpots }) {

    const calculateChance = (hours) => {
        if (hours < 3) {
            return "Dårlig 👎";
        } else if (hours <= 7) {
            return "Moderat 🤷";
        } else if (hours >= 10) {
            return "God 👍";
        }
    }

    const renderLowSpots = () => {
        const spots = [];
        for (const lowSpot of lowSpots) {
            if (calculateChance(lowSpot.hours) === "Dårlig 👎") {
                continue;
            }
            spots.push(
                <div className="card" key={lowSpot.height}>
                    <div className="card-content">
                        <div className="content">
                            <p>{DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.DATE_MED)} - {DateTime.fromISO(lowSpot.time).toLocaleString(DateTime.TIME_24_SIMPLE)}</p>
                            <p title="Vandstand">🌊: {Math.round(lowSpot.height)}cm</p>
                            <p title="Timer med pålandsvind">💨: {lowSpot.hours} timer</p>
                            <p className="has-text-weight-medium" style={{ fontSize: 18 }}>Chance: {calculateChance(lowSpot.hours)}</p>
                        </div>
                    </div>
                </div>
            )
        }
        if (spots.length === 0) {
            return <div className="card">
                <div className="card-content">
                    <div className="content">
                        <p>Ingen lavvands alarmer</p>
                    </div>
                </div>
            </div>
        }
        return spots;
    }

    return (
        <div style={{ position: 'absolute', zIndex: 401, overflowY: 'auto', height: '100vh', right: 0 }} className="box is-radiusless">
            <div className="column">
                {loading ?
                    <div>
                        <h1 className="is-size-4 has-text-weight-bold">Henter data...</h1>
                        <hr />
                        <div className='card is-skeleton'>
                            <br />
                            <br />
                            <br />
                        </div>
                        <br />
                        <div className='card is-skeleton'>
                            <br />
                            <br />
                            <br />
                        </div>
                        <br />
                        <div className='card is-skeleton'>
                            <br />
                            <br />
                            <br />
                        </div>
                        <br />
                        <div className='card is-skeleton'>
                            <br />
                            <br />
                            <br />
                        </div>
                    </div> :
                    <div>
                        <h1 className="is-size-4 has-text-weight-bold">{tiderWaterStationName}</h1>
                        <span style={{ display: 'inline-block', transform: `rotate(${currentWind?.direction}deg)`, transformOrigin: 'center center' }}>⬇️</span>
                        <span>{currentWind?.speed}ms ({currentWind?.isOnshore ? 'Pålandsvind' : 'Fralandsvind'})</span>
                        <hr />
                        {renderLowSpots()}
                    </div>}
            </div>
        </div>
    )
}