import type { CancelablePromise } from "./core/CancelablePromise";
import { OpenAPI } from "./core/OpenAPI";
import { request as __request } from "./core/request";

import type {
  Body_login_login_access_token,
  Message,
  NewPassword,
  Token,
  UserPublic,
  UpdatePassword,
  UserCreate,
  UserRegister,
  UsersPublic,
  UserUpdate,
  UserUpdateMe,
  ItemCreate,
  ItemPublic,
  ItemsPublic,
  ItemUpdate,
  FaqsPublic,
  SitesPublic,
  SiteCreate,
  SiteUpdate,
  SitePublic,
  Simulations,
  SoilsPublic,
  SoilPublic,
  SoilCreate,
  SoilUpdate,
  SoilWithLatLon,
  WeatherMetasPublic,
  WeatherMetaCreate,
  WeatherMetaPublic,
  WeatherMetaUpdate,
  // WeatherDatasPublic,
  CultivarsPublic,
  WeatherDataCreate,
  SoilsPublicTable,
  SoilCreateTable,
  SoilUpdateTable,
  WeatherAggrigateData,
  GridRatioList,
  GridRatiosList,
  CropsMetasPublic,
  CultivarCropsPublic,
  ExperimentDataCreate,
  ExperimentsPublic,
  TreatmentsPublic,
  TreatmentDataCreate,
  OperationsPublic,
  OperationRequest,
  OperationDateResponse,
  OperationDataCreate,
  InitCondOp,
  InitCondOpDataUpdate,//this is used to update (creation will heppen when treatment is created) the simulation start operation
  TillageTypes,
  DownloadMessage,
  TillageOpResponse,
  TreatmentDataCopy,
  ExpOtData,
  OperationDataUpdate,
  OperationData,
  SimulationApiResponse,
} from "./models";

export type TDataLoginAccessToken = {
  formData: Body_login_login_access_token;
};
export type TDataRecoverPassword = {
  email: string;
};
export type TDataResetPassword = {
  requestBody: NewPassword;
};
export type TDataRecoverPasswordHtmlContent = {
  email: string;
};
export type TDataTabNameHtmlContent = {
  tabname: string;
};
export type TDataSiteNameHtmlContent = {
  siteid: number;
};

export type InitCondOpDataUpdateBody = Omit<InitCondOpDataUpdate, 'treatmentid'>;

