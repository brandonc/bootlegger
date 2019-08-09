function rowlookup(
  search: string,
  range: GoogleAppsScript.Spreadsheet.Range
): string[][] | null {
  const finder = range.createTextFinder(search);
  const found = finder.findAll();

  if (found.length === 0) {
    return null;
  }

  return found.map((match: GoogleAppsScript.Spreadsheet.Range) => {
    const foundRange = range
      .getSheet()
      .getRange("A" + String(match.getRow()) + ":D" + String(match.getRow()));

    return foundRange.getDisplayValues()[0];
  });
}

function listSpreadsheets() {
  checkConfig();

  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheets()[0];
  const nameRange = sheet.getRange("A3:A");
  const sheets: string[] = [];

  const displayValues = nameRange.getDisplayValues();
  for (let i = 0; i < nameRange.getNumRows(); i++) {
    if (displayValues[i][0] === "") break;
    if (sheets.indexOf(displayValues[i][0]) < 0) {
      sheets.push(displayValues[i][0]);
    }
  }

  return sheets;
}

function publishAsJson(name: string, environment: string) {
  checkConfig();

  const config = getConfig();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheets()[0];

  const rows = rowlookup(name, sheet.getDataRange());

  if (rows === null) {
    throw Error(`Could not find a record named \"${name}\"`);
  }

  const url = config.apiHost;

  const options = {
    method: "post" as "post",
    payload: {
      spreadsheetName: rows[0][0],
      spreadsheetUrl: rows[0][1],
      environment,
      transformsJson: JSON.stringify(
        rows.map(row => ({ id: row[2], transform: row[3] }))
      ),
      apiSecret: config.apiSecret
    }
  };

  const response = UrlFetchApp.fetch(`${url}/deployments`, options);
  return JSON.parse(response.getContentText());
}
