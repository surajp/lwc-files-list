import { LightningElement, api } from "lwc";
import { baseNavigation } from "lightning/datatableKeyboardMixins";
import template from "./filePreviewCol.html";
import { getDownloadUrl, getContentDocUrl } from "c/fileUtils";

export default class FilePreviewCol extends LightningElement {
  showPreview = false;
  @api fileId = "";
  @api label = "";
  @api versionId = "";

  get url() {
    return this.fileId
      ? this.fileId.startsWith("069")
        ? getContentDocUrl(this.fileId)
        : getDownloadUrl(this.fileId)
      : "#";
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
