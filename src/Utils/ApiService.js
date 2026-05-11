import config  from './envConfig'
import Helper from './Helper'

const apiService = {
  baseUrl: config.API_BASE_URL || '',

  handleResponse: async function (response) {
    try {
      const data = await response.json().catch(() => ({}));
      return {
        status: response.ok ? 1 : 0,
        statusCode: response.status,
        message:
          data.message ||
          (response.ok ? "Success" : `Error ${response.status}`),
  
        responseValue: data.responseValue ?? [],  
        token: data.token ?? null
      };
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: "Something went wrong while parsing response",
        responseValue: null,
      };
    }
  },

  get: async function (endpoint, options = {}) {
    try {
      const token = localStorage.getItem("hstzAuthToken") ?? null;
      const finalEndpoint = this.buildEndpoint(endpoint, options)

      const response = await fetch(`${this.baseUrl}${finalEndpoint}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
      })

      return await this.handleResponse(response)
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: error.message || 'GET request failed',
        responseValue: null,
      }
    }
  },

  post: async function (endpoint, data = {}, options = {}) {
    try {
      const token = localStorage.getItem("hstzAuthToken") ?? null;
      const { auth = false } = options
      const payload = this.buildPayload(data, { auth })

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: JSON.stringify(payload),
      })
      return await this.handleResponse(response)
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: error.message || 'POST request failed',
        responseValue: null,
      }
    }
  },

  postMedia: async function (endpoint, data) {
    try {
      const token = localStorage.getItem("hstzAuthToken")  ?? null;
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'POST',
        headers: {
          accept: '*/*',
          ...(token && { Authorization: `Bearer ${token}` })
        },
        body: data,
      })

      return await this.handleResponse(response)
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: error.message || 'POST media failed',
        responseValue: null,
      }
    }
  },

  put: async function (endpoint, data) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return await this.handleResponse(response)
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: error.message || 'PUT request failed',
        responseValue: null,
      }
    }
  },

  delete: async function (endpoint) {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      return await this.handleResponse(response)
    } catch (error) {
      return {
        status: 0,
        statusCode: 500,
        message: error.message || 'DELETE request failed',
        responseValue: null,
      }
    }
  },

  buildEndpoint: function (endpoint, options = {}) {
    const { auth = false } = options
    if (!auth) return endpoint

    const user = Helper.getLoginUserDetails() || {}
    const separator = endpoint.includes('?') ? '&' : '?'

    return `${endpoint}${separator}userId=${encodeURIComponent(
      user.id ?? 0
    )}&sessionToken=${encodeURIComponent(
      user.sessionToken ?? 'cps_auth_token'
    )}`
  },

  buildPayload: function (payload = {}, options = {}) {
    const { auth = false } = options
    if (!auth) return payload

    const user = Helper.getLoginUserDetails() || {}

    return {
      ...payload,
      userId: user.id ?? 0,
      sessionToken: user.sessionToken ?? 'cps_auth_token',
    }
  },
}

export default apiService