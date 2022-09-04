import axios from "axios";
import queryString from "query-string";
import React, { useEffect, useState } from "react";
import { StyleSheet, css } from "aphrodite/no-important";

function App() {
  const [workers, setWorker] = useState([]);
  const [workerStatuses, setWorkerStatuses] = useState({});
  const [precinct, setPrecinct] = useState({});
  const [isLoadingWorkers, setIsLoadingWorkers] = useState(true);
  const [isLoadingPrecinct, setIsLoadingPrecinct] = useState(true);
  const [isPostingData, setIsPostingData] = useState(false);
  const [postStatus, setPostStatus] = useState("");
  const [hasError, setHasError] = useState(false);
  useEffect(() => {
    async function getPrecinctData() {
      const searchParams = window.location.search;
      const request = await axios.get(`/precinct${searchParams}`);
      const precinctData = {
        countyName: request.data.countyName,
        description: request.data.description,
        lead: request.data.leadName,
        leadTitle: request.data.leadTitle,
        instructions: request.data.instructions.replace("\n", "<br />"),
      };
      setPrecinct(precinctData);
      setIsLoadingPrecinct(false);
    }

    async function getWorkerData() {
      const searchParams = window.location.search;
      const request = await axios.get(`/workers${searchParams}`);
      setWorker(request.data.workerData);
      setIsLoadingWorkers(false);
    }
    getPrecinctData().catch((err) => {
      if(err){
        setHasError(true);
      }
    });
    getWorkerData().catch((err) => {
      if(err){
        setHasError(true);
      }
    });
  }, []);

  const setStatus = (e) => {
    const newState = { ...workerStatuses };
    newState[e.target.id] = e.target.value;
    setWorkerStatuses(newState);
  };

  const handleSubmit = async () => {
    const { configId } = queryString.parse(window.location.search);
    const postData = {
      workerStatuses,
      configId,
    };
    setIsPostingData(true);
    try {
      const request = await axios.post("/update", postData);
      if (request.status === 200) {
        setPostStatus("Attendance successfully saved");
      }
    } catch (error) {
      setPostStatus(
        "Oops, something went wrong, please try again or contact support"
      );
    }
    setIsPostingData(false);
  };

  if (hasError) {
    return <div className={css(styles.loading)}>Something went wrong loading your data, please try again or contact support</div>;
  }

  if (isLoadingWorkers || isLoadingPrecinct) {
    return <div className={css(styles.loading)}>Loading..</div>;
  }

  return (
    <div className={css(styles.app)}>
      <div className={css(styles.content)}>
        <div className={css(styles.topBar)}>{precinct.countyName}</div>
        <div className={css(styles.info)}>
          <div className={css(styles.infoRow)}>
            <div className={css(styles.infoLabel)}>Precinct: </div>
            <div className={css(styles.infoText)}>{precinct.description}</div>
          </div>
          <div className={css(styles.infoRow)}>
            <div className={css(styles.infoLabel)}>{precinct.leadTitle}: </div>
            <div className={css(styles.infoText)}>{precinct.lead}</div>
          </div>
          <div className={css(styles.infoRow)}>
            <div className={css(styles.infoLabel)}>Instructions: </div>
            <div
              className={css(styles.infoText)}
              dangerouslySetInnerHTML={{ __html: precinct.instructions }}
            />
          </div>
        </div>

        <table className={css(styles.table)}>
          <thead>
            <tr>
              <th className={css(styles.headerCell)}>First Name</th>
              <th className={css(styles.headerCell)}>Last Name</th>
              <th className={css(styles.headerCell)}>Email</th>
              <th className={css(styles.headerCell)}>Phone</th>
              <th className={css(styles.headerCell)} width="200px">
                &nbsp;
              </th>
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
                  <button
                    className={css([
                      styles.actionButton,
                      workerStatuses[worker.id] === "yes"
                        ? styles.attendancePositive
                        : "",
                    ])}
                    onClick={setStatus}
                    value="yes"
                    id={worker.id}
                    type="button"
                  >
                    Did attend
                  </button>
                  <button
                    className={css([
                      styles.actionButton,
                      workerStatuses[worker.id] === "no"
                        ? styles.attendanceNegative
                        : "",
                    ])}
                    onClick={setStatus}
                    value="no"
                    id={worker.id}
                    type="button"
                  >
                    No Show
                  </button>
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
            {isPostingData ? "Submitting" : "Submit Attendance"}
          </button>
          <span className={css(styles.status)}>{postStatus}</span>
        </div>
      </div>
      <div className={css(styles.footer)}>
        <img src="usdr_logo.svg" alt="USDR logo" height={35} />
        <div className={css(styles.footerText)}>
          This app was provided by the U.S. Digital Response
        </div>
      </div>
    </div>
  );
}

const styles = StyleSheet.create({
  app: {
    fontFamily: "Helvetica, Arial",
    padding: "40px 35px",
  },
  loading: {
    fontFamily: "Helvetica, Arial",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "calc(100vh - 14px)",
  },
  topBar: {
    position: "fixed",
    borderBottom: "1px solid #e9e9e9",
    top: 0,
    left: 0,
    padding: "15px 42px",
    width: "100%",
    fontWeight: 900,
    fontSize: "19px",
    boxShadow: "0 0 11px 0px rgb(0 0 0 / 10%)",
  },
  content: {
    minHeight: "calc(100vh - 160px)",
  },
  info: {
    display: "flex",
    padding: "25px 0px",
  },
  infoRow: {
    display: "flex",
    flexDirection: "column",
    marginRight: "70px",
  },
  infoLabel: {
    fontWeight: "bold",
    paddingTop: "10px",
  },
  infoText: {
    paddingTop: "2px",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  headerCell: {
    textAlign: "left",
    padding: "5px",
    borderBottom: "2px solid #0075db",
    color: "#0075db",
    fontWeight: 500,
  },
  cell: {
    padding: "10px 5px",
    borderBottom: "1px solid #dad9d9",
  },
  actionButton: {
    padding: "7px 15px",
    marginRight: "4px",
    border: "none",
    color: "#999",
    cursor: "pointer",
    backgroundColor: "#EFEFEF",
    borderRadius: "7px",
  },
  attendancePositive: {
    backgroundColor: "#4caf50",
    color: "white",
  },
  attendanceNegative: {
    backgroundColor: "red",
    color: "white",
  },
  submit: {
    backgroundColor: "#0075db",
    color: "white",
    padding: "10px 20px",
    border: "none",
    borderRadius: "8px",
    marginTop: "20px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 450ms cubic-bezier(.645, .445, .355, 1)",
    ":hover": {
      backgroundColor: "#0065bd",
    },
  },
  status: {
    paddingLeft: "15px",
  },
  footer: {
    marginTop: "55px",
    display: "flex",
  },
  footerText: {
    display: "flex",
    alignItems: "center",
    width: "50%",
    color: "#999",
    paddingLeft: "25px",
    fontSize: "12px",
  },
});

export default App;
