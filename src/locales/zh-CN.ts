export default {
  'page.chat.title': '聊天',
  'page.setting.title': '设置',
  'page.live2d-model-setting.title': 'Live2D模型设置',

  /** 基础设置 */
  'setting.baseSetting': '基础设置',
  'setting.title': '设置',
  'setting.avatar': '头像',
  'setting.sendKey': '发送键',
  'setting.language': '语言',

  /** OpenAI */
  'setting.openAiSetting': 'OpenAI 设置',
  'setting.openAi.temperature': '随机性',
  'setting.openAi.temperature.description':
    '值越大，回复越随机，大于1可能会导致乱码',
  'setting.openAi.maxTokens': '单次回复限制',
  'setting.openAi.maxTokens.description': '单次交互所用的最大Token数',
  'setting.openAi.model': '模型',
  'setting.openAi.chatHistorySize': '附带历史消息数',
  'setting.openAi.chatHistorySize.description': '每次请求附带的历史消息数',
  'setting.openAi.presencePenalty': '话题新鲜度',
  'setting.openAi.basePath': '基础路径',
  'setting.openAi.basePath.description': 'OpenAI API接口地址的基础路径',
  'setting.openAi.presencePenalty.description': '值越大，越有可能拓展到新话题',

  /** Vits */
  'setting.vitsSetting': 'Vits 设置',
  'setting.vits.basePath': '基础路径',
  'setting.vits.basePath.description': 'Vits API接口地址的基础路径',

  'chat.form.newChat': '新建聊天',
  'chat.form.editChat': '修改',
  'chat.form.name': '名字',
  'chat.form.avatar': '头像',
  'chat.form.robotType': '类型',
  'chat.form.voice': '声音',
  'chat.form.vits.noise': '噪声',
  'chat.form.vits.noise.description': '一般来说，值越低越莫得感情',
  'chat.form.vits.length.description':
    '调节语音长度，相当于调节语速，该数值越大语速越慢',
  'chat.form.vits.length': '语速',
  'chat.form.reference': '参考',
  'chat.form.description': '人设',
  'chat.form.missingApiKey': '请先设置你的OpenAI API Key',
  'chat.form.inputAreaPlaceholder': '在这里输入...',
  'chat.form.gotoSetApiKey': '设置',
  'chat.form.claude.channelId': '频道ID',

  /** live2d */
  'setting.live2dSetting': 'Live2D 设置',

  /** claude */
  'setting.claudeSetting': 'Claude 设置',
  'setting.claude.server': '服务地址',
  'setting.claude.server.description': 'Claude本地代理服务地址',
  'setting.claude.token': 'Token',
  'setting.claude.token.description': 'Claude的User Token',
  'setting.claude.appId': 'App ID',
  'setting.claude.appId.description': 'Claude的成员ID',
  'setting.claude.channelId': 'Channel ID',
  'setting.claude.channelId.description':
    'Claude的频道,如果没有会自动创建，有则加入',
  'setting.about': '关于',

  /** file */
  'setting.fileManage': '文件管理',
};
