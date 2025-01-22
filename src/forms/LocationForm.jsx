import { Form } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function LocationForm({
  locationInput,
  setLocationInput,
  addLocation,
  error,
  setError
}) {
  return (
    <>
      <Form method="post" onSubmit={addLocation}>
        <label>Location Name:</label>
        <input
          type="text"
          name="locationName"
          value={locationInput}
          onChange={(e) => {
            setLocationInput(e.target.value);
            setError('');
          }}
        />
        <button type="submit">Add Location</button>
      </Form>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
    </>
  );
}

LocationForm.propTypes = {
  locationInput: PropTypes.string.isRequired,
  setLocationInput: PropTypes.func.isRequired,
  addLocation: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func
};