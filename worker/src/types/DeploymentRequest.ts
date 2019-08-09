interface IDeploymentRequest {
  environment: string;
  requestId: string;
  transforms: Array<{ id: string; transform: string }>;
  spreadsheetUrl: string;
  spreadsheetName: string;
}

function fromJson(requestId: string, data: any): IDeploymentRequest {
  return {
    environment: data.environment,
    requestId,
    spreadsheetName: data.spreadsheetName,
    spreadsheetUrl: data.spreadsheetUrl,
    transforms: JSON.parse(data.transformsJson),
  };
}

export { IDeploymentRequest as default, fromJson };
