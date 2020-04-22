import { LightningElement, wire, api } from "lwc";
import getRelatedFiles from "@salesforce/apex/GetFilesController.getFilesList";
import getFileVersionDetails from "@salesforce/apex/GetFilesController.getFileVersionDetails";
import { createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";

const actions = [
  { label: "Version Details", name: "show_details" },
  { label: "Upload", name: "upload_version" }
];

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
    typeAttributes: { label: "Download" }
  },
  { label: "Version Reason", fieldName: "versionReason", type: "string" },
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
  fileUpload = false;
  _currentDocId = null;

  @wire(getRelatedFiles, { recordId: "$recordId" })
  getFilesList({ error, data }) {
    if (!error && data) {
      this.files = data;
      console.log("files found " + JSON.stringify(this.files));
    }
  }

  closeModal() {
    this.showModal = false;
    this._currentDocId = null;
    this.fileUpload = false;
    this.versionDetails = [];
  }

  handleRowAction(event) {
    console.log(">> handle row action " + event.detail.action.name);
    const action = event.detail.action.name;
    this._currentDocId = row.id;
    if (action == "show_details") {
      const row = event.detail.row;
      this.fileUpload = false;
      this.showVersionDetails();
    } else if (action == "upload_version") {
      this.fileUpload = true;
    }
  }

  newFileUpload() {
    this.showModal = true;
    this.fileUpload = true;
  }

  showVersionDetails() {
    console.log(">> file version details");
    getFileVersionDetails({ fileId: this._currentDocId })
      .then((result) => {
        console.log(">> version details " + JSON.stringify(result));
        this.versionDetails = result;
        this.showModal = true;
      })
      .catch((err) => {
        console.error(JSON.stringify(err));
      });
  }

  handleUpload(event) {
    event.preventDefault();
    const file = this.template.querySelector("input.file").files[0];
    const reader = new FileReader();
    let fileData = "";
    reader.onload = () => {
      fileData = reader.result;
      this._uploadFile(file, fileData);
    };
    reader.readAsDataURL(file);
  }

  _uploadFile(file, fileData) {
    const payload = {
      Title: file.name,
      PathOnClient: file.name,
      VersionData: fileData.replace(BASE64EXP, "")
    };
    if (this._currentDocId) {
      payload.ContentDocumentId = this._currentDocId;
    }
    createRecord(payload).then(() => {
      this.closeModal();
      this.dispatchEvent(
        new ShowToastEvent({
          variant: "success",
          message: `Content Document Link created`
        })
      );
    });
  }
}
