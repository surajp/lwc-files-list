/**
  @description Gets related files for a record
  @author Suraj Pillai
  @date Apr, 2020
**/
public with sharing class GetFilesController {
  /**
    @description get related latest contentVersions of all Content documents given a record id
    @param recordId Id of the record to be fetched
    @return list of file wrapper objects, each representing a content version
  **/
  @AuraEnabled(cacheable=true)
  public static FilesWrapper[] getFilesList(Id recordId) {
    /*{{{*/

    FilesWrapper[] filesList = new List<FilesWrapper>{};
    for (ContentDocumentLink link : [
      SELECT
        ContentDocumentId,
        ContentDocument.LatestPublishedVersion.Title,
        ContentDocument.LatestPublishedVersion.CreatedDate,
        ContentDocument.LatestPublishedVersion.CreatedBy.Name
      FROM ContentDocumentLink
      WHERE LinkedEntityId = :recordId
    ]) {
      filesList.add(
        new FilesWrapper(
          link.ContentDocumentId,
          link.ContentDocument.LatestPublishedVersion.Title,
          link.ContentDocument.LatestPublishedVersion.CreatedBy.Name,
          Date.valueOf(link.ContentDocument.LatestPublishedVersion.CreatedDate)
        )
      );
    }
    return filesList;
  } /*}}}*/

  /**
    @description get details of contentversions for a content document
    @param recordId Id of the content document whose version details are to be fetched
    @return list of file version wrapper objects, each representing a content version
  **/
  @AuraEnabled(cacheable=true)
  public static FileVersionWrapper[] getFileVersionDetails(Id fileId) {
    /*{{{*/
    FileVersionWrapper[] contentversions = new List<FileVersionWrapper>{};
    for (ContentVersion cv : [SELECT title, createddate, createdby.name, VersionReason FROM ContentVersion WHERE ContentDocumentId = :fileId]) {
      contentVersions.add(new FileVersionWrapper(cv.Id, cv.title, cv.createdby.name, Date.valueOf(cv.createddate), cv.VersionReason));
    }
    return contentVersions;
  } /*}}}*/

  class FilesWrapper /*{{{*/ {
    @AuraEnabled
    public String id { get; set; }
    @AuraEnabled
    public String title { get; set; }
    @AuraEnabled
    public String createdBy { get; set; }
    @AuraEnabled
    public Date createdDate { get; set; }
    @AuraEnabled
    public String url {
      get {
        return '/' + this.id;
      }
      set;
    }

    public FilesWrapper() {
      /*{{{*/
      this.title = '';
      this.createdBy = '';
      this.createdDate = null;
      this.id = '';
    } /*}}}*/

    public FilesWrapper(String id, String title, String createdBy, Date createdDate) {
      this.id = id;
      this.title = title;
      this.createdBy = createdBy;
      this.createdDate = createdDate;
    }
  } /*}}}*/

  class FileVersionWrapper /*{{{*/ {
    @AuraEnabled
    public String id { get; set; }
    @AuraEnabled
    public String title { get; set; }
    @AuraEnabled
    public String createdBy { get; set; }
    @AuraEnabled
    public Date createdDate { get; set; }
    @AuraEnabled
    public String versionReason { get; set; }
    @AuraEnabled
    public String url {
      get {
        return '/' + this.id;
      }
      set;
    }

    public FileVersionWrapper() {
      /*{{{*/
      this.title = '';
      this.createdBy = '';
      this.createdDate = null;
      this.id = '';
      this.versionReason = '';
    } /*}}}*/

    public FileVersionWrapper(String id, String title, String createdBy, Date createdDate, String versionReason) {
      /*{{{*/
      this.id = id;
      this.title = title;
      this.createdBy = createdBy;
      this.createdDate = createdDate;
      this.versionReason = versionReason;
    } /*}}}*/
  } /*}}}*/
}