export type TDataInitCondOpDataUpdate = {
  treatmentid: number;
  requestBody: Omit<InitCondOpDataUpdate, 'treatmentid'>;
};
export class LoginService {
  /**
   * Login Access Token
   * OAuth2 compatible token login, get an access token for future requests
   * @returns Token Successful Response
   * @throws ApiError
   */
  public static loginAccessToken(
    data: TDataLoginAccessToken
  ): CancelablePromise<Token> {
    const { formData } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/access-token",
      formData: formData,
      mediaType: "application/x-www-form-urlencoded",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Test Token
   * Test access token
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static testToken(): CancelablePromise<UserPublic> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/login/test-token",
    });
  }

  /**
   * Recover Password
   * Password Recovery
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static recoverPassword(
    data: TDataRecoverPassword
  ): CancelablePromise<Message> {
    const { email } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Reset Password
   * Reset password
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static resetPassword(
    data: TDataResetPassword
  ): CancelablePromise<Message> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/reset-password/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Recover Password Html Content
   * HTML Content for Password Recovery
   * @returns string Successful Response
   * @throws ApiError
   */
  public static recoverPasswordHtmlContent(
    data: TDataRecoverPasswordHtmlContent
  ): CancelablePromise<string> {
    const { email } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/password-recovery-html-content/{email}",
      path: {
        email,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TdatafetchSoil = {
  siteId: number;
};
export type TdatafetchStation = {
  site: string;
};
export type TDataReadUsers = {
  limit?: number;
  skip?: number;
};
export type TDataCreateUser = {
  requestBody: UserCreate;
};
export type TDataUpdateUserMe = {
  requestBody: UserUpdateMe;
};
export type TDataUpdatePasswordMe = {
  requestBody: UpdatePassword;
};
export type TDataRegisterUser = {
  requestBody: UserRegister;
};
export type TDataReadUserById = {
  userId: number;
};
export type TDataUpdateUser = {
  requestBody: UserUpdate;
  userId: number;
};
export type TDataDeleteUser = {
  userId: number;
};

export class UsersService {
  /**
   * Read Users
   * Retrieve users.
   * @returns UsersPublic Successful Response
   * @throws ApiError
   */
  public static readUsers(
    data: TDataReadUsers = {}
  ): CancelablePromise<UsersPublic> {
    const { limit = 100, skip = 0 } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create User
   * Create new user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static createUser(
    data: TDataCreateUser
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read User Me
   * Get current user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserMe(): CancelablePromise<UserPublic> {
      return __request(OpenAPI, {
          method: "GET",
          url: "/api/v1/users/me",
      }).catch((error:any) => {
          if (error.status === 403 || error.status === 401) {
              localStorage.removeItem("access_token");
              window.location.href = "/login"; // Redirect to the login page
          }
          throw error; // Re-throw the error for further handling if needed
      }) as  CancelablePromise<UserPublic>;
  }

  /**
   * Update User Me
   * Update own user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUserMe(
    data: TDataUpdateUserMe
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Password Me
   * Update own password.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static updatePasswordMe(
    data: TDataUpdatePasswordMe
  ): CancelablePromise<Message> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/me/password",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Register User
   * Create new user without the need to be logged in.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static registerUser(
    data: TDataRegisterUser
  ): CancelablePromise<UserPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/users/signup",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read User By Id
   * Get a specific user by id.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static readUserById(
    data: TDataReadUserById
  ): CancelablePromise<UserPublic> {
    const { userId } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update User
   * Update a user.
   * @returns UserPublic Successful Response
   * @throws ApiError
   */
  public static updateUser(
    data: TDataUpdateUser
  ): CancelablePromise<UserPublic> {
    const { requestBody, userId } = data;
    return __request(OpenAPI, {
      method: "PATCH",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteUser(data: TDataDeleteUser): CancelablePromise<Message> {
    const { userId } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/users/{user_id}",
      path: {
        user_id: userId,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataTestEmail = {
  emailTo: string;
};

export class UtilsService {
  /**
   * Test Email
   * Test emails.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static testEmail(data: TDataTestEmail): CancelablePromise<Message> {
    const { emailTo } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/utils/test-email/",
      query: {
        email_to: emailTo,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataReadItems = {
  limit?: number;
  skip?: number;
};

// export type TDataReadFaqs = {
//                 limit?: number
// skip?: number

//             }
export type TDataCreateItem = {
  requestBody: ItemCreate;
};
export type TDataReadItem = {
  id: number;
};
export type TDataUpdateItem = {
  id: number;
  requestBody: ItemUpdate;
};
export type TDataDeleteItem = {
  id: number;
};

export class ItemsService {
  /**
   * Read Items
   * Retrieve items.
   * @returns ItemsPublic Successful Response
   * @throws ApiError
   */
  public static readItems(
    data: TDataReadItems = {}
  ): CancelablePromise<ItemsPublic> {
    const { limit = 100, skip = 0 } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/",
      query: {
        skip,
        limit,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Item
   * Create new item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static createItem(
    data: TDataCreateItem
  ): CancelablePromise<ItemPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/items/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Item
   * Get item by ID.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static readItem(data: TDataReadItem): CancelablePromise<ItemPublic> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Item
   * Update an item.
   * @returns ItemPublic Successful Response
   * @throws ApiError
   */
  public static updateItem(
    data: TDataUpdateItem
  ): CancelablePromise<ItemPublic> {
    const { id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Item
   * Delete an item.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteItem(data: TDataDeleteItem): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/items/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export class FaqService {
  /**
   * Read Faqs
   * Retrieve Faqs.
   * @returns FaqaPublic Successful Response
   * @throws ApiErrorTDataTabNameHtmlContent
   */
  public static readFaqs(
    data: TDataTabNameHtmlContent
  ): CancelablePromise<FaqsPublic> {
    const { tabname = "welcome" } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/faq/{tabname}",
      path: {
        tabname,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataCreateSite = {
  requestBody: SiteCreate;
};
export type TDataReadSite = {
  id: number;
};
export type TDataUpdateSite = {
  id: number;
  requestBody: SiteUpdate;
};
export type TDataDeleteSite = {
  id: number;
};
export class SiteService {
  /**
   * Read Site
   * Retrieve Site by id.
   * @returns SitePublic Successful Response
   * @throws TDataSiteNameHtmlContent
   */
  public static readSite(
    data: TDataSiteNameHtmlContent
  ): CancelablePromise<SitesPublic> {
    const { siteid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/site/{siteid}",
      path: {
        siteid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Sites
   * Retrieve Sites.
   * @returns SitesPublic Successful Response
   */
  public static readSites(): CancelablePromise<SitesPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/site/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Site
   * Create new Site.
   * @returns SitePublic Successful Response
   * @throws ApiError
   */
  public static createSite(
    data: TDataCreateSite
  ): CancelablePromise<SitePublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/site/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }



  
  /**
   * Update Site
   * Update an Site.
   * @returns SitePublic Successful Response
   * @throws ApiError
   */
  public static updateSite(
    data: TDataUpdateSite
  ): CancelablePromise<SitePublic> {
    const { id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/site/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Site
   * Delete an Site.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSite(data: TDataDeleteSite): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/site/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}
  /**
 * Fetches simulation for output
 */
export class SimulationService {
  public static readSimulations(): CancelablePromise<SimulationApiResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/seasonaloutput/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

public static deleteSimulation(
    data: { id: number }
  ): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/seasonaloutput/delete/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static readOutputdata(
    data: TdataFetchSimOutput
  ): CancelablePromise<OperationDateResponse> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/seasonaloutput/geteachexpdata/{id}",
      path: {id},
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataCreateSoil = {
  requestBody: SoilCreate;
};

export type TDataReadSoil = {
  id: number;
};

export type TDataUpdateSoil = {
  id: number;
  requestBody: SoilUpdate;
};
export type TDataDeleteSoil = {
  id: number;
};

export type TDataDeleteSoilTable = {
  o_sid: number;
};

export type TDataCreateSoilTable = {
  requestBody: SoilCreateTable;
};

export type TDataUpdateSoilTable = {
  o_sid: number;
  requestBody: SoilUpdateTable;
};

export type TDataSoilNameHtmlContent = {
  soilid: number;
};

export type TDataSoilTableHtmlContent = {
  o_sid: number;
};

export class SoilService {
  /**
   * Read Soil
   * Retrieve Soil by id.
   * @returns SoilPublic Successful Response
   * @throws TDataSoilNameHtmlContent
   */
  public static readSoil(
    data: TDataSoilNameHtmlContent
  ): CancelablePromise<SoilsPublic> {
    const { soilid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/soil/{soilid}",
      path: {
        soilid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Soils
   * Retrieve Soils.
   * @returns SoilsPublic Successful Response
   */
  public static readSoils(): CancelablePromise<SoilsPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/soil/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Soil
   * Create new Soil.
   * @returns SoilPublic Successful Response
   * @throws ApiError
   */
  public static createSoil(
    data: TDataCreateSoil
  ): CancelablePromise<SoilPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/soil/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Soil
   * Update an Soil.
   * @returns SoilPublic Successful Response
   * @throws ApiError
   */
  public static updateSoil(
    data: TDataUpdateSoil
  ): CancelablePromise<SoilPublic> {
    const { id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/soil/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Soil
   * Delete an Soil.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteSoil(data: TDataDeleteSoil): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/soil/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Get Soil profile from NRCS
   * Retrieve Soil.
   * @returns SoilWithLatLon Successful Response
   */
  public static fetchSoildata(
    data: TdatafetchSoil
  ): CancelablePromise<SoilWithLatLon> {
    const { siteId } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/soil/NRCS/{siteId}",
      path: {
        siteId: siteId,
      },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static fetchSoilTableBySid(
    data: TDataSoilTableHtmlContent
  ): CancelablePromise<SoilsPublicTable> {
    const { o_sid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/soil/data/{o_sid}",
      path: {
        o_sid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static createSoilTable(
    data: TDataCreateSoilTable
  ): CancelablePromise<SoilsPublicTable> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/soil/data",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static updateSoilTable(
    data: TDataUpdateSoilTable
  ): CancelablePromise<SoilsPublicTable> {
    const { o_sid, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/soil/data/{o_sid}",
      path: {
        o_sid,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static deleteSoilTable(
    data: TDataDeleteSoilTable
  ): CancelablePromise<Message> {
    const { o_sid } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/soil/data/{o_sid}",
      path: {
        o_sid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}


export type TDataCreateGridRatio = {
  requestBody: GridRatioList;
};

export type TDataUpdateGridRatio = {
  gridratio_id: number;
  requestBody: GridRatioList;
};

export type TDataReadGridRatio = {
  gridratio_id: number;
};

export type TDataDeleteGridRatio = {
  gridratio_id: number;
};
export class GridRatioService {
  public static createGridRatio(
    data: TDataCreateGridRatio
  ): CancelablePromise<GridRatioList> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/gridratio/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static updateGridRatio(
    data: TDataUpdateGridRatio
  ): CancelablePromise<GridRatioList> {
    const { gridratio_id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/gridratio/{gridratio_id}",
      path: {
        gridratio_id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static readGridRatio(
    data: TDataReadGridRatio
  ): CancelablePromise<GridRatioList> {
    const { gridratio_id } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/gridratio/{gridratio_id}",
      path: {
        gridratio_id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static readGridRatioList(): CancelablePromise<GridRatiosList> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/gridratio/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static deleteGridRatio(
    data: TDataDeleteGridRatio
  ): CancelablePromise<Message> {
    const { gridratio_id } = data;

    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/gridratio/{gridratio_id}",
      path: {
        gridratio_id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataReadStations = {
  limit?: number;
  skip?: number;
};

export type TDataCreateStation = {
  requestBody: WeatherMetaCreate;
};

export type TDataReadStation = {
  id: number;
  con?: boolean;
};
export type TdataCultivarselected= {
  id:number;
  cropType: string;
}
export type TDataUpdateStation = {
  id: number;
  requestBody: WeatherMetaUpdate;
};
export type TDataDeleteStation = {
  id: number;
};

export type TDataWeatherStationTypeHtmlContent = {
  stationType: string | null;
};

export type TDataCreateWeatherTable = {
  requestBody: WeatherDataCreate[];
};

export type TDataCrop = {
  crop : string;
}

export type TDataExpTreatment = {
  expTreatment : string;
}




export class SeasonalRun{
  /**
   * To Run the sesonal Run
   */
  public static async RunSeasonalSim(
    data: TDataReadStation
  ): Promise<Simulations> {
    console.log(data)
    let payload: any; // Replace `any` with the actual type if known
    const simulationInput = localStorage.getItem('SimulationInput');
    if (simulationInput) {
      try {
        payload = JSON.parse(simulationInput);
      } catch (error) {
        console.error('Error parsing SimulationInput from localStorage:', error);
        payload = null; // Or handle the error appropriately
      }
    } else {
      payload = null; // Handle the case where 'SimulationInput' does not exist
    }
  
    try {
      const response: { data?: any[] } = await __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/seasonalsim/seasonRun",
        body: payload,
        errors: {
          422: `Validation Error`,
        },
      });
  
      // Check if the response is successful and contains the required data
      if (Array.isArray(response?.data) && response.data.length > 0) {
        const id = response.data[0]; // Extract the `11` value
  
        // Call the next API using the extracted `id`
        const nextApiResponse = await __request(OpenAPI, {
          method: "GET",
          url: `/api/v1/seasonalsim/seasonRun/${id}`, 
          errors: {
            422: `Validation Error`,
          },
        });
        return nextApiResponse as Simulations; // Ensure the correct type is returned
      } else {
        console.error('Unexpected response format:', response);
        throw new Error('Unexpected response format');
      }
    } catch (error) {
      console.error('Error during API call:', error);
      throw error; // Re-throw the error for further handling if needed
    }
  }
  //   /**
  //  * Fetch chart data with streaming
  //  */
  //   public static async fetchChartData(
  //     id: any,
  //     onData: (chunk: any) => void,
  //     onError: (error: any) => void
  //   ): Promise<void> {
  //     try {
  //       const response = await __request(OpenAPI, {
  //         method: "GET",
  //         url: `/api/v1/seasonalsim/simulationResp/{id}`,
  //         path: {
  //           id: id,
  //         },
  //         errors: {
  //           401: `Unauthorized`,
  //           422: `Validation Error`,
  //         },
  //       });
    
  
  //       if (!(response as Response).body) {
  //         throw new Error("No response body");
  //       }
  
  //       const reader = (response as Response).body?.getReader();
  //       if (!reader) {
  //         throw new Error("Reader is undefined");
  //       }
  //       const decoder = new TextDecoder("utf-8");
  //       let done = false;

  //       while (!done) {
  //         const { value, done: readerDone } = await reader.read();
  //         done = readerDone;
  
  //         if (value) {
  //           const chunk = decoder.decode(value, { stream: true });
  //           try {
  //             const parsedChunk = JSON.parse(chunk);
  //             onData(parsedChunk); // Pass the parsed chunk to the callback
  //           } catch (parseError) {
  //             console.error("Failed to parse chunk:", parseError);
  //           }
  //         }
  //       }
  //     } catch (error) {
  //       console.error("Failed to fetch chart data:", error);
  //       onError(error); // Pass the error to the callback
  //     }
  //   }
}


// export const fetchChartData = async (id: any, onData: (chunk: any) => void, onError: (error: any) => void) => {
//   try {
//     const response = await fetch(`/api/v1/seasonalsim/simulationResp/${id}`); // Replace with your actual API endpoint

//     if (!response.body) {
//       throw new Error("No response body");
//     }

//     const reader = response.body.getReader();
//     const decoder = new TextDecoder("utf-8");
//     let done = false;

//     while (!done) {
//       const { value, done: readerDone } = await reader.read();
//       done = readerDone;

//       if (value) {
//         const chunk = decoder.decode(value, { stream: true });
//         try {
//           const parsedChunk = JSON.parse(chunk);
//           onData(parsedChunk); // Pass the parsed chunk to the callback
//         } catch (parseError) {
//           console.error("Failed to parse chunk:", parseError);
//         }
//       }
//     }
//   } catch (error) {
//     console.error("Failed to fetch chart data:", error);
//     onError(error); // Pass the error to the callback
//   }
// };
export class WeatherService {
  /**
   * Read Stations
   * Retrieve Stations.
   * @returns WeatherMetasPublic Successful Response
   */
  public static readStations(): CancelablePromise<WeatherMetasPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Weather
   * Create new Weather.
   * @returns WeatherPublic Successful Response
   * @throws ApiError
   */
  public static submitWeatherData(
    data: TDataCreateStation
  ): CancelablePromise<WeatherMetaPublic> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/weather/",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Delete Weather
   * Delete an Weather.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteStation(
    data: TDataDeleteStation
  ): CancelablePromise<Message> {
    const { id } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/weather/{id}",
      path: {
        id,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Update Weather
   * Update an Weather.
   * @returns WeatherPublic Successful Response
   * @throws ApiError
   */
  public static updateWeather(
    data: TDataUpdateStation
  ): CancelablePromise<WeatherMetaPublic> {
    const { id, requestBody } = data;
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/weather/{id}",
      path: {
        id,
      },
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Read Stations table
   * Retrieve Stations table.
   * @returns WeatherMetasPublic Successful Response
   */
  public static readStationTable(
    data: TDataWeatherStationTypeHtmlContent
  ): CancelablePromise<WeatherAggrigateData> {
    const { stationType } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/data/{stationType}",
      path: {
        stationType,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Create Weather table
   * Create new Weather table.
   * @returns WeatherDataPublic Successful Response
   * @throws ApiError
   */
  public static downloadWeatherTable(
    data: TDataReadStation
  ): CancelablePromise<DownloadMessage> {
    const { id, con } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/download/{id}/{con}",
      path: {
        id,
        con,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  

  public static submitWeatherTable(
    data: TDataCreateWeatherTable
  ): CancelablePromise<WeatherDataCreate> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/weather/data",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static fetchWeatherdata(
    data: TdatafetchStation
  ): CancelablePromise<WeatherMetasPublic> {
    const { site } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/getStationsBySite/{site}",
      path: {
        site: site,
      },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static getTreatmentsByCrop(
    data: TDataCrop
  ): CancelablePromise<[]> {
    const { crop } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/getTreatmentsByCrop/{crop}",
      path: {
        crop: crop,
      },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static getDatesByExpTreatment(
    data: TDataExpTreatment
  ): CancelablePromise<ExpOtData> {
    const { expTreatment } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/weather/getDatesByExpTreatment/{expTreatment}",
      path: {
        expTreatment: expTreatment,
      },
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export type TDataCreateExperiment = {
  requestBody: ExperimentDataCreate;
};

export type TDataCreateOperation = {
  requestBody: OperationDataCreate;
};

export type TDataExperimentByCropName = {
  cropName: string | null;
};

export type TDataDeleteExperiment = {
  exid: number;
};

export type TDataDeleteTreatment = {
  tid: number;
};

export type TDataExperimentByName = {
  cropName: string | null;
  experimentName: string | null;
}

// Treatment

export type TDataTreatment = {
  exid: number;
};

export type TDataOperation = {
  o_t_exid: number;
};

export type TDataOperationFirstDate = {
  requestBody: OperationRequest;
};

export type TdataFetchSimOutput= {
  id: number
}

export type TdataCultivarCrop={
  cropType: string
}
export type TDataCreateTreatment = {
  requestBody: TreatmentDataCreate;
};
export type TDataCopy = {
  requestBody: TreatmentDataCopy;
};

export type TDataOperationForms = {
  opid: number;
}

export type TDataDeleteOperation = {
  opID: number;
};

export type TDataCropName = {
  cropName: string;
}
export class ManagementService 
{
  /**
   * Read Crops
   * Retrieve Crops.
   * @returns CropsMetasPublic Successful Response
   */
  public static readCrop(): CancelablePromise<CropsMetasPublic> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  /**
   * Get Operation Types To Add
   * Calls /farm-setup-options endpoint
   * @returns object Successful Response
   * @throws ApiError
   */
  public static getOperationTypesToAdd(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/farm-setup-options",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static getExperimentByCropName(
    data: TDataExperimentByCropName
  ): CancelablePromise<ExperimentsPublic> {
    const { cropName } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/experiment/{cropName}",
      path: {
        cropName,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static submitExperiment(
    data: TDataCreateExperiment
  ): CancelablePromise<ExperimentDataCreate> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/management/experiment",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static deleteExperiment(
    data: TDataDeleteExperiment
  ): CancelablePromise<Message> {
    const { exid } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/management/experiment/{exid}",
      path: {
        exid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  public static getFullOperationById(opid: number): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/operation/full/{opid}",
      path: {
        opid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  
  public static deleteTreatment(
    data: TDataDeleteTreatment
  ): CancelablePromise<Message> {
    const { tid } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/management/treatment/{tid}",
      path: {
        tid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }


  public static getTreatmentById(
    data: {tid :number}
  ):CancelablePromise<TreatmentsPublic> {
  const { tid } = data;
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/management/treatmentbyid/{tid}",
    path: {
      tid,
    },
    errors: {
      422: `Validation Error`,
    },
  });
  }

  public static getExperimentById(
    data: {exid :number}
  ):CancelablePromise<ExperimentsPublic> {
  const { exid } = data;
  return __request(OpenAPI, {
    method: "GET",
    url: "/api/v1/management/experiment/experiment/id/{exid}",
    path: {
      exid,
    },
    errors: {
      422: `Validation Error`,
    },
  });
  }

  public static getTreatmentByExperimentId(
    data: TDataTreatment
  ): CancelablePromise<TreatmentsPublic> {
    const { exid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/treatment/{exid}",
      path: {
        exid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static getOperationsByTreatment(
    data: TDataOperation
  ): CancelablePromise<OperationsPublic> {
    const { o_t_exid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/operation/{o_t_exid}",
      path: {
        o_t_exid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static checkUpdateTreatment(
    data: TDataCreateTreatment
  ): CancelablePromise<TreatmentDataCreate> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/management/treatment",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }


  public static readTillageTypeDB(): CancelablePromise<TillageTypes> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/tillageType",
      errors: {
        422: `Validation Error`,
      },
    });
  }


//   public static submitOperation(
//     data: TDataCreateOperation
//   ): CancelablePromise<OperationDataCreate> {
//     const { requestBody } = data;
//     alert(requestBody.operation_record)
    
//     return __request(OpenAPI, {
//       method: "POST",
//       url: "/api/v1/management/operation",
//       body: requestBody,
//       mediaType: "application/json",
//       errors: {
//         422: `Validation Error`,
//       },
//     });
//   }


  public static getSimulationStart(
    data: TDataOperationForms
  ): CancelablePromise<InitCondOp> {
    const { opid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/operation/InitCondOp/{opid}",
      path: {
        opid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static getTillage(
    data: TDataOperationForms
  ): CancelablePromise<TillageOpResponse> {
    const { opid } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/management/operation/tillage/{opid}",
      path: {
        opid,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }



  public static deleteOperation(
    data: TDataDeleteOperation
  ): CancelablePromise<Message> {
    const { opID } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/management/operation/{opID}",
      path: {
        opID,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }


    public static updateInitCondOpData(
      data: TDataInitCondOpDataUpdate
    ): CancelablePromise<Message> {
      const { treatmentid, requestBody } = data;
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/management/initCondOp/update/{treatmentid}",
        path: {
          treatmentid,
        },
        body: requestBody,
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      });
    }

    public static updateOperationsDate(
      data: OperationDataUpdate
    ): CancelablePromise<OperationData> {
      
      const {  requestBody } = data;
      return __request(OpenAPI, {
        method: "POST",
        url: "/api/v1/management/operations/update_date",
        body: requestBody,
        mediaType: "application/json",
        errors: {
          422: `Validation Error`,
        },
      });
    }
  

  /**
   * Create or update Operation (calls /operation)
   */
  public static createOrUpdateOperation(
    data: { requestBody: { data: any } }
  ): CancelablePromise<any> {
    const { requestBody } = data;
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/management/operation/createorupdate",
      body: requestBody,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }


}

export class CultivarTabApis {
    /**
   * Read Crops
   * Retrieve Crops.
   * @returns CultivarCropsPublic Successful Response
   */
  public static readCultivars(
    data: TdataCultivarCrop
  ): CancelablePromise<CultivarCropsPublic> {
    const { cropType } = data;
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/cultivars/{cropType}",
      path :{
        cropType,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  public static createCultivars(
    data: any, cropOption:string
  ): CancelablePromise<Token> {
    const endPoint= 'save'+cropOption+'cultivar'
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/v1/cultivars/{endPoint}",
      path:{
        endPoint
      },
      formData: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }

  public static updateCultivars(
    data: {}, cropOption: string
  ): CancelablePromise<Token> {
    const endPoint= 'update'+cropOption+'cultivar'
    
    return __request(OpenAPI, {
      method: "PUT",
      url: "/api/v1/cultivars/{endPoint}",
      path:{
        endPoint
      },
      formData: data,
      mediaType: "application/json",
      errors: {
        422: `Validation Error`,
      },
    });
  }
  //TdataCultivarselected
  public static getEachCultivarData(
    data: TdataCultivarselected
  ): CancelablePromise<CultivarsPublic> {
    const { id, cropType } = data;
    
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/cultivars/geteach/{cropType}/{id}",
      path: {
        id,
        cropType,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
  /**
   * Delete User
   * Delete a user.
   * @returns Message Successful Response
   * @throws ApiError
   */
  public static deleteCultivar(data: TdataCultivarselected): CancelablePromise<Message> {
    const { id, cropType } = data;
    return __request(OpenAPI, {
      method: "DELETE",
      url: "/api/v1/cultivars/delete/{cropType}/{id}",
      path: {
        id,
        cropType,
      },
      errors: {
        422: `Validation Error`,
      },
    });
  }
}

export interface FAQCreate {
  tabname: string;
  question?: string | null;
  answer?: string | null;
}

export interface FAQUpdate {
  tabname?: string;
  question?: string | null;
  answer?: string | null;
}

export interface FAQOut {
  id: number;
  tabname: string;
  question?: string | null;
  answer?: string | null;
  owner_id?: number | null;
}

export class FAQService {
  public static createFAQ(requestBody: FAQCreate): CancelablePromise<FAQOut> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/faqs/",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static updateFAQ(faqId: number, requestBody: FAQUpdate): CancelablePromise<FAQOut> {
    return __request(OpenAPI, {
      method: "PUT",
      url: `/api/v1/faq/${faqId}`,
      body: requestBody,
      mediaType: "application/json",
    });
  }

  public static deleteFAQ(faqId: number): CancelablePromise<void> {
    return __request(OpenAPI, {
      method: "DELETE",
      url: `/api/v1/faq/${faqId}`,
    });
  }

  public static getAllFAQs(): CancelablePromise<FAQOut[]> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/v1/faq/",
    });
  }
}




