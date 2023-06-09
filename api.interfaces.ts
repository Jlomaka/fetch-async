export type TQuery = Record<string, string | string [] | number | number[]>;

export type TData = Partial<IFetchData<any, any, any, any>>;

export interface IFetchPayload<Body, Query, ExtraParams, ExtraHeader> {
  body?: Body;
  params?: Query;
  extraParams?: Partial<ExtraParams>;
  config?: IApiConfigProps<ExtraHeader>;
}

interface IFetchData<Body, Query, ExtraParams, ExtraHeader> extends IFetchPayload<Body, Query, ExtraParams, ExtraHeader> {
  method?: string;
}

export type TApiConfigHeadersProps<ExtraHeader = Record<string, string>> = ExtraHeader & {
  "Authorization"?: string;
  "Content-Type"?: string;
  "X-Content-Type-Options"?: string;
  "Content-Security-Policy"?: string;
  "Strict-Transport-Security"?: string;
  "X-Frame-Options"?: string;
};

export interface IApiConfigProps<ExtraHeader> {
  headers?: TApiConfigHeadersProps<ExtraHeader>;
}

interface IApiHandleProps<ExtraHeader> {
  beforeRequestHandle?: (updateHeader: IApiConfigProps<ExtraHeader>, url: string, data: TData) => void;
  handleErrors?: (error: any) => void;
}

interface IApiExtraConfig {
  mode?: RequestMode;
}

export interface IApiProps<ExtraParams, ExtraHeader> {
  baseUrl: string;
  config: IApiConfigProps<ExtraHeader>;
  handlers?: IApiHandleProps<ExtraHeader>;
  extraConfig?: IApiExtraConfig;
}

export interface IApiConfigReturn<ExtraParams, ExtraHeader> extends IApiProps<ExtraParams, ExtraHeader> {
  get<Response, Query extends TQuery> (
    url: string,
    payload: IFetchPayload<void, Query, ExtraParams, ExtraHeader>
  ): Promise<Response>;

  post<Response, Body, Query extends TQuery> (
    url: string,
    payload: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response>;

  put<Response, Body, Query extends TQuery> (
    url: string,
    payload: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response>;

  patch<Response, Body, Query extends TQuery> (
    url: string,
    payload: IFetchPayload<Body, Query, ExtraParams, ExtraHeader>
  ): Promise<Response>;

  delete<Response, Query extends TQuery> (
    url: string,
    payload: IFetchPayload<void, Query, ExtraParams, ExtraHeader>
  ): Promise<Response>;
}
