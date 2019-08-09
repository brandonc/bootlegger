interface IDeploymentRequest {
  environment: string;
  transforms: Array<{ id: string; transform: string }>;
  spreadsheetUrl: string;
  spreadsheetName: string;
}

function fromJson(data: any) {
  return {
    environment: data.environment,
    spreadsheetName: data.spreadsheetName,
    spreadsheetUrl: data.spreadsheetUrl,
    transforms: JSON.parse(data.transformsJson),
  };
}

export { IDeploymentRequest as default, fromJson };
