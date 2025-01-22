import { Form } from 'react-router-dom';
import PropTypes from 'prop-types';

export default function StaffForm({
  staffInput,
  setStaffInput,
  addStaff,
  error,
  setError
}) {
  return (
    <div style={{ flex: 1 }}>
      <Form method="post" onSubmit={addStaff}>
        <label>Staff Name:</label>
        <input
          type="text"
          name="staffName"
          value={staffInput}
          onChange={(e) => {
            setStaffInput(e.target.value);
            setError('');
          }}
        />
        <button type="submit">Add Staff</button>
      </Form>
      {error && <div style={{ color: 'red', marginBottom: '10px' }}>{error}</div>}
    </div>
  );
}

StaffForm.propTypes = {
  staffInput: PropTypes.string.isRequired,
  setStaffInput: PropTypes.func.isRequired,
  addStaff: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func
};