/** @OnlyCurrentDoc */

function onOpen() {
  SpreadsheetApp.getUi()
    .createAddonMenu()
    .addItem("Publish to Web", "PublishSidebar")
    .addItem("Configure", "ConfigureSidebar")
    .addToUi();
}

function onInstall() {
  onOpen();
}

function PublishSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile("PublishSidebar").setTitle(
    "Publish to Web"
  );
  SpreadsheetApp.getUi().showSidebar(ui);
}

function ConfigureSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile("ConfigSidebar").setTitle(
    "Configure"
  );
  SpreadsheetApp.getUi().showSidebar(ui);
}
