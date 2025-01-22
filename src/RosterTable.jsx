import PropTypes from 'prop-types';

export default function RosterTable({ days, roster, fixedDay, fixedDayLocation }) {
  const getCellStyle = (day, location) => {
    const isFixedDay = day === fixedDay && location === fixedDayLocation;
    const isOOF = location === 'OOF';
    
    return {
      backgroundColor: isFixedDay ? '#e3f2fd' : isOOF ? '#ffe0e0' : 'transparent',
      color: isOOF ? '#d32f2f' : 'inherit',
      fontWeight: isFixedDay ? '500' : 'normal',
      padding: '8px',
      borderBottom: isFixedDay ? '2px solid #2196f3' : '1px solid #e2e8f0'
    };
  };

  return (
    <div className="table-container" style={{ overflowX: 'auto', maxWidth: '100%' }}>
      <table style={{ minWidth: '600px' }}>
        <thead>
          <tr>
            <th>Staff</th>
            {days.map((day) => (
              <th key={day} style={{ 
                backgroundColor: day === fixedDay ? '#e3f2fd' : 'transparent',
                borderBottom: day === fixedDay ? '2px solid #2196f3' : '1px solid #e2e8f0'
              }}>
                {day}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {roster.map(({ staff, assignment }, index) => (
            <tr key={index}>
              <td>{staff}</td>
              {assignment.map((loc, i) => (
                <td key={i} style={getCellStyle(days[i], loc === 'X' ? fixedDayLocation : loc)}>
                  {loc === 'X' ? fixedDayLocation : loc}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

RosterTable.propTypes = {
  days: PropTypes.arrayOf(PropTypes.string).isRequired,
  roster: PropTypes.arrayOf(
    PropTypes.shape({
      staff: PropTypes.string.isRequired,
      assignment: PropTypes.arrayOf(PropTypes.string).isRequired
    })
  ).isRequired,
  fixedDay: PropTypes.string.isRequired,
  fixedDayLocation: PropTypes.string.isRequired
};
