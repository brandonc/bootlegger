type DeploymentRequest = {
  environment: string;
  transform: string;
  spreadsheetUrl: string;
  spreadsheetName: string;
};

function fromJson(data: any) {
  return data as DeploymentRequest;
}

export { DeploymentRequest as default, fromJson };
