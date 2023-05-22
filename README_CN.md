## 使用方式

## 文字转语音

下载 https://github.com/Artrajz/vits-simple-api/releases/tag/v0.1 ，解压后双击 start.bat 启动文字转语音服务

注：里面不包含语音模型，需要自己下载

有内置规则 () 括号内的内容不会被读出来

## live2d

在聊天窗口中，点击上方的心形图标，会弹出 live2d 框，把下载的 live2d 文件夹整个拖进去即可如果需要让 live2d 模型总是展示在最前，请右键点击 window 窗口右下角猫猫图标选 Keep model always on top

有内置规则，当遇到回复的文本包含 {mood} 这种格式的时候，会触发 live2d 模型的 expression （一般就是一些动作），可以通过设定引导的形式让皮套根据文字做出预置好的动作等

## chatGpt

需要在基础设置里填 apiKey，如果有反向代理的地址，可以填在 basePath 里

## claude

1. 双击运行 claudeService.exe
2. 这个是免费版的 claude 接口，需要你帐号的一些 token 等信息，在 claude 设置里填进去，创建聊天的时候类型选 claude；

## 百度翻译

主要场景为希望 vits 读的时候为另一种语言，比如 claude 回复的是中文，但是你想让他用日语读出来
