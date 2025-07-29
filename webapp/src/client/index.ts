import {
  ListUpstreamRegistriesResponse,
  PostUpstreamRequestBody,
  PostUpstreamResponseBody,
} from "../types/request_response";

export default class HttpClient {
  private static instance: HttpClient;
  private baseUrl: string;

  private constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  public static getInstance(baseUrl: string): HttpClient {
    if (!HttpClient.instance) {
      HttpClient.instance = new HttpClient(baseUrl);
    }
    return HttpClient.instance;
  }

  public async createUpstream(
    request: PostUpstreamRequestBody
  ): Promise<PostUpstreamResponseBody> {
    try {
      const response = await fetch(`${this.baseUrl}/upstreams`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      const body = await response.json();

      if (response.status == 201) {
        return {
          ...(body as { reg_id: string; reg_name: string }),
        };
      }
      if (response.status == 409) {
        return {
          error: "Port or name may conflict with existing registry.",
        };
      }
      return {
        error: "Error occured when creating Upstream OCI Registry",
      };
    } catch (err) {
      console.log(err);
      return {
        error: "Error occured when creating Upstream OCI Registry",
      };
    }
  }

  public async getUpstreamRegisteries(): Promise<
    ListUpstreamRegistriesResponse | { error: string }
  > {
    try {
      const response = await fetch(`${this.baseUrl}/upstreams`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      });

      const resBody = await response.json();

      if (response.ok) {
        return resBody as ListUpstreamRegistriesResponse;
      }
      return {
        error: "Error occured when retriving upstream registeries",
      };
    } catch (error) {
      console.log(error);
      return {
        error: "Error occured when retriving upstream registeries",
      };
    }
  }
}