/**
 * Returns the org's My Domain hostname, from which the Micro-Frontend Recipes
 * derive the origin of the UI bundles deployed to this org.
 */
public with sharing class MicrofrontendOrigin {
  /**
   * @description Returns the org's My Domain hostname, for example
   * `my-org-dev-ed.scratch.my.salesforce.com`. Contains no scheme or path.
   * @return The My Domain hostname of the current org.
   */
  @AuraEnabled(cacheable=true)
  public static String getOrgMyDomainHostname() {
    return DomainCreator.getOrgMyDomainHostname();
  }
}
