import {
  LitElement,
  html,
  css,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_CONTEXT, UMB_WORKSPACE_MODAL  } from "@umbraco-cms/backoffice/workspace";
import { UMB_DOCUMENT_ENTITY_TYPE, UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN } from '@umbraco-cms/backoffice/document';
import {
  GET_INFO_CONTEXT_TOKEN,
  GetInfoContext,
} from "./contexts/getInfo.context";
import type { Details, Usage } from "./api";
import { UmbModalRouteRegistrationController } from '@umbraco-cms/backoffice/router';

const ITEMS_PER_PAGE = 10;

@customElement("element-finder")
export default class ElementFinder extends UmbElementMixin(LitElement) {
  @state()
  private _nodes: Array<Details> = [];

  @state()
  private _contentTypeLabel = "Document Type";

  @state()
  private _loading = false;

  @state()
  private _error: string | null = null;

  @state()
  private _currentPage = 1;

  private _modalRegistration: UmbModalRouteRegistrationController;

  #getInfoContext?: GetInfoContext;

  constructor() {
    super();
    // Consume your OpenAPI context
    this.consumeContext(GET_INFO_CONTEXT_TOKEN, (instance) => {
      if (!instance) return;
      this.#getInfoContext = instance;
    });

    // Observe the workspace Document Type
    this.consumeContext(UMB_WORKSPACE_CONTEXT, (workspace) => {
      if (!workspace) return;

      this.observe((workspace as any).data, async (data: any) => {
        if (!data?.alias || !this.#getInfoContext) return;

        this._contentTypeLabel = data?.isElement ? "Element Type" : "Document Type";

        this._loading = true;
        this._error = null;

        try {
          const usage: Usage | null =
            await this.#getInfoContext.getInfoFromAlias(data.alias);

          if (usage?.usages?.length) {
            this._nodes = usage.usages;
            this._currentPage = 1; // reset page if data changes
          } else {
            this._nodes = [];
          }
        } catch (err) {
          console.error(err);
          this._error = "Error fetching usage";
          this._nodes = [];
        } finally {
          this._loading = false;
        }
      });
    });

    this._modalRegistration = new UmbModalRouteRegistrationController(
      this,
      UMB_WORKSPACE_MODAL,
    )
      .addAdditionalPath(UMB_DOCUMENT_ENTITY_TYPE)
      .onSetup(() => {
        return {
          data: { entityType: UMB_DOCUMENT_ENTITY_TYPE },
          modal: { size: "large" },
        };
      });
  }

  private get pagedNodes() {
    const start = (this._currentPage - 1) * ITEMS_PER_PAGE;
    return this._nodes.slice(start, start + ITEMS_PER_PAGE);
  }

  private totalPages() {
    return Math.ceil(this._nodes.length / ITEMS_PER_PAGE);
  }

  private nextPage() {
    if (this._currentPage < this.totalPages()) {
      this._currentPage++;
    }
  }

  private prevPage() {
    if (this._currentPage > 1) {
      this._currentPage--;
    }
  }

  private _openEditModal(id: string) {
    const path = UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN.generateLocal({
      unique: id,
    });
    this._modalRegistration.open({}, path);
  }

  private _instanceLabel(count: number) {
    return count === 1 ? "instance" : "instances";
  }

  render() {
    if (this._loading) return html`<uui-loader></uui-loader>`;

    return html`
      <uui-box>
        <div slot="header">
          <strong>
            Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)} of this
            ${this._contentTypeLabel}${this._nodes.length > 0 ? ":" : ""}
          </strong>
        </div>

        ${this._error
          ? html`<uui-tag look="danger">${this._error}</uui-tag>`
          : ""}
        ${this._nodes.length > 0
          ? html`
              <div class="usage-list">
                ${this.pagedNodes.map(
                  (node, index) => html`
                    <div class="usage-item">
                      <span class="page-name">${node.pageName}</span>
                      <div class="actions">
                        <uui-button
                          look="secondary"
                          label="Edit"
                          @click=${() => this._openEditModal(node.id)}
                        ></uui-button>
                        <uui-button
                          look="secondary"
                          label="View"
                          @click=${() => window.open(node.url, "_blank")}
                        ></uui-button>
                      </div>
                    </div>
                    ${index < this.pagedNodes.length - 1
                      ? html`<hr class="divider" />`
                      : null}
                  `,
                )}
              </div>

              <!-- Pagination -->
              ${this.totalPages() > 1
                ? html`
                    <div class="pagination">
                      <uui-button
                        label="Previous"
                        ?disabled=${this._currentPage === 1}
                        @click=${this.prevPage}
                      ></uui-button>
                      <span
                        >Page ${this._currentPage} of ${this.totalPages()}</span
                      >
                      <uui-button
                        label="Next"
                        ?disabled=${this._currentPage === this.totalPages()}
                        @click=${this.nextPage}
                      ></uui-button>
                    </div>
                  `
                : null}
            `
          : html`
              <uui-state-message>
                No content nodes are currently using this ${this._contentTypeLabel}.
              </uui-state-message>
            `}
      </uui-box>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: var(--uui-size-layout-1);
    }

    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }

    .usage-list {
      display: flex;
      flex-direction: column;
      gap: var(--uui-size-1);
    }

    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: var(--uui-size-2) 0;
    }

    .page-name {
      font-weight: 500;
    }

    .divider {
      border: none;
      border-bottom: 1px solid var(--uui-color-border);
      margin: 0;
    }

    .pagination {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: var(--uui-size-2);
    }
  `;
}
