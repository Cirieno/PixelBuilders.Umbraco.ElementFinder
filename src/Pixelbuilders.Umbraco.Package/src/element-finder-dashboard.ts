import {
  LitElement,
  html,
  css,
  customElement,
  state,
} from "@umbraco-cms/backoffice/external/lit";
import { UmbElementMixin } from "@umbraco-cms/backoffice/element-api";
import { UMB_WORKSPACE_MODAL } from "@umbraco-cms/backoffice/workspace";
import {
  UMB_DOCUMENT_ENTITY_TYPE,
  UMB_EDIT_DOCUMENT_WORKSPACE_PATH_PATTERN,
} from "@umbraco-cms/backoffice/document";
import {
  GET_INFO_CONTEXT_TOKEN,
  GetInfoContext,
} from "./contexts/getInfo.context";
import type { Details, Elements, Usage } from "./api";
import { UmbModalRouteRegistrationController } from "@umbraco-cms/backoffice/router";

const ITEMS_PER_PAGE = 10;
const TYPE_GROUP_LABELS: Record<string, string> = {
  document: "Document Types",
  element: "Element Types",
};

@customElement("element-finder-dashboard")
export default class ElementFinderDashboard extends UmbElementMixin(
  LitElement,
) {
  @state() private _nodes: Array<Details> = [];
  @state() private _loading = false;
  @state() private _error: string | null = null;
  @state() private _currentPage = 1;
  @state() private _selectedAlias = "";
  @state() private _docTypes: Array<Elements> = [];

  private _modalRegistration: UmbModalRouteRegistrationController;
  #getInfoContext?: GetInfoContext;

  constructor() {
    super();
    this.consumeContext(GET_INFO_CONTEXT_TOKEN, (instance) => {
      this.#getInfoContext = instance;
      this._loadDocTypes();
    });

    this._modalRegistration = new UmbModalRouteRegistrationController(
      this,
      UMB_WORKSPACE_MODAL,
    )
      .addAdditionalPath(UMB_DOCUMENT_ENTITY_TYPE)
      .onSetup(() => ({
        data: { entityType: UMB_DOCUMENT_ENTITY_TYPE },
        modal: { size: "large" },
      }));

  }

  private async _loadDocTypes() {
    if (this.#getInfoContext) {
      // Now returns Elements[] correctly
      this._docTypes = await this.#getInfoContext.getAllElementTypes();
    }
  }

  private async _handleSearch() {
    if (!this._selectedAlias || !this.#getInfoContext) return;

    this._loading = true;
    this._error = null;

    try {
      const usage: Usage | null = await this.#getInfoContext.getInfoFromAlias(
        this._selectedAlias,
      );
      this._nodes = usage?.usages ?? [];
      this._currentPage = 1;
    } catch (err) {
      this._error = "Error fetching usage";
      this._nodes = [];
    } finally {
      this._loading = false;
    }
  }

  private _onSelectChange(e: any) {
    this._selectedAlias = e.target.value;
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

  private _getGroupLabel(kind: string) {
    return TYPE_GROUP_LABELS[kind] ?? "Other Types";
  }

  render() {
    return html`
      <uui-box headline="Element Finder">
        <div class="search-container">
          <uui-select
            .options=${this._docTypes.map((dt) => ({
              name: dt.name,
              value: dt.alias,
              group: this._getGroupLabel(dt.kind),
              selected: this._selectedAlias === dt.alias,
            }))}
            @change=${this._onSelectChange}
            placeholder="Select a type"
          >
          </uui-select>
          <uui-button
            look="primary"
            label="Find Usage"
            .disabled=${!this._selectedAlias || this._loading}
            @click=${this._handleSearch}
          >
            Find Usage
          </uui-button>
        </div>

        ${this._loading
          ? html`<uui-loader></uui-loader>`
          : this._renderResults()}
      </uui-box>
    `;
  }

  private _instanceLabel(count: number) {
    return count === 1 ? "instance" : "instances";
  }

  private _renderResults() {
    if (this._error)
      return html`<uui-tag look="danger">${this._error}</uui-tag>`;
    if (this._nodes.length === 0)
      return html`<uui-state-message
        >Select a type and click search to see results.</uui-state-message
      >`;

    return html`
      <div class="results-header">
        Found ${this._nodes.length} ${this._instanceLabel(this._nodes.length)}.
      </div>
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
              : ""}
          `,
        )}
      </div>
      ${this._renderPagination()}
    `;
  }

  private _renderPagination() {
    if (this.totalPages() <= 1) return null;
    return html`
      <div class="pagination">
        <uui-button
          label="Previous"
          ?disabled=${this._currentPage === 1}
          @click=${this.prevPage}
          >Previous</uui-button
        >
        <span>Page ${this._currentPage} of ${this.totalPages()}</span>
        <uui-button
          label="Next"
          ?disabled=${this._currentPage === this.totalPages()}
          @click=${this.nextPage}
          >Next</uui-button
        >
      </div>
    `;
  }

  static styles = css`
    :host {
      display: block;
      padding: 24px;
    }
    uui-box {
      max-width: 800px;
      margin: 0 auto;
    }
    .search-container {
      display: flex;
      gap: 10px;
      margin-bottom: 24px;
    }
    uui-select {
      flex-grow: 1;
    }
    .usage-list {
      display: flex;
      flex-direction: column;
    }
    .usage-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px 0;
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
      margin-top: 20px;
    }
    .results-header {
      font-weight: bold;
      margin-bottom: 10px;
    }
  `;
}
