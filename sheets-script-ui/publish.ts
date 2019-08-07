function rowlookup(
  search: string,
  range: GoogleAppsScript.Spreadsheet.Range
): string[] | null {
  const finder = range.createTextFinder(search);
  const found = finder.findAll();

  if (found.length === 0) {
    return null;
  }

  const firstMatch = found[0];

  const foundRange = range
    .getSheet()
    .getRange(
      "A" + String(firstMatch.getRow()) + ":D" + String(firstMatch.getRow())
    );

  return foundRange.getDisplayValues()[0];
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
    sheets.push(displayValues[i][0]);
  }

  return sheets;
}

function publishAsJson(name: string, environment: string) {
  checkConfig();

  const config = getConfig();
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = spreadsheet.getSheets()[0];

  const values = rowlookup(name, sheet.getDataRange());

  if (values === null) {
    throw Error(`Could not find a record named \"${name}\"`);
  }

  const url = config.apiHost;

  const options = {
    method: "post" as "post",
    payload: {
      spreadsheetName: values[0],
      spreadsheetUrl: values[1],
      environment,
      transform: values[2],
      apiSecret: config.apiSecret
    }
  };

  const response = UrlFetchApp.fetch(`${url}/deployments`, options);
  return JSON.parse(response.getContentText());
}
