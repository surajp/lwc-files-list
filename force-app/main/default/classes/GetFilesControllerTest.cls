@isTest
public with sharing class GetFilesControllerTest {
  @testSetup
  public static void setupData() {
    Account a = new Account(name = 'Sample');
    insert a;
    ContentVersion cv = new ContentVersion(Title = 'Test File', VersionData = Blob.valueOf('File content'), PathOnClient = 'sample.txt');
    insert cv;
    cv = [SELECT ContentDocumentId FROM ContentVersion WHERE Id = :cv.Id];
    insert new ContentDocumentLink(LinkedEntityId = a.Id, ContentDocumentId = cv.ContentDocumentId);
    cv = new ContentVersion(
      Title = 'Test File',
      VersionData = Blob.valueOf('File content'),
      PathOnClient = 'sample.txt',
      ContentDocumentId = cv.ContentDocumentId
    );
    insert cv;
  }

  @isTest
  public static void testFilesList() {
    Account a = [SELECT Id FROM Account LIMIT 1];
    GetFilesController.FilesWrapper[] wrapperList = GetFilesController.getFilesList(a.Id);
    System.assertEquals(1, wrapperList.size());
    GetFilesController.FileVersionWrapper[] versionWrapperList = GetFilesController.getFileVersionDetails(wrapperList[0].id);
    System.assertEquals(2, versionWrapperList.size());
  }

  @isTest
  public static void testCreateContentDocLink() {
    ContentVersion cv = new ContentVersion(Title = 'Test File', VersionData = Blob.valueOf('File content'), PathOnClient = 'sample.txt');
    insert cv;
    Account a = [SELECT Id FROM Account];
    Id contentDocId = GetFilesController.createContentDocLink(cv.Id, a.Id);
    GetFilesController.FilesWrapper[] wrapperList = GetFilesController.getFilesList(a.Id);
    System.assertEquals(2, wrapperList.size());
  }
}
