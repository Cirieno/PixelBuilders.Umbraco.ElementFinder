import {
  getUmbracoElementFinderApiV1UsageByAlias,
  getUmbracoElementFinderApiV1AllTypes,
} from "../api/index.js";
import type { Usage, Elements } from "../api/types.gen.js";

export interface IGetInfoDataSource {
  getElementInfo(alias: string): Promise<Usage | null>;
  getAllDocumentTypes(): Promise<Elements[]>;
}

export class GetInfoDataSource implements IGetInfoDataSource {
  async getElementInfo(alias: string): Promise<Usage | null> {
    const response = await getUmbracoElementFinderApiV1UsageByAlias({
      path: {
        alias: alias,
      },
      throwOnError: true,
    });

    return response.data;
  }

  async getAllDocumentTypes(): Promise<Elements[]> {
    const response = await getUmbracoElementFinderApiV1AllTypes({
      throwOnError: true,
    });

    return response.data;
  }
}
