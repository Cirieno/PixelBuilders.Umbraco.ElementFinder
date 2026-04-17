import { UmbControllerBase } from "@umbraco-cms/backoffice/class-api";
import { type UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import {
  GetInfoDataSource,
  type IGetInfoDataSource,
} from "../datasources/get-info.datasource";
import { UmbContextToken } from "@umbraco-cms/backoffice/context-api";
import type { Usage, Elements } from "../api";


export class GetInfoContext extends UmbControllerBase {
  #dataSource: IGetInfoDataSource;

  constructor(host: UmbControllerHost) {
    super(host);

    this.#dataSource = new GetInfoDataSource();
    this.provideContext(GET_INFO_CONTEXT_TOKEN, this);
  }

  async getInfoFromAlias(alias: string): Promise<Usage | null> {
    return this.#dataSource.getElementInfo(alias);
  }

  async getAllElementTypes(): Promise<Elements[]> {
    return this.#dataSource.getAllDocumentTypes();
  }
}

export default GetInfoContext;

export const GET_INFO_CONTEXT_TOKEN = new UmbContextToken<GetInfoContext>("GetInfoContext");
