import { useState } from 'react'
import styles from '../styles/App.module.css'

export default function MedicalRecordViewer({ payload }) {
  const [showRaw, setShowRaw] = useState(false)
  
  // Extract medical record data from payload
  // Supports multiple formats:
  // 1. data.medical_record (direct)
  // 2. data.output.medical_record (nested)
  // 3. data.output (JSON string from dataset)
  // 4. data.output_answer (reference output, JSON string)
  const medicalData = payload?.data?.medical_record || 
                     payload?.data?.output?.medical_record ||
                     payload?.data?.output ||
                     payload?.data?.output_answer
  
  // Try to parse if it's a string
  let record = null
  if (typeof medicalData === 'string') {
    try {
      const parsed = JSON.parse(medicalData)
      // If parsed object has medical_record key, use that
      record = parsed.medical_record || parsed
    } catch (e) {
      // If not JSON, treat as plain text
      record = { notes: medicalData }
    }
  } else if (medicalData) {
    // If it's already an object, check for medical_record key
    record = medicalData.medical_record || medicalData
  }

  // Extract patient info, diagnosis, treatment, etc.
  const patientInfo = record?.patient || record?.patient_info || {}
  const diagnosis = record?.diagnosis || record?.diagnoses || []
  const medications = record?.medications || record?.meds || []
  const procedures = record?.procedures || []
  const vitalSigns = record?.vital_signs || record?.vitals || {}
  const notes = record?.notes || record?.clinical_notes || ''
  const date = record?.date || record?.visit_date || record?.timestamp || 'N/A'

  return (
    <div className={styles.medicalContainer}>
      {/* Raw Payload Toggle */}
      <div className={styles.rawPayloadSection}>
        <div className={styles.rawPayloadHeader}>
          <h2>Medical Record</h2>
          <button 
            className={styles.rawToggle}
            onClick={() => setShowRaw(!showRaw)}
          >
            {showRaw ? 'Hide' : 'Show'} Raw Payload
          </button>
        </div>
        {showRaw && (
          <div className={styles.rawPayload}>
            <pre className={styles.jsonDisplay}>
              {JSON.stringify(payload, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Medical Record Display */}
      <div className={styles.medicalRecord}>
        {/* Header */}
        <div className={styles.medicalHeader}>
          <h2>Medical Record</h2>
          <div className={styles.medicalDate}>Date: {date}</div>
        </div>

        {/* Patient Information */}
        {Object.keys(patientInfo).length > 0 && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Patient Information</h3>
            <div className={styles.medicalGrid}>
              {Object.entries(patientInfo).map(([key, value]) => (
                <div key={key} className={styles.medicalField}>
                  <span className={styles.medicalLabel}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </span>
                  <span className={styles.medicalValue}>{String(value)}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Vital Signs */}
        {Object.keys(vitalSigns).length > 0 && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Vital Signs</h3>
            <div className={styles.medicalGrid}>
              {Object.entries(vitalSigns).map(([key, value]) => (
                <div key={key} className={styles.medicalField}>
                  <span className={styles.medicalLabel}>
                    {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}:
                  </span>
                  <span className={styles.medicalValue}>
                    {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Diagnosis */}
        {diagnosis.length > 0 && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Diagnosis</h3>
            <ul className={styles.medicalList}>
              {diagnosis.map((item, index) => (
                <li key={index} className={styles.medicalListItem}>
                  {typeof item === 'string' ? item : (
                    <div>
                      {item.code && <span className={styles.medicalCode}>[{item.code}]</span>}
                      {item.description || item.name || JSON.stringify(item)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Medications */}
        {medications.length > 0 && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Medications</h3>
            <div className={styles.medicationList}>
              {medications.map((med, index) => (
                <div key={index} className={styles.medicationItem}>
                  <div className={styles.medicationName}>
                    {med.name || med.medication || med}
                  </div>
                  {med.dosage && (
                    <div className={styles.medicationDetails}>
                      <span>Dosage: {med.dosage}</span>
                      {med.frequency && <span>Frequency: {med.frequency}</span>}
                      {med.duration && <span>Duration: {med.duration}</span>}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Procedures */}
        {procedures.length > 0 && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Procedures</h3>
            <ul className={styles.medicalList}>
              {procedures.map((proc, index) => (
                <li key={index} className={styles.medicalListItem}>
                  {typeof proc === 'string' ? proc : (
                    <div>
                      {proc.code && <span className={styles.medicalCode}>[{proc.code}]</span>}
                      {proc.description || proc.name || JSON.stringify(proc)}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Clinical Notes */}
        {notes && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Clinical Notes</h3>
            <div className={styles.clinicalNotes}>
              {typeof notes === 'string' ? (
                <p style={{ whiteSpace: 'pre-wrap' }}>{notes}</p>
              ) : (
                <pre>{JSON.stringify(notes, null, 2)}</pre>
              )}
            </div>
          </section>
        )}

        {/* If no structured data, show raw output */}
        {!patientInfo && !diagnosis.length && !medications.length && !notes && (
          <section className={styles.medicalSection}>
            <h3 className={styles.medicalSectionTitle}>Record Content</h3>
            <div className={styles.clinicalNotes}>
              <pre>{JSON.stringify(record, null, 2)}</pre>
            </div>
          </section>
        )}
      </div>
    </div>
  )
}

