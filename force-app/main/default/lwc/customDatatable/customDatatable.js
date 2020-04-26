import LightningDataTable from "lightning/datatable";
import linkPreview from "./linkPreview.html";

export default class CustomDatatable extends LightningDataTable {
  static customTypes = {
    filePreview: {
      template: linkPreview,
      typeAttributes: ["anchorText", "versionId"]
    }
  };
}
