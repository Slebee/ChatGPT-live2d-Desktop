## 使用方式

## 文字转语音

下载 https://github.com/Artrajz/vits-simple-api/releases/tag/v0.1 ，解压后双击start.bat启动文字转语音服务

注：里面不包含语音模型，需要自己下载

有内置规则 () 括号内的内容不会被读出来

## live2d
在聊天窗口中，点击上方的心形图标，会弹出live2d框，把下载的live2d文件夹整个拖进去即可
如果需要让live2d模型总是展示在最前，请右键点击window窗口右下角猫猫图标选 Keep model always on top

有内置规则，当遇到回复的文本包含 {mood} 这种格式的时候，会触发live2d模型的 expression （一般就是一些动作），可以通过设定引导的形式让模型做出预置好的动作等


## chatGpt
需要在基础设置里填 apiKey，如果有反向代理的地址，可以填在basePath里

## claude

1. 双击运行 claudeService.exe
2. 这个是免费版的claude接口，需要你帐号的一些token等信息，在 claude 设置里填进去，创建聊天的时候类型选 claude；
