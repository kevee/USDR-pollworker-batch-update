const Airtable = require('airtable');

const airtableConnection = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY });

exports.getPollWorkers = async (baseId, workersTableId, precinctTableId, precinctId) => {
  const base = airtableConnection.base(baseId);

  const precinctRecord = await base(precinctTableId).find(precinctId);

  const pollWorkers = precinctRecord.fields['Poll Workers'];

  const workerData = [];
  for (const workerId of pollWorkers) {
    const workerRecord = await base(workersTableId).find(workerId);
    const relevantData = {
      id: workerRecord.id,
      firstName: workerRecord.fields['First Name'],
      lastName: workerRecord.fields['Last Name'],
      address: workerRecord.fields['Full Mail Address'],
      phone: workerRecord.fields['Phone'],
      email: workerRecord.fields['Email'],
    }
    workerData.push(relevantData);
  }

  return { workerData };
};

exports.getPrecinct = async (baseId, workersTableId, precinctTableId, precinctId) => {
  const base = airtableConnection.base(baseId);

  const precinctRecord = await base(precinctTableId).find(precinctId);

  const leadRecord = precinctRecord.fields['Precinct Lead'];
  const description = precinctRecord.fields['Description'];
  const workerRecord = await base(workersTableId).find(leadRecord[0]);

  const data = {
    leadName: `${workerRecord.fields['First Name']} ${workerRecord.fields['Last Name']}`,
    description,
  };

  return data;
};

exports.updateWorkerStatuses = async (baseId, workersTableId, workerStatuses) => {
  try {
    const base = airtableConnection.base(baseId);

    const recordsToUpdate = Object.keys(workerStatuses).reduce((store, workerId) => {
      const electionDayStatus = workerStatuses[workerId] === 'yes' ? 'Attended' : 'No Show';
      const recordData = {
        id: workerId,
        fields: {
          'Election Day Status': electionDayStatus,
        },
      };
      store.push(recordData);
      return store;
    }, []);

    let n = 0;
    const numRecords = recordsToUpdate.length;
    while (n < numRecords) {
      const batchOfRecordsToUpdate = recordsToUpdate.slice(n, n + 10);
      await base(workersTableId).update(batchOfRecordsToUpdate);
      n += 10;
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
