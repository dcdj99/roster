import { useNavigate } from 'react-router-dom';

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '1rem',
      maxWidth: '800px',
      margin: '0 auto',
      lineHeight: '1.6'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => navigate('/')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '1rem',
            cursor: 'pointer',
            backgroundColor: 'transparent',
            color: '#03a9f4',
            border: '1px solid #03a9f4',
            borderRadius: '4px'
          }}
        >
          ← Back
        </button>
        <h1 style={{ margin: 0 }}>About the Roster System</h1>
      </div>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2196f3', marginBottom: '1rem' }}>Overview</h2>
        <div style={{ 
          backgroundColor: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem'
        }}>
          <p style={{ margin: '0 0 1rem 0' }}>
            This application helps manage staff assignments across multiple locations on a daily basis.
            You can add staff members, locations, and set weekly requirements. The system will generate
            a roster based on the provided data and preferences.
          </p>
          <p style={{ margin: 0 }}>
            The application offers an easy way to plan staff schedules across multiple locations for each weekday.
            You can manage your workforce by adding, editing, or removing staff members, and setting days they are
            unavailable (OOF) to ensure your schedule is accurate.
          </p>
        </div>
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2196f3', marginBottom: '1rem' }}>Key Features</h2>
        {[
          {
            title: 'Staff Management',
            location: 'Under the "Staff Management" section on the main page',
            steps: [
              'Enter a staff member\'s name in the "Staff Name" field',
              'Click "Add Staff" to add them to the roster',
              'Use "Edit" to rename or "Remove" to delete a staff member'
            ],
            purpose: 'Quickly add, rename, or remove individuals required in your scheduling'
          },
          {
            title: 'Location Management',
            location: 'Under the "Location Management" section on the main page',
            steps: [
              'Enter a location name and click "Add Location"',
              'Use "Edit" to rename or "Remove" to delete'
            ],
            purpose: 'Keep track of all physical or virtual spots that need staffing'
          },
          // ...remaining features
        ].map((feature, index) => (
          <div 
            key={index}
            style={{ 
              backgroundColor: '#fff',
              padding: '1.5rem',
              borderRadius: '8px',
              marginBottom: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}
          >
            <h3 style={{ color: '#1976d2', marginTop: 0 }}>{feature.title}</h3>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Where to Find:</p>
            <p style={{ marginBottom: '1rem' }}>{feature.location}</p>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>How to Use:</p>
            <ol style={{ marginBottom: '1rem', paddingLeft: '1.5rem' }}>
              {feature.steps.map((step, i) => (
                <li key={i}>{step}</li>
              ))}
            </ol>
            <p style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Purpose:</p>
            <p style={{ margin: 0 }}>{feature.purpose}</p>
          </div>
        ))}
      </section>

      <section style={{ marginBottom: '2rem' }}>
        <h2 style={{ color: '#2196f3', marginBottom: '1rem' }}>Quick Start Guide</h2>
        <ol style={{ 
          backgroundColor: '#e3f2fd',
          padding: '1.5rem 1.5rem 1.5rem 3rem',
          borderRadius: '8px',
          margin: 0
        }}>
          <li style={{ marginBottom: '0.5rem' }}>Go to the "Staff Management" section to add staff names and set their OOF preferences.</li>
          <li style={{ marginBottom: '0.5rem' }}>Add or remove locations under the "Location Management" section as needed.</li>
          <li style={{ marginBottom: '0.5rem' }}>Determine how many locations must be staffed each week in the "Requirements" area.</li>
          <li style={{ marginBottom: '0.5rem' }}>Use the "Randomize Roster" button to automatically generate an assignment grid for each weekday.</li>
          <li style={{ margin: 0 }}>Review the warnings for any days with insufficient staff coverage, and adjust your inputs accordingly.</li>
        </ol>
      </section>

      <section style={{ 
        marginTop: '3rem',
        backgroundColor: '#f8f9fa',
        padding: '1.5rem',
        borderRadius: '8px',
        borderLeft: '4px solid #03a9f4'
      }}>
        <h2 style={{ color: '#2196f3', marginTop: 0, marginBottom: '1rem' }}>Creator Info</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <p style={{ margin: 0 }}>
            <strong>Developer:</strong> Darren Chow
          </p>
          <p style={{ margin: 0 }}>
            <strong>Created:</strong> 2025
          </p>
          {/* <p style={{ margin: 0, marginTop: '1rem' }}>
            As a software developer passionate about solving real-world organizational challenges,
            I created this roster system to help teams efficiently manage their distributed workforce.
            Drawing from experience in workforce management, this tool emphasizes user experience and
            practical functionality to make scheduling both intuitive and effective.
          </p> */}
        </div>
      </section>
    </div>
  );
}
