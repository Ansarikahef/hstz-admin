const Helper ={
    isUserAuthenticated() {
        try {
          const authStatus = localStorage.getItem('hstz_admin_auth_status') ?? 0;
          const userInfo = localStorage.getItem('hstz_admin_info') ?? null;
          const token = localStorage.getItem('hstzAuthToken');
      
          // No token
          if (!token) return false;
      
          // Decode JWT
          const payload = JSON.parse(atob(token.split('.')[1]));
      
          // Token expired
          if (payload.exp * 1000 < Date.now()) {
            localStorage.removeItem('hstzAuthToken');
            return false;
          }
      
          // All checks passed
          return Boolean(authStatus && userInfo && token);
      
        } catch (error) {
          console.error('Auth check error:', error);
          return false;
        }
      },
      encodeBase64: (str) => {
        return btoa(encodeURIComponent(str))
      },
      decodeBase64: (encodedStr) => {
        return decodeURIComponent(atob(encodedStr))
      },
      saveLoginDetails(data = {}) {
        try {
          const encryptedData = this.encodeBase64(JSON.stringify(data))
          localStorage.setItem('hstz_admin_auth_status', true)
          localStorage.setItem('hstz_admin_info', encryptedData)
        } catch (error) {
          console.error('Error While Save Login Details in Local Storage:', error)
        }
      },
      getLoginUserDetails() {
        try {
          const user = localStorage.getItem('hstz_admin_info') ?? null
          if (!user) return null;      
          const parsed = JSON.parse(Helper.decodeBase64(user));      
          const obj = Array.isArray(parsed) ? parsed[0] : parsed;
          return obj || null;      
        } catch (error) {
          console.error('Error fetching user data:', error);
          return null;
        }
      },
      encodeBase64: (str) => {
        return btoa(encodeURIComponent(str))
      },
      decodeBase64: (encodedStr) => {
        return decodeURIComponent(atob(encodedStr))
      },
      storeToSession(key, value) {
        try {
          const encodedValue = this.encodeBase64(JSON.stringify(value))
          sessionStorage.setItem(key, encodedValue)
        } catch (error) {
          console.error('Error While Save Data in Session Storage:', error)
        }
      },
      retrieveFromSession(key) {
        try {
          const value = sessionStorage.getItem(key)
          return value ? JSON.parse(this.decodeBase64(value)) : null
        } catch (error) {
          console.error('Error While fetching Data from Session Storage:', error)
          return null
        }
      },
}

export default Helper