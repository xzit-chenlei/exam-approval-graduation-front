module.exports = {
  /**
   * 侧边栏主题 深色主题theme-dark，浅色主题theme-light
   */
  sideTheme: 'theme-dark',

  /**
   * 是否系统布局配置
   */
  showSettings: false,

  /**
   * 是否显示顶部导航
   */
  topNav: false,

  /**
   * 是否显示 tagsView
   */
  tagsView: true,

  /**
   * 是否固定头部
   */
  fixedHeader: false,

  /**
   * 是否显示logo
   */
  sidebarLogo: true,

  /**
   * 是否显示动态标题
   */
  dynamicTitle: false,

  /**
   * @type {string | array} 'production' | ['production', 'development']
   * @description Need show err logs component.
   * The default is only used in the production env
   * If you want to also use it in dev, you can pass ['production', 'development']
   */
  errorLog: 'production',

  /**
   * 顶部导航「源码」外链（来自环境变量 VUE_APP_PROJECT_REPO），留空则不显示图标
   */
  projectRepoUrl: process.env.VUE_APP_PROJECT_REPO || '',

  /**
   * 顶部导航「文档」外链（来自环境变量 VUE_APP_PROJECT_DOC），留空则不显示图标
   */
  projectDocUrl: process.env.VUE_APP_PROJECT_DOC || ''
}
