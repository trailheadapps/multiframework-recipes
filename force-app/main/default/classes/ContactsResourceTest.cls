@IsTest
private class ContactsResourceTest {
  @TestSetup
  static void setup() {
    List<Contact> contacts = new List<Contact>();
    contacts.add(
      new Contact(
        FirstName = 'Alice',
        LastName = 'Smith',
        Title = 'Manager',
        Phone = '555-0001'
      )
    );
    contacts.add(
      new Contact(
        FirstName = 'Bob',
        LastName = 'Jones',
        Title = 'Developer',
        Phone = '555-0002'
      )
    );
    contacts.add(
      new Contact(
        FirstName = 'Carol',
        LastName = 'Smith',
        Title = 'Designer',
        Phone = '555-0003'
      )
    );
    insert contacts;
  }

  @IsTest
  static void testDoGetReturnsContactsWithoutFilter() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contacts';
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      List<ContactsResource.ContactDTO> results = ContactsResource.doGet();
      Test.stopTest();

      Assert.areEqual(3, results.size(), 'Should return all 3 test contacts');
    }
  }

  @IsTest
  static void testDoGetFiltersContactsByName() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contacts';
      req.params.put('name', 'Smith');
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      List<ContactsResource.ContactDTO> results = ContactsResource.doGet();
      Test.stopTest();

      Assert.areEqual(
        2,
        results.size(),
        'Should return 2 contacts matching Smith'
      );
      for (ContactsResource.ContactDTO dto : results) {
        Assert.isTrue(
          dto.name.contains('Smith'),
          'Each result should contain Smith in the name'
        );
      }
    }
  }

  @IsTest
  static void testDoGetReturnsEmptyListForNoMatch() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contacts';
      req.params.put('name', 'Nonexistent');
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      List<ContactsResource.ContactDTO> results = ContactsResource.doGet();
      Test.stopTest();

      Assert.areEqual(
        0,
        results.size(),
        'Should return empty list for no matches'
      );
    }
  }

  @IsTest
  static void testDoGetWithBlankFilterReturnsAll() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contacts';
      req.params.put('name', '');
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      List<ContactsResource.ContactDTO> results = ContactsResource.doGet();
      Test.stopTest();

      Assert.areEqual(
        3,
        results.size(),
        'Blank name filter should return all contacts'
      );
    }
  }

  @IsTest
  static void testDoGetReturnsSortedByName() {
    User u = [SELECT Id FROM User WHERE Id = :UserInfo.getUserId()];
    System.runAs(u) {
      RestRequest req = new RestRequest();
      req.requestURI = '/services/apexrest/contacts';
      RestContext.request = req;
      RestContext.response = new RestResponse();

      Test.startTest();
      List<ContactsResource.ContactDTO> results = ContactsResource.doGet();
      Test.stopTest();

      Assert.isTrue(
        results.size() >= 2,
        'Need at least 2 results to verify sort order'
      );
      Assert.isTrue(
        results[0].name <= results[1].name,
        'Results should be sorted by name ascending'
      );
    }
  }
}
