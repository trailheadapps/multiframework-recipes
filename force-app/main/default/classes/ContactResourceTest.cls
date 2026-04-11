@IsTest
private class ContactResourceTest {
  @TestSetup
  static void setup() {
    Contact c = new Contact(
      FirstName = 'Test',
      LastName = 'User',
      Title = 'Engineer',
      Phone = '555-1234'
    );
    insert c;
  }

  @IsTest
  static void testDoGetReturnsContact() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      Contact c = [SELECT Id FROM Contact LIMIT 1];

      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contact/' + c.Id;
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      ContactResource.ContactDTO result = ContactResource.doGet();
      Test.stopTest();

      Assert.isNotNull(result, 'Expected a ContactDTO to be returned');
      Assert.areEqual(c.Id, result.id, 'Id should match');
      Assert.areEqual('Test User', result.name, 'Name should match');
      Assert.areEqual('Engineer', result.title, 'Title should match');
      Assert.areEqual('555-1234', result.phone, 'Phone should match');
    }
  }

  @IsTest
  static void testDoGetReturns404ForInvalidId() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contact/001000000000000AAA';
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      ContactResource.ContactDTO result = ContactResource.doGet();
      Test.stopTest();

      Assert.isNull(result, 'Expected null for non-existent contact');
      Assert.areEqual(
        404,
        RestContext.response.statusCode,
        'Status code should be 404'
      );
    }
  }
}
