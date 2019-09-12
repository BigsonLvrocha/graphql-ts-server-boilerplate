import * as rp from "request-promise";
import { CookieJar } from "request";

export class TestClient {
  options: {
    jar: CookieJar;
    withCredentials: boolean;
    json: boolean;
  };

  constructor(public url: string) {
    this.options = {
      withCredentials: true,
      jar: rp.jar(),
      json: true
    };
  }

  async login(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          login(email: "${email}", password: "${password}") {
            path
            message
          }
        }`
      }
    });
  }

  async me() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        query {
          me {
            id
            email
          }
        }`
      }
    });
  }

  async logout() {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          logout
        }`
      }
    });
  }

  async register(email: string, password: string) {
    return rp.post(this.url, {
      ...this.options,
      body: {
        query: `
        mutation {
          register(email: "${email}", password: "${password}") {
            path
            message
          }
        }`
      }
    });
  }
}
