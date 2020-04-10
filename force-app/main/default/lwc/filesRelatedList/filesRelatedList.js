import { LightningElement, wire, api } from "lwc";
import getRelatedFiles from "@salesforce/apex/GetFilesController.getFilesList";
import getFileVersionDetails from "@salesforce/apex/GetFilesController.getFileVersionDetails";

const actions = [{ label: "Version Details", name: "show_details" }];

const columns = [
  {
    label: "Id",
    fieldName: "url",
    type: "url",
    typeAttributes: { label: { fieldName: "title" } }
  },
  { label: "Uploaded Date", fieldName: "createdDate", type: "date" },
  { label: "Uploaded by", fieldName: "createdBy", type: "string" },
  { type: "action", typeAttributes: { rowActions: actions } }
];

const versionColumns = [
  {
    label: "Download Link",
    fieldName: "url",
    type: "url",
    typeAttributes: { label: { fieldName: "title" } }
  },
  { label: "Uploaded Date", fieldName: "createdDate", type: "date" },
  { label: "Uploaded by", fieldName: "createdBy", type: "string" }
];

export default class FilesRelatedList extends LightningElement {
  @api
  recordId;

  files = [];
  showModal = false;
  columns = columns;
  versionColumns = versionColumns;
  versionDetails = [];

  @wire(getRelatedFiles, { recordId: "$recordId" })
  getFilesList({ error, data }) {
    if (!error && data) {
      this.files = data;
      console.log("files found " + JSON.stringify(this.files));
    }
  }

  closeModal() {
    this.showModal = false;
    this.versionDetails = [];
  }

  handleRowAction(event) {
    console.log(">> handle row action " + event.detail.action.name);
    const row = event.detail.row;
    this.showVersionDetails(row.id);
  }

  showVersionDetails(id) {
    console.log(">> file version details");
    getFileVersionDetails({ fileId: id })
      .then((result) => {
        console.log(">> version details " + JSON.stringify(result));
        this.versionDetails = result;
        this.showModal = true;
      })
      .catch((err) => {
        console.error(JSON.stringify(err));
      });
  }
}
