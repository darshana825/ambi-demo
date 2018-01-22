class AjaxProvider {
  constructor() {
    this.authToken = null
    this.get = this.get.bind(this)
    this.post = this.post.bind(this)
  }

  get(url, requireAuth, additionalOptions) {
    let _this = this

    let ajaxOptions = {
      url: url,
      method: "GET",
      headers: {}
    }

    if (requireAuth) {
      ajaxOptions.headers['prg-auth-header'] = _this.authToken
    }

    if (additionalOptions) {
      Object.assign(ajaxOptions, additionalOptions);
    }

    return $.ajax(ajaxOptions)
  }

  post(url, requireAuth, data, additionalOptions) {
    let _this = this


    let ajaxOptions = {
      url: url,
      method: "POST",
      data: data,
      headers: {}
    }

    if (requireAuth) {
      ajaxOptions.headers['prg-auth-header'] = _this.authToken
    }

    if (additionalOptions) {
      Object.assign(ajaxOptions, additionalOptions);
    }

    return $.ajax(ajaxOptions)
  }
}

export default AjaxProvider
