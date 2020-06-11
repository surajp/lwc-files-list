const getDocBaseUrl = () => {
  return `https://${
    window.location.hostname.split(".")[0]
  }--c.documentforce.com`;
};

const getDownloadUrl = (fileId) => {
  return `${getDocBaseUrl()}/sfc/servlet.shepherd/version/download/${fileId}`;
};

const getPreviewUrl = (fileId) => {
  return `${getDocBaseUrl()}/sfc/servlet.shepherd/version/renditionDownload?rendition=THUMB240BY180&versionId=${fileId}&operationContext=CHATTER&page=0`;
};

const getContentDocUrl = (fileId) => {
  return `/lightning/r/ContentDocument/${fileId}/view`;
};

export { getDownloadUrl, getPreviewUrl, getContentDocUrl };
