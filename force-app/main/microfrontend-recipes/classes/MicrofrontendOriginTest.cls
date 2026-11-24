@IsTest
private class MicrofrontendOriginTest {
  @IsTest
  static void testGetOrgMyDomainHostnameReturnsHostname() {
    String hostname = MicrofrontendOrigin.getOrgMyDomainHostname();

    Assert.isFalse(
      String.isBlank(hostname),
      'Expected a non-blank My Domain hostname'
    );
    Assert.isFalse(
      hostname.startsWith('http'),
      'Expected a bare hostname without a scheme'
    );
    Assert.isFalse(
      hostname.contains('/'),
      'Expected a bare hostname without a path'
    );
  }
}
