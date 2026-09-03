import { LightningElement, wire } from "lwc";
import { NavigationMixin } from "lightning/navigation";
import { gql, graphql } from "lightning/uiGraphQLApi";

// The Micro-Frontend Recipes app installs a custom Account record page
// with nine embedding recipes as accordion sections. This banner picks
// the first Account (any Account works; the data-tree import seeds
// ten) and navigates the user there. The record page is where the
// demos live.
const FIRST_ACCOUNT = gql`
  query FirstAccount {
    uiapi {
      query {
        Account(first: 1, orderBy: { Name: { order: ASC } }) {
          edges {
            node {
              Id
            }
          }
        }
      }
    }
  }
`;

export default class MicrofrontendRecipesLauncher extends NavigationMixin(
  LightningElement
) {
  recordId;
  error;

  @wire(graphql, { query: FIRST_ACCOUNT })
  wiredAccount({ data, errors }) {
    if (errors?.length) {
      this.error = errors.map((e) => e.message).join("; ");
      return;
    }
    if (!data) return;
    const id = data.uiapi.query.Account?.edges?.[0]?.node?.Id;
    if (id) {
      this.recordId = id;
    } else {
      this.error =
        "No Accounts found. Run `sf data tree import -p ./data/data-plan.json`.";
    }
  }

  get disabled() {
    return !this.recordId;
  }

  handleOpen() {
    if (!this.recordId) return;
    this[NavigationMixin.Navigate]({
      type: "standard__recordPage",
      attributes: {
        recordId: this.recordId,
        objectApiName: "Account",
        actionName: "view"
      }
    });
  }
}
