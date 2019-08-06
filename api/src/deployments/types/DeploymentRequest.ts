interface IDeploymentRequest {
  environment: string;
  transform: string;
  spreadsheetUrl: string;
  spreadsheetName: string;
}

function fromJson(data: any) {
  return data as IDeploymentRequest;
}

export { IDeploymentRequest as default, fromJson };
