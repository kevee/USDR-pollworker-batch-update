const Airtable = require("airtable");

const configBaseAirtableConnection = new Airtable({
  apiKey: process.env.AIRTABLE_API_KEY,
});

const getCountyConfig = async (configId) => {
  try{
    const configBase = configBaseAirtableConnection.base(
      process.env.CONFIG_BASE_ID
    );
    const configRecord = await configBase(process.env.CONFIG_TABLE_ID).find(
      configId
    );
    return configRecord.fields;
  } catch (err) {
    console.log(err);
    return {};
  }
};

exports.getPollWorkers = async (configId, precinctId) => {
  try{
    const config = await getCountyConfig(configId);

    // TEMP: USE .env to protect my own API key
    // const countyBaseAirtableConnection = new Airtable({ apiKey: config['API Key'] });
    const countyBaseAirtableConnection = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    const base = countyBaseAirtableConnection.base(config["Base ID"]);

    const precinctRecord = await base(config["Precincts table ID"]).find(
      precinctId
    );

    const pollWorkers =
      precinctRecord.fields[config["Field name: Precincts - Poll Workers"]];

    const workerData = [];
    for (const workerId of pollWorkers) {
      const workerRecord = await base(config["Poll Workers table ID"]).find(
        workerId
      );
      const relevantData = {
        id: workerRecord.id,
        firstName:
          workerRecord.fields[config["Field name: Poll Workers - First name"]],
        lastName:
          workerRecord.fields[config["Field name: Poll Workers - Last name"]],
        phone: workerRecord.fields[config["Field name: Poll Workers - Phone"]],
        email: workerRecord.fields[config["Field name: Poll Workers - Email"]],
      };
      workerData.push(relevantData);
    }

    return { workerData };
  } catch(err){
    console.log(err);
    return {};
  }
  
};

exports.getPrecinct = async (configId, precinctId) => {
  try{
    const config = await getCountyConfig(configId);
    // TEMP: USE .env to protect my own API key
    // const countyBaseAirtableConnection = new Airtable({ apiKey: config['API Key'] });
    const countyBaseAirtableConnection = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    const base = countyBaseAirtableConnection.base(config["Base ID"]);

    const precinctRecord = await base(config["Precincts table ID"]).find(
      precinctId
    );

    const countyName = config["County Name"];
    const leadTitle = config["Lead Title"];
    const instructions = config["UI Instructions"];
    const description =
      precinctRecord.fields[config["Field name: Precinct - Description"]];
    const leadRecord =
      precinctRecord.fields[config["Field name: Precinct - Lead"]];

    const workerRecord = await base(config["Poll Workers table ID"]).find(
      leadRecord[0]
    );
    const leadFirstName =
      workerRecord.fields[config["Field name: Poll Workers - First name"]];
    const leadLastName =
      workerRecord.fields[config["Field name: Poll Workers - Last name"]];

    const data = {
      countyName,
      leadTitle,
      instructions,
      description,
      leadName: `${leadFirstName} ${leadLastName}`,
    };

    return data;
  } catch(err){
    console.log(err);
    return {};
  }
};

exports.updateWorkerStatuses = async (configId, workerStatuses) => {
  const config = await getCountyConfig(configId);
  try {
    // TEMP: USE .env to protect my own API key
    // const countyBaseAirtableConnection = new Airtable({ apiKey: config['API Key'] });
    const countyBaseAirtableConnection = new Airtable({
      apiKey: process.env.AIRTABLE_API_KEY,
    });
    const base = countyBaseAirtableConnection.base(config["Base ID"]);

    const recordsToUpdate = Object.keys(workerStatuses).reduce(
      (store, workerId) => {
        const electionDayStatus =
          workerStatuses[workerId] === "yes"
            ? config["Field value: Poll Workers - status - Attended"]
            : config["Field value: Poll Workers - status - No show"];
        const recordData = {
          id: workerId,
          fields: {
            [config["Field name: Poll Workers - Election Day Status"]]:
              electionDayStatus,
          },
        };
        store.push(recordData);
        return store;
      },
      []
    );

    let n = 0;
    const numRecords = recordsToUpdate.length;
    while (n < numRecords) {
      const batchOfRecordsToUpdate = recordsToUpdate.slice(n, n + 10);
      await base(config["Poll Workers table ID"]).update(
        batchOfRecordsToUpdate
      );
      n += 10;
    }
    return true;
  } catch (err) {
    console.log(err);
    return false;
  }
};
