/**
 * Apex REST resource: filtered list of Contacts.
 *
 * Endpoint: GET /services/apexrest/contacts
 *           GET /services/apexrest/contacts?name={filter}
 *
 * Query params:
 *   name  — optional LIKE filter applied to Contact.Name (e.g. "Smith"
 *            becomes %Smith%). Omit to return the first 10 contacts.
 *
 * Returns a List<ContactDTO> serialized as a JSON array.
 *
 * Used by Recipe 4.3 (Apex REST).
 */
@RestResource(urlMapping='/contacts')
global with sharing class ContactsResource {
  /**
   * @description Retrieves a filtered list of Contacts. Accepts an optional "name" query parameter for LIKE filtering.
   * @return A list of ContactDTO records matching the filter, or the first 10 contacts if no filter is provided.
   */
  @HttpGet
  global static List<ContactDTO> doGet() {
    String nameFilter = RestContext.request.params.get('name');

    List<Contact> contacts;
    if (String.isBlank(nameFilter)) {
      contacts = [
        SELECT Id, Name, Title, Phone, Picture__c
        FROM Contact
        WITH USER_MODE
        ORDER BY Name ASC
        LIMIT 10
      ];
    } else {
      String likePattern = '%' + nameFilter + '%';
      contacts = [
        SELECT Id, Name, Title, Phone, Picture__c
        FROM Contact
        WHERE Name LIKE :likePattern
        WITH USER_MODE
        ORDER BY Name ASC
        LIMIT 10
      ];
    }

    List<ContactDTO> result = new List<ContactDTO>();
    for (Contact c : contacts) {
      result.add(new ContactDTO(c));
    }
    return result;
  }

  /** @description Flat representation of a Contact record for REST serialization. */
  global class ContactDTO {
    public String id;
    public String name;
    public String title;
    public String phone;
    public String pictureUrl;

    /**
     * @description Constructs a ContactDTO from a Contact SObject.
     * @param c The Contact record to map.
     */
    public ContactDTO(Contact c) {
      this.id = c.Id;
      this.name = c.Name;
      this.title = c.Title;
      this.phone = c.Phone;
      this.pictureUrl = c.Picture__c;
    }
  }
}
