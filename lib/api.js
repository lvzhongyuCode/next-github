const axios = require('axios')

const github_base_url = 'https://api.github.com'
const github_person_token = 'c105712333fa8d01bfdeba5044ddc14610bd62c6'
async function requestGithub(method, url, data, headers) {
  return await axios({
    method,
    url: `${github_base_url}${url}`,
    data,
    headers
  })
}

const isServer = typeof window === 'undefined'

async function request({ method = 'GET', url, data = {} }, req, res) {
  if (!url) {
    throw Error('url must provide')
  }
  if (isServer) {
    const session = req.session
    const githubAuth = session.githubAuth || {}
    const headers = {}
    if (githubAuth.access_token) {
      headers['Authorization'] = `${githubAuth.token_type} ${githubAuth.access_token}`
    }
    return await requestGithub(method, url, data, headers)
  } else {
    return await axios({
      method,
      url: `/github${url}`,
      data
    })
  }
}
module.exports = {
  request,
  requestGithub
}