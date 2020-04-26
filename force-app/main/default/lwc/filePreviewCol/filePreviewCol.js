import { LightningElement, api } from "lwc";
import { baseNavigation } from "lightning/datatableKeyboardMixins";
import template from "./filePreviewCol.html";

export default class FilePreviewCol extends LightningElement {
  showPreview = false;
  @api fileId = "";
  @api label = "";
  @api versionId = "";

  get url() {
    return this.fileId ? "/" + this.fileId : "#";
  }

  get fileOrVersionId() {
    return this.versionId || this.fileId;
  }

  handleMouseOver() {
    this.showPreview = true;
  }

  handleMouseOut() {
    this.showPreview = false;
  }
}
