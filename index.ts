import {IApiConfigProps, IApiConfigReturn, IApiProps, IFetchPayload, TData, TQuery} from "api.interfaces";

export class ApiConfig<ExtraParams = Record<string, string>, ExtraHeader = Record<string, string>> implements IApiConfigReturn<ExtraParams, ExtraHeader> {
  baseUrl;
  config: IApiConfigProps<ExtraHeader>;
  handlers;
  extraConfig;

  constructor ({
    baseUrl,
    config,
    handlers,
    extraConfig
  }: IApiProps<ExtraParams, ExtraHeader>) {

    this.baseUrl = baseUrl;
    this.config = {
      ...this.config,
      ...config || {headers: {}}
    };
    this.handlers = handlers;
    this.extraConfig = extraConfig || {mode: "cors"};
  }

  get = <Response, Query extends TQuery = {}> (
    url: string,
    payload?: IFetchPayload<void, Query, ExtraParams, ExtraHeader>
  ): Promise<Response> => {
    return this._fetch(url, {
      method: "GET",
      ...payload
    });
  };

  post = <Response, Body, Query extends TQuery = {}> (
    url: string,
    payload?: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response> => {
    return this._fetch(url, {
      method: "POST",
      ...payload
    });
  };

  put = <Response, Body, Query extends TQuery = {}> (
    url: string,
    payload?: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response> => {
    return this._fetch(url, {
      method: "PUT",
      ...payload
    });
  };

  patch = <Response, Body, Query extends TQuery = {}> (
    url: string,
    payload?: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response> => {
    return this._fetch(url, {
      method: "PATCH",
      ...payload
    });
  };

  delete = <Response, Query extends TQuery = {}> (
    url: string,
    payload?: IFetchPayload<void, Query, ExtraParams, ExtraHeader>
  ): Promise<Response> => {
    return this._fetch(url, {
      method: "DELETE",
      ...payload
    });
  };

  private _fetch = async (url: string, data: TData): Promise<any> => {
    try {
      if (this.handlers?.beforeRequestHandle) {
        await this.handlers?.beforeRequestHandle(this.config, url, data);
      }

      let headers = this.config.headers;
      let body;

      if (data.body instanceof FormData) {
        body = data.body;
        delete headers?.["Content-Type"];
      } else {
        body = JSON.stringify(data.body);
      }

      return fetch(this.baseUrl + url + this.createQueryParams(data.params), {
        mode: (this.extraConfig.mode || "cors") as RequestMode,
        cache: "default",
        method: data.method,
        body,
        headers
      }).then(this.handleBody)
        .then((json: any) => json)
        .catch((err: any) => {
          if ("json" in err) {
            return err.json.then((errorJson: { message: any, type: string }): {
              message: any,
              type: string,
              status: number
            } | undefined => {
              throw {...errorJson, status: err.status};
            }).catch((e: any) => {
              throw {...e, status: err.status};
            });
          } else {
            throw new Error("Server error");
          }
        });
    } catch (err) {
      throw err;
    }
  };

  private handleBody = (body: Response) => {
    let contentType = body.headers.get("content-type");

    if (!body.ok) {
      throw {json: body.json(), status: body.status};
    }

    if (contentType && contentType.indexOf("application/json") !== -1) {
      return body.json();
    } else {
      return body.text();
    }
  };


  /**
   * @param query
   * @in {foo: "bar", hello: "world"}
   * @out ?foo=bar&hello=world
   */
  private createQueryParams = (query?: TQuery): string => {
    if (query) {
      let result = "?";
      Object.keys(query).forEach((key: string) => {
        if (query[key]) {
          result += `${key}=${query[key]}&`;
        }
      });
      return result.slice(0, -1);
    }

    return "";
  };
}
