import { LightningElement, wire, api } from "lwc";
import getRelatedFiles from "@salesforce/apex/GetFilesController.getFilesList";
import getFileVersionDetails from "@salesforce/apex/GetFilesController.getFileVersionDetails";
import createContentDocLink from "@salesforce/apex/GetFilesController.createContentDocLink";
import { deleteRecord, getRecord, createRecord } from "lightning/uiRecordApi";
import { ShowToastEvent } from "lightning/platformShowToastEvent";
import { refreshApex } from "@salesforce/apex";

const actions = [
  { label: "Version Details", name: "show_details" },
  { label: "Upload New Version", name: "upload_version" },
  { label: "Delete File", name: "delete" }
];

const BASE64EXP = new RegExp(/^data(.*)base64,/);
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
  { label: "Title", fieldName: "title", type: "string" },
  { label: "Reason for Change", fieldName: "reasonForChange", type: "string" },
  { label: "Uploaded Date", fieldName: "createdDate", type: "date" },
  { label: "Uploaded by", fieldName: "createdBy", type: "string" }
];

export default class FilesRelatedList extends LightningElement {
  @api
  recordId;

  _filesList;
  fileTitle;
  fileName;
  files = [];
  showModal = false;
  columns = columns;
  versionColumns = versionColumns;
  versionDetails = [];
  fileUpload = false;
  _currentDocId = null;

  handleFileNameChange(event) {
    this.fileTitle = event.detail.value;
  }

  handleFileChange() {
    const inpFiles = this.template.querySelector("input.file").files;
    if (inpFiles && inpFiles.length > 0) this.fileName = inpFiles[0].name;
  }

  @wire(getRelatedFiles, { recordId: "$recordId" })
  getFilesList(filesList) {
    this._filesList = filesList;
    const { error, data } = filesList;
    //{{{
    if (!error && data) {
      this.files = data;
      console.log("files found " + JSON.stringify(this.files));
    }
  } //}}}

  closeModal() {
    //{{{
    this.showModal = false;
    this._currentDocId = null;
    this.fileUpload = false;
    this.versionDetails = [];
    this.fileName = "";
    this.fileTitle = "";
    refreshApex(this._filesList);
  } //}}}

  handleRowAction(event) {
    //{{{
    console.log(">> handle row action " + event.detail.action.name);
    const action = event.detail.action.name;
    const row = event.detail.row;
    this._currentDocId = row.id;
    if (action == "show_details") {
      this.fileUpload = false;
      this.showVersionDetails();
    } else if (action == "upload_version") {
      this.fileUpload = true;
      this.showModal = true;
    } else if (action == "delete") {
      this._deleteRecord([this._currentDocId]);
    }
  } //}}}

  _deleteRecord(recordIds) {
    Promise.all(recordIds.map((id) => deleteRecord(id)))
      .then(() => {
        refreshApex(this._filesList);
        this.dispatchEvent(
          new ShowToastEvent({
            variant: "success",
            message: `Record(s) deleted successfully`
          })
        );
      })
      .catch((err) => {
        this.dispatchEvent(
          new ShowToastEvent({
            variant: "error",
            message: `Error occurred while deleting records: ${
              err.body ? err.body.message || err.body.error : err
            }`
          })
        );
      });
  }

  newFileUpload() {
    //{{{
    this.showModal = true;
    this.fileUpload = true;
  } //}}}

  showVersionDetails() {
    //{{{
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
  } //}}}

  handleUpload(event) {
    //{{{
    event.preventDefault();
    const file = this.template.querySelector("input.file").files[0];
    const reasonForChange = this.template.querySelector("lightning-input.text")
      .value;
    const reader = new FileReader();
    let fileData = "";
    reader.onload = () => {
      fileData = reader.result;
      this._uploadFile(file, fileData, reasonForChange);
    };
    reader.readAsDataURL(file);
  } //}}}

  _uploadFile(file, fileData, reasonForChange) {
    //{{{
    const payload = {
      Title: this.fileTitle || this.fileName,
      PathOnClient: file.name,
      ReasonForChange: reasonForChange,
      VersionData: fileData.replace(BASE64EXP, "")
    };
    if (this._currentDocId) {
      payload.ContentDocumentId = this._currentDocId;
    }
    createRecord({ apiName: "ContentVersion", fields: payload })
      .then((cVersion) => {
        if (!this._currentDocId) {
          this._createContentDocLink(cVersion.id);
        } else {
          this.closeModal();
          this.dispatchEvent(
            new ShowToastEvent({
              variant: "success",
              message: `Content Document Version created ${cVersion.id}`
            })
          );
        }
      })
      .catch((err) => {
        this.dispatchEvent(
          new ShowToastEvent({
            variant: "error",
            message: `An error occurred: ${err.body.message || err.body.error}`
          })
        );
      });
  } //}}}

  _createContentDocLink(cvId) {
    createContentDocLink({
      contentVersionId: cvId,
      recordId: this.recordId
    })
      .then((cId) => {
        this.closeModal();
        this.dispatchEvent(
          new ShowToastEvent({
            variant: "success",
            message: `File uploaded successfully ${cId}`
          })
        );
      })
      .catch((err) => {
        this.dispatchEvent(
          new ShowToastEvent({
            variant: "error",
            message: `An error occurred: ${
              err.body ? err.body.message || err.body.error : err
            }`
          })
        );
      });
  }
}
