const { WS_URL } = process.env

console.debug(process.env)

export default class ConfigUtils {
  static get WS_URL() {
    return WS_URL
  }
}
