import axios from 'axios';
import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { StyleSheet, css } from 'aphrodite';

function App() {
  const [workers, setWorker] = useState([]);
  const [workerStatuses, setWorkerStatuses] = useState({});
  const [precinctLead, setPrecinctLead] = useState('');
  const [precinctDescription, setPrecinctDescription] = useState('');
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [isLoadingPrecinct, setIsLoadingPrecinct] = useState(true);
  const [isPostingData, setIsPostingData] = useState(false);
  const [postStatus, setPostStatus] = useState('');
  useEffect(() => {
    async function getPrecinctData() {
      const searchParams = window.location.search;
      const request = await axios.get(`/precinct${searchParams}`);
      setPrecinctDescription(request.data.description);
      setPrecinctLead(request.data.leadName);
      setIsLoadingPrecinct(false);
    }

    async function getWorkerData() {
      const searchParams = window.location.search;
      const request = await axios.get(`/workers${searchParams}`);
      setWorker(request.data.workerData);
      setIsLoadingWorkers(false);
    }
    getPrecinctData().catch(console.error);
    getWorkerData().catch(console.error);
  }, []);

  const handleChange = (e) => {
    const newState = { ...workerStatuses };
    newState[e.target.id] = e.target.value;
    setWorkerStatuses(newState);
  };

  const handleSubmit = async () => {
    const { baseId, workersTableId } = queryString.parse(window.location.search);
    const postData = {
      workerStatuses,
      baseId,
      workersTableId,
    };
    setIsPostingData(true);
    try {
      const request = await axios.post('/update', postData);
      if (request.status === 200) {
        setPostStatus('Attendance successfully saved');
      }
    } catch (error) {
      setPostStatus('Oops, something went wrong, please try again or contact support');
    }
    setIsPostingData(false);
  };

  if (isLoadingWorkers || isLoadingPrecinct) {
    return (<div>Loading..</div>);
  }

  return (
    <div className={css(styles.app)}>
      <h1>Test County Poll Worker Attendance Batch Update</h1>
      <p>
        <b>Precinct: </b>
        {precinctDescription}
        <br />
        <b>Judge: </b>
        {precinctLead}
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
            <tr key={worker.id}>
              <td className={css(styles.cell)}>{worker.firstName}</td>
              <td className={css(styles.cell)}>{worker.lastName}</td>
              <td className={css(styles.cell)}>{worker.email}</td>
              <td className={css(styles.cell)}>{worker.phone}</td>
              <td className={css(styles.cell)}>
                <select onChange={handleChange} id={worker.id}>
                  <option value="">Select attendance</option>
                  <option value="yes">Did attend</option>
                  <option value="no">No show</option>
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
          onClick={handleSubmit}
        >
          {isPostingData ? 'Submitting' : 'Submit'}
        </button>
        <span className={css(styles.status)}>{postStatus}</span>
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
  status: {
    paddingLeft: '15px',
  },
});

export default App;
