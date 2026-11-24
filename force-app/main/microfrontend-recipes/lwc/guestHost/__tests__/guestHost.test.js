jest.mock(
  "@salesforce/apex/MicrofrontendOrigin.getOrgMyDomainHostname",
  () => ({ default: jest.fn() }),
  { virtual: true }
);

const HOSTNAME = "my-org-dev-ed.scratch.my.salesforce.com";
const ORIGIN = "https://my-org-dev-ed--c.scratch.my.salesforce.app";

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

// The module is a singleton (shared selection, cached origin); load a fresh
// copy per test.
function load(hostname = HOSTNAME) {
  jest.resetModules();
  window.localStorage.clear();
  const apex =
    require("@salesforce/apex/MicrofrontendOrigin.getOrgMyDomainHostname").default;
  if (hostname instanceof Error) apex.mockRejectedValue(hostname);
  else apex.mockResolvedValue(hostname);
  return { host: require("../guestHost"), apex };
}

describe("c-guest-host", () => {
  describe("toGuestOrigin", () => {
    it.each([
      [
        "my-org-dev-ed.scratch.my.salesforce.com",
        "https://my-org-dev-ed--c.scratch.my.salesforce.app"
      ],
      ["acme.my.salesforce.com", "https://acme--c.my.salesforce.app"],
      [
        "acme--uat.sandbox.my.salesforce.com",
        "https://acme--uat--c.sandbox.my.salesforce.app"
      ]
    ])("maps %s to %s", (hostname, expected) => {
      expect(load().host.toGuestOrigin(hostname)).toBe(expected);
    });
  });

  describe("subscribeGuestSrc", () => {
    it("emits the React bundle src once the org origin resolves", async () => {
      const { host, apex } = load();
      const callback = jest.fn();
      host.subscribeGuestSrc("basic-render", callback);
      expect(callback).not.toHaveBeenCalled();

      await flush();
      expect(callback).toHaveBeenLastCalledWith(
        `${ORIGIN}/app/c__reactRecipes/embedding/basic-render`
      );
      expect(apex).toHaveBeenCalledTimes(1);
    });

    it("only calls Apex once for many subscribers", async () => {
      const { host, apex } = load();
      host.subscribeGuestSrc("basic-render", jest.fn());
      host.subscribeGuestSrc("send-to-host", jest.fn());
      await flush();
      expect(apex).toHaveBeenCalledTimes(1);
    });

    it("remounts on selection change: clears the src, then sets the new one", async () => {
      const { host } = load();
      const callback = jest.fn();
      host.subscribeGuestSrc("basic-render", callback);
      await flush();
      callback.mockClear();

      host.setGuestSelection({ mode: "angular" });
      expect(callback).toHaveBeenCalledTimes(1);
      expect(callback).toHaveBeenLastCalledWith(undefined);

      await Promise.resolve();
      expect(callback).toHaveBeenLastCalledWith(
        `${ORIGIN}/app/c__angularRecipes/embedding/basic-render`
      );
    });

    it("uses the external URL, tolerating a trailing slash", async () => {
      const { host } = load();
      host.setGuestSelection({
        mode: "external",
        externalUrl: "http://localhost:5173/"
      });
      expect(host.buildGuestSrc("receive-event")).toBe(
        "http://localhost:5173/embedding/receive-event"
      );
    });

    it("emits nothing for an invalid external URL", () => {
      const { host } = load();
      host.setGuestSelection({ mode: "external", externalUrl: "not a url" });
      expect(host.buildGuestSrc("basic-render")).toBeUndefined();
    });

    it("stops notifying after unsubscribe", async () => {
      const { host } = load();
      const callback = jest.fn();
      const unsubscribe = host.subscribeGuestSrc("basic-render", callback);
      await flush();
      callback.mockClear();

      unsubscribe();
      host.setGuestSelection({ mode: "angular" });
      await flush();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe("selection", () => {
    it("defaults to React with the local dev server as the external URL", () => {
      const state = load().host.getGuestState();
      expect(state.mode).toBe("react");
      expect(state.externalUrl).toBe("http://localhost:5173");
    });

    it("persists the selection across loads", () => {
      const { host } = load();
      host.setGuestSelection({ mode: "angular" });
      jest.resetModules();
      // Same localStorage, fresh module.
      expect(require("../guestHost").getGuestState().mode).toBe("angular");
    });

    it("ignores unknown modes", () => {
      const { host } = load();
      host.setGuestSelection({ mode: "vue" });
      expect(host.getGuestState().mode).toBe("react");
    });
  });

  describe("failure", () => {
    it("reports the Apex error to state subscribers", async () => {
      const { host } = load(new Error("no access"));
      const callback = jest.fn();
      host.subscribeGuestState(callback);
      await flush();
      expect(callback).toHaveBeenLastCalledWith(
        expect.objectContaining({ error: "no access", base: undefined })
      );
    });
  });

  describe("external URL validation", () => {
    it.each(["javascript:alert(1)", "data:text/html,hi", "not a url"])(
      "emits no src for %s",
      (externalUrl) => {
        const { host } = load();
        host.setGuestSelection({ mode: "external", externalUrl });
        expect(host.buildGuestSrc("basic-render")).toBeUndefined();
      }
    );
  });
});
