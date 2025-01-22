import { Form, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { generateRoster } from './utils/rosterGenerator';
import { validateDailyDistribution, haveInputsChanged } from './utils/helpers';
import RosterTable from './RosterTable';
import StaffForm from './forms/StaffForm';
import LocationForm from './forms/LocationForm';
import WeeklyRequirementForm from './forms/WeeklyRequirementForm';
import { useRosterState } from './hooks/useRosterState';
import LoadingSpinner from './components/LoadingSpinner';
import './styles/loading.css';
import { useWindowSize } from './hooks/useWindowSize';

export default function MyForm() {
  const { state, actions, isAuthenticated, loading, isFirestoreUpdate, savingStatus } = useRosterState();
  const { isMobile } = useWindowSize();
  const [staffInput, setStaffInput] = useState('');
  const [locationInput, setLocationInput] = useState('');
  const [staffBeingEdited, setStaffBeingEdited] = useState(null);
  const [editedStaffName, setEditedStaffName] = useState('');
  const [locationBeingEdited, setLocationBeingEdited] = useState(null);
  const [editedLocationName, setEditedLocationName] = useState('');
  const [staffError, setStaffError] = useState('');
  const [locationError, setLocationError] = useState('');
  const [expandedStaffOof, setExpandedStaffOof] = useState(null);
  const editInputRef = useRef(null);

  const navigate = useNavigate();



  if (loading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        gap: '1rem'
      }}>
        <h2>Authentication Failed</h2>
        <p>Unable to access the roster system.</p>
        <button 
          onClick={() => window.location.reload()}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  function handleAddStaff(e) {
    e.preventDefault();
    const trimmedInput = staffInput.trim();
    if (!trimmedInput) return;

    const success = actions.addStaff(trimmedInput);
    if (success) {
      setStaffInput('');
      setStaffError('');
    } else {
      setStaffError('Staff member already exists.');
    }
  }

  function handleAddLocation(e) {
    e.preventDefault();
    const trimmedInput = locationInput.trim();
    if (!trimmedInput) return;

    const success = actions.addLocation(trimmedInput);
    if (success) {
      setLocationInput('');
      setLocationError('');
    } else {
      setLocationError('Location already exists.');
    }
  }

  function randomizeRoster() {
    const { days, roster } = generateRoster(
      state.staffList,
      state.locationList,
      state.weeklyLocationsRequired,
      state.oofPreferences,
      state.fixedDay,
      state.fixedDayLocation
    );
    actions.updateRoster(roster, days);
  }

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const currentInputs = {
    staffList: state.staffList,
    locationList: state.locationList,
    weeklyLocationsRequired: state.weeklyLocationsRequired,
    oofPreferences: state.oofPreferences,
    fixedDay: state.fixedDay,
    fixedDayLocation: state.fixedDayLocation
  };

  let days, roster;
  const hasValidCache = state.cachedRoster && 
                       state.cachedDays && 
                       state.cachedInputs && 
                       !isFirestoreUpdate &&
                       !haveInputsChanged(state.cachedInputs, currentInputs);

  if (hasValidCache) {
    // Use cached roster if inputs haven't changed
    days = state.cachedDays;
    roster = state.cachedRoster;
  } else if (state.staffList.length && state.locationList.length) {
    // Only generate new roster if we have the required data
    ({ days, roster } = generateRoster(
      state.staffList,
      state.locationList,
      state.weeklyLocationsRequired,
      state.oofPreferences,
      state.fixedDay,
      state.fixedDayLocation
    ));
    actions.updateRoster(roster, days);
  } else {
    // Set empty values if we don't have enough data
    days = [];
    roster = [];
  }

  const dailyValidations = days
    .filter(day => day !== state.fixedDay)
    .map(day => validateDailyDistribution(state.staffList, state.locationList, state.oofPreferences, day));

  const impossibleDays = dailyValidations
    .map((validation, index) => ({
      day: days.filter(d => d !== state.fixedDay)[index],
      ...validation
    }))
    .filter(v => !v.possible);

  return (
    <div className="roster-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Staff Multi-Location Daily Rostering</h1>
        {savingStatus && (
            <span className={`saving-status ${savingStatus.replace(' ', '-').toLowerCase()}`}>
              {savingStatus}
            </span>
          )}
          </div>
          <div style={{ marginBottom: '.1rem' }}>
        <button
          onClick={() => navigate('/about')}
          style={{
            padding: '0rem 0.5rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: '#fff',
            color: '#03a9f4',
            border: 'none',
            borderRadius: '4px'
          }}
        >
          About
        </button>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Weekly Roster</h2>
        <div>
          <button onClick={randomizeRoster}>Randomize Roster</button>
        </div>
      </div>
      
      <RosterTable
        days={days}
        roster={roster}
        fixedDay={state.fixedDay}
        fixedDayLocation={state.fixedDayLocation}
      />

      {impossibleDays.length > 0 && (
        <div className="warning">
          <strong>Warning:</strong> Insufficient staff available on:
          <ul className="warning-list">
            {impossibleDays.map(({ day, availableStaff, requiredStaff }) => (
              <li key={day}>
                {day}: {availableStaff} staff available, {requiredStaff} required
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="form-section">
        <h2>Staff Management</h2>
        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          marginBottom: '2rem',
          gap: '1rem'
        }}>
          <StaffForm
            staffInput={staffInput}
            setStaffInput={setStaffInput}
            addStaff={handleAddStaff}
            error={staffError}
            setError={setStaffError}
          />
          <h3 style={{ margin: 0, whiteSpace: 'nowrap' }}>Out of Office(OOF) Preferences</h3>
        </div>

        <ul className="staff-list">
          {state.staffList.map((member, index) => (
            <li key={index} style={{
              flexDirection: isMobile ? 'column' : 'row',
              gap: isMobile ? '1rem' : '8px',
              padding: '1rem'
            }}>
              <div style={{
                display: 'flex',
                flexDirection: isMobile && staffBeingEdited === member ? 'column' : 'row',
                justifyContent: 'space-between',
                alignItems: isMobile && staffBeingEdited === member ? 'stretch' : 'center',
                width: '100%',
                gap: isMobile && staffBeingEdited === member ? '0.5rem' : '0'
              }}>
                {staffBeingEdited === member ? (
                  <>
                    <input
                      ref={editInputRef}
                      value={editedStaffName}
                      onChange={e => setEditedStaffName(e.target.value)}
                      autoFocus
                      style={{
                        width: isMobile ? '100%' : 'auto',
                        padding: '0.5rem'
                      }}
                    />
                    <div style={{ 
                      display: 'flex', 
                      gap: '0.5rem',
                      flexDirection: isMobile ? 'column' : 'row',
                      width: isMobile ? '100%' : 'auto'
                    }}>
                      <button
                        onClick={() => {
                          actions.renameStaff(member, editedStaffName.trim());
                          setStaffBeingEdited(null);
                          setEditedStaffName('');
                        }}
                        style={{ flex: isMobile ? '1' : '0' }}
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setStaffBeingEdited(null);
                          setEditedStaffName('');
                        }}
                        style={{ flex: isMobile ? '1' : '0' }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => {
                          actions.removeStaff(member);
                          setStaffBeingEdited(null);
                          setEditedStaffName('');
                        }}
                        style={{ flex: isMobile ? '1' : '0' }}
                      >
                        Remove
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <span>{member}</span>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      {isMobile && (
                        <button
                          type="button"
                          onClick={() => setExpandedStaffOof(expandedStaffOof === member ? null : member)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            background: expandedStaffOof === member ? '#ffb11f' : '#03a9f4',
                            color: '#fff'
                          }}
                        >
                          OOF {expandedStaffOof === member ? '▼' : '▶'}
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => {
                          setStaffBeingEdited(member);
                          setEditedStaffName(member);
                        }}
                      >
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
              {staffBeingEdited !== member && (
                (!isMobile || (isMobile && expandedStaffOof === member)) && (
                  <div style={{ 
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    marginLeft: isMobile ? '0' : '20px',
                    gap: '8px',
                    marginTop: isMobile ? '1rem' : '0',
                  }}>
                    {allDays.map(day => (
                      <label 
                        key={day} 
                        style={{ 
                          display: 'flex',
                          alignItems: 'center',
                          padding: '8px 12px',
                          width: isMobile ? '100%' : 'auto',
                          backgroundColor: state.oofPreferences[member]?.includes(day) ? '#e0e7ff' : '#f3f4f6',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          fontSize: '0.95rem',
                          userSelect: 'none',
                          border: '1px solid',
                          borderColor: state.oofPreferences[member]?.includes(day) ? '#818cf8' : 'transparent',
                          ':hover': {
                            backgroundColor: state.oofPreferences[member]?.includes(day) ? '#c7d2fe' : '#e5e7eb'
                          }
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={state.oofPreferences[member]?.includes(day) || false}
                          onChange={() => actions.toggleOofDay(member, day)}
                          style={{
                            width: '16px',
                            height: '16px',
                            marginRight: '8px',
                            cursor: 'pointer'
                          }}
                        />
                        {day}
                      </label>
                    ))}
                  </div>
                )
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="form-section">
        <h2>Location Management</h2>
        <LocationForm
          locationInput={locationInput}
          setLocationInput={setLocationInput}
          addLocation={handleAddLocation}
          error={locationError}
          setError={setLocationError}
        />

        <ul className="location-list">
          {state.locationList.map((loc, index) => (
            <li key={index}>
              {locationBeingEdited === loc ? (
                <>
                  <input
                    ref={editInputRef}
                    value={editedLocationName}
                    onChange={e => setEditedLocationName(e.target.value)}
                    autoFocus
                    style={{
                      padding: '0.5rem'
                    }}
                  />
                  <button
                    onClick={() => {
                      actions.renameLocation(loc, editedLocationName.trim());
                      setLocationBeingEdited(null);
                      setEditedLocationName('');
                    }}
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setLocationBeingEdited(null);
                      setEditedLocationName('');
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      actions.removeLocation(loc);
                      setLocationBeingEdited(null);
                      setEditedLocationName('');
                    }}
                  >
                    Remove
                  </button>
                </>
              ) : (
                <>
                  {loc}
                  <div className="button-group" style={{ marginLeft: 'auto' }}>
                    <button
                      type="button"
                      onClick={() => {
                        setLocationBeingEdited(loc);
                        setEditedLocationName(loc);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="form-section">
        <h2>Requirements</h2>
        <WeeklyRequirementForm
          weeklyLocationsRequired={state.weeklyLocationsRequired}
          setWeeklyLocationsRequired={actions.setWeeklyLocationsRequired}
          updateWeeklyRequirement={e => e.preventDefault()}
          locationCount={state.locationList.length}
        />

        <Form method="post" className="fixed-day-form">
          <div style={{
            display: 'flex',
            flexDirection: window.innerWidth <= 768 ? 'column' : 'row',
            gap: '1rem'
          }}>
            <div>
              <label>Fixed Day:</label>
              <select value={state.fixedDay} onChange={(e) => actions.setFixedDay(e.target.value)}>
                <option value="">None</option>
                {allDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label>Location for Fixed Day:</label>
              <select
                value={state.fixedDayLocation}
                onChange={(e) => actions.setFixedDayLocation(e.target.value)}
              >
                <option value="">None</option>
                {state.locationList.map(loc => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>
          </div>
        </Form>
      </div>

    </div>
  );
}
