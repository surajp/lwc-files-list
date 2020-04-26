import { LightningElement, api } from "lwc";
import NOPREVIEWIMGURL from "@salesforce/resourceUrl/nopreviewimg";

export default class FilePreviewComp extends LightningElement {
  @api fileId;
  @api heightInRem;

  get baseUrl() {
    return `https://${
      window.location.hostname.split(".")[0]
    }--c.documentforce.com`;
  }

  get url() {
    return `${this.baseUrl}/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=${this.fileId}&operationContext=CHATTER&page=0`;
  }

  fallback(event) {
    if (event.target.src != NOPREVIEWIMGURL) {
      event.target.src = NOPREVIEWIMGURL;
      this.template.querySelector("img").style.width = "200px";
      this.template.querySelector("img").style.height = "100px";
    }
  }
}
