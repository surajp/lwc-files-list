import { createElement } from "lwc";
import FilePreviewComp from "c/filePreviewComp";

describe("c-file-preview-comp", () => {
  beforeAll(() => {
    delete window.location;
    window.location = {
      hostname: "mycustomdomain.lightning.force.com"
    };
  });

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("returns url", () => {
    const element = createElement("c-file-preview-comp", {
      is: FilePreviewComp
    });
    element.fileId = "abc";
    document.body.appendChild(element);
    const img = element.shadowRoot.querySelector("img");
    expect(img.src).toBe(
      "https://mycustomdomain--c.documentforce.com/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB720BY480&versionId=abc&operationContext=CHATTER&page=0"
    );
  });

  it("returns fallback", () => {
    const element = createElement("c-file-preview-comp", {
      is: FilePreviewComp
    });
    element.fileId = "abc";
    document.body.appendChild(element);
    const img = element.shadowRoot.querySelector("img");
    img.dispatchEvent(new CustomEvent("error"));
    return Promise.resolve().then(() => {
      expect(img.src).toBe("http://localhost/nopreviewimg");
    });
  });
});
