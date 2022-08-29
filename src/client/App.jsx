import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';

function App() {
  const [workers, setWorker] = useState([]);
  const [precinctLead, setPrecinctLead] = useState('');
  const [precinctDescription, setPrecinctDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    function getParams() {
      const urlPath = window.location.href.split('?');
      return urlPath[1];
    }

    async function getPrecinctData() {
      const params = getParams();
      const request = await axios.get(`/precinct?${params}`);
      setPrecinctDescription(request.data.description);
      setPrecinctLead(request.data.leadName);
      setIsLoading(false);
    }

    async function getWorkerData() {
      const params = getParams();
      const request = await axios.get(`/workers?${params}`);
      setWorker(request.data.workerData);
      setIsLoading(false);
    }
    getPrecinctData().catch(console.error);
    getWorkerData().catch(console.error);
  }, []);

  if (isLoading) {
    return (<div>Loading..</div>);
  }

  return (
    <div className={css(styles.app)}>
      <h1>Test County Poll Worker Attendance Batch Update</h1>
      <p>
        <b>Precinct:</b> {precinctDescription} <br></br>
        <b>Judge:</b> {precinctLead}
      </p>
      <table className={css(styles.table)}>
        <thead>
          <tr>
            <th className={css(styles.headerCell)}>First Name</th>
            <th className={css(styles.headerCell)}>Last Name</th>
            <th className={css(styles.headerCell)}>Email</th>
            <th className={css(styles.headerCell)}>Phone</th>
            <th className={css(styles.headerCell)}>&nbsp;</th>
          </tr>
        </thead>
        <tbody>
          {workers.map((worker) => (
            <tr key={worker.firstName}>
              <td className={css(styles.cell)}>{worker.firstName}</td>
              <td className={css(styles.cell)}>{worker.lastName}</td>
              <td className={css(styles.cell)}>{worker.email}</td>
              <td className={css(styles.cell)}>{worker.phone}</td>
              <td className={css(styles.cell)}>
                <select>
                  <option>Select attendance</option>
                  <option>Did attend</option>
                  <option>No show</option>
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div>
        <button
          type="submit"
          className={css(styles.submit)}
        >
          Submit
        </button>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  app: {
    fontFamily: 'Helvetica, Arial',
    padding: '30px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerCell: {
    textAlign: 'left',
    padding: '5px',
    borderBottom: '1px solid #607d8b',
  },
  cell:{
    padding: '5px',
    borderBottom: '1px solid #dad9d9',
  },
  submit: {
    backgroundColor: '#0595d6',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '8px',
    marginTop: '10px',
  },
});

export default App;
