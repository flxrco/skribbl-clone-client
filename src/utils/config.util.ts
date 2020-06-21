console.debug(process.env)

export default class ConfigUtils {
  static get WS_URL() {
    return process.env.WS_URL
  }
}
