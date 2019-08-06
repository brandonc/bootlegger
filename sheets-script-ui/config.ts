function getConfig() {
  const props = PropertiesService.getUserProperties();

  return {
    apiHost: props.getProperty("apiHost"),
    apiSecret: props.getProperty("apiSecret")
  };
}

function saveConfig(apiHost: string, apiSecret: string) {
  const props = PropertiesService.getUserProperties();

  while (apiHost !== null && apiHost.match(/\/$/)) {
    apiHost = apiHost.substring(0, apiHost.length - 1);
  }

  props.setProperties({
    apiHost,
    apiSecret
  });

  return true;
}

function checkConfig() {
  const props = PropertiesService.getUserProperties();
  if (props.getProperty("apiHost") === "") {
    throw new Error(
      "No configuration detected. Go to <pre>Publish via Bootlegger > Configure</pre> before continuing."
    );
  }
}
