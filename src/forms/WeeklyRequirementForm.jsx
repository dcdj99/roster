import { Form } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function WeeklyRequirementForm({
  weeklyLocationsRequired,
  setWeeklyLocationsRequired,
  updateWeeklyRequirement,
  locationCount
}) {
  function clamp(val) {
    return Math.max(1, Math.min(locationCount, val));
  }

  return (
    <Form method="post" onSubmit={updateWeeklyRequirement}>
      <label>Weekly Locations Required (All Staff):</label>
      <div style={{ 
        display: 'flex', 
        alignItems: 'center',
        gap: '10px',
        margin: '10px 0'
      }}>
        <button
          type="button"
          onClick={() => setWeeklyLocationsRequired(clamp(weeklyLocationsRequired - 1))}
          style={{
            minWidth: '40px',
            height: '40px',
            fontSize: '1.2rem'
          }}
        >
          -
        </button>
        <input
          type="number"
          name="weeklyLocationsRequired"
          value={weeklyLocationsRequired}
          onChange={(e) => setWeeklyLocationsRequired(clamp(Number(e.target.value)))}
          style={{ 
            margin: '0 10px',
            width: '80px',
            height: '40px',
            fontSize: '1.1rem',
            textAlign: 'center'
          }}
        />
        <button
          type="button"
          onClick={() => setWeeklyLocationsRequired(clamp(weeklyLocationsRequired + 1))}
          style={{
            minWidth: '40px',
            height: '40px',
            fontSize: '1.2rem'
          }}
        >
          +
        </button>
      </div>
    </Form>
  );
}

WeeklyRequirementForm.propTypes = {
  weeklyLocationsRequired: PropTypes.number.isRequired,
  setWeeklyLocationsRequired: PropTypes.func.isRequired,
  updateWeeklyRequirement: PropTypes.func.isRequired,
  locationCount: PropTypes.number.isRequired
};