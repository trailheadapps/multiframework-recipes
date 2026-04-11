/**
 * Apex REST resource: single Contact lookup by Id.
 *
 * Endpoint: GET /services/apexrest/contact/{id}
 *
 * Returns a flat ContactDTO so the React client can read plain
 * string values directly (no { value } wrapper like UI API).
 *
 * Used as a companion to Recipe 4.1 (UI API REST) to illustrate
 * the difference between UI API format and custom Apex output.
 */
@RestResource(urlMapping='/contact/*')
global with sharing class ContactResource {
  /**
   * @description Retrieves a single Contact by Id from the request URI.
   * @return A ContactDTO with the contact's details, or null with a 404 status if not found.
   */
  @HttpGet
  global static ContactDTO doGet() {
    String recordId = RestContext.request.requestURI.substringAfterLast('/');
    try {
      Contact c = [
        SELECT Id, Name, Title, Phone, Picture__c
        FROM Contact
        WHERE Id = :recordId
        WITH USER_MODE
        LIMIT 1
      ];
      return new ContactDTO(c);
    } catch (QueryException e) {
      RestContext.response.statusCode = 404;
      return null;
    }
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
