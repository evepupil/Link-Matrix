功能模块需求

2.1 主页

功能描述： 提供工具核心功能入口和当前系统状态概览。

核心功能：

显示待处理任务概览（如待发布视频数、待翻译任务数）。

快速导航到常用功能模块（如一键发布、任务管理）。

展示系统健康状态（如浏览器实例运行情况、代理IP可用性）。

2.2 账户管理

功能描述： 集中管理用户在不同自媒体平台的登录账户信息。

核心功能：

多平台支持： 支持添加包括但不限于抖音、快手、B站、YouTube、TikTok 等主流自媒体平台账户。

一个平台多账户： 允许用户在同一个自媒体平台下添加并管理多个账户。

添加账号流程：

用户选择目标自媒体平台。

选择浏览器配置： 用户需指定一个已创建的**浏览器配置（Browser Profile）**用于此账户的登录和后续操作。

系统拉起有头浏览器：后端通过选定的浏览器配置（可能已关联代理IP）启动一个可见的浏览器窗口。

用户手动登录： 用户在此有头浏览器中完成目标平台的登录操作（输入用户名密码、处理验证码、二次验证等）。

登录状态保存： 登录成功后，系统**自动保存该浏览器配置的登录状态（storage_state，含 Cookies/LocalStorage）**到本地文件，并关联到该平台账户。

新建用户成功： 只有当登录状态成功保存并验证有效后，该平台账户才会被视为添加成功并显示在列表中。

账户列表： 显示所有已添加的平台账户，包括平台类型、账户名称、最近登录状态等。

编辑/删除账户： 允许用户修改账户名称、重新绑定浏览器配置，或删除账户（删除账户时，对应的浏览器状态文件也应被清除）。

登录状态刷新： 提供手动刷新账户登录状态的功能，以便在状态过期时重新拉起有头浏览器登录。

2.3 资源管理

功能描述： 管理工具运行所需的底层资源，确保自动化任务的顺利执行。

核心功能：

浏览器管理：

创建多个浏览器配置： 允许用户创建任意数量的独立浏览器配置（每个配置在底层对应一个独立的 Playwright storage_state 路径，用于存储独立的 Cookies、LocalStorage、缓存等）。

独立配置： 每个浏览器配置可独立设置 User-Agent、屏幕分辨率等参数。

分配与关联： 浏览器配置可被分配给一个或多个平台账户使用（尽管建议每个账户拥有专属配置以保证隔离性）。

列表与管理： 显示所有已创建的浏览器配置列表，支持编辑和删除。

代理 IP 管理：

添加/编辑/删除代理 IP： 允许用户添加 HTTP/HTTPS/SOCKS5 代理 IP 地址、端口，以及可选的用户名和密码。

代理池： 维护一个可用的代理 IP 列表。

分配功能： * 代理 IP 可分配给浏览器配置： 用户可以将一个代理 IP 绑定到一个或多个浏览器配置上。

动态选择： 在执行自动化任务时，系统可根据策略（如随机、轮询）从关联的代理池中为浏览器配置动态选择一个代理 IP 使用。

可用性检测： 提供代理 IP 的连通性测试功能，显示代理的可用状态。

资源池概览： 整合展示所有浏览器配置和代理 IP 的使用情况和可用性状态。

2.4 自媒体工具

功能描述： 提供辅助内容创作和本地化处理的工具。

核心功能：

视频翻译：

上传视频： 支持用户上传本地视频文件。

语音识别： 对视频中的语音进行自动识别，生成原始文本。

机器翻译： 将识别出的文本翻译成目标语言（支持多语种选择）。

译文编辑： 提供界面供用户校对和修改翻译结果。

加字幕：

字幕生成： 根据翻译后的文本自动生成 SRT/ASS 格式的字幕文件，并与视频时间轴同步。

字幕样式定制： 允许用户调整字幕的字体、颜色、大小、位置、背景等。

字幕嵌入： 将生成的字幕（可选择软字幕或硬字幕）嵌入到视频中，生成新的视频文件。

视频转文档：

视频上传： 支持用户上传本地视频文件。

语音转文本： 将视频中的语音内容转换为可编辑的文本文档（可用于生成文章草稿、访谈记录等）。

文档导出： 支持将文本导出为 TXT、DOCX 等格式。

AI 文章标题生成：

输入内容： 用户可输入视频内容概述、关键词、目标主题等。

AI 生成： 利用集成的大语言模型生成多个富有创意和吸引力的标题建议。

标题选择与优化： 用户可选择、修改或要求重新生成标题。

2.5 一键发布

功能描述： 实现内容（视频/文章）到多平台的自动化发布。

核心功能：

选择内容类型： 支持选择“发布视频”或“发布文章”。

内容上传/选择：

视频发布： 上传处理好的视频文件（已包含翻译和字幕的）。

文章发布： 粘贴或上传文章内容。

发布账户选择： 允许用户从已管理的平台账户列表中，选择一个或多个账户进行发布。

发布信息填写： 统一填写视频标题、描述、标签、封面等信息（可根据不同平台的需求进行适配，提供模板功能）。

任务提交： 提交发布任务到任务队列。

2.6 任务管理

功能描述： 实时跟踪和管理所有自动化任务的执行状态。

核心功能：

任务列表： 显示所有发布任务和翻译任务的列表。

任务状态： 显示任务当前状态（如排队中、进行中、成功、失败、暂停）。

进度显示： 提供可视化进度条或百分比，展示任务完成情况。

操作日志： 详细记录每个任务的执行日志，包括时间戳、操作步骤、成功/失败信息、错误详情等，方便用户排查问题。

任务操作： 支持暂停、恢复、取消或重试失败的任务。


2.7 系统设置

功能描述： 配置工具的全局参数和行为。

核心功能：

FFmpeg 路径配置： 允许用户配置本地 FFmpeg 的可执行文件路径（如果不是内置）。

AI API Key 配置： 配置用于视频翻译、AI标题生成等功能的第三方 AI 服务的 API Key。

日志级别设置： 配置系统日志的详细程度。

存储路径设置： 配置浏览器状态文件、视频资源、日志等本地存储路径。

代理 IP 轮询策略： 设置代理 IP 的选择策略（如随机、顺序）。

软件更新： 提供本地部署软件的更新检查和下载功能。

2.8 使用文档

功能描述： 提供详细的用户指南和常见问题解答。

核心功能：

安装教程： 详细的本地环境搭建和软件安装步骤。

功能指引： 各模块的详细使用说明。

常见问题 (FAQ)： 收集并解答用户在使用过程中可能遇到的问题。

故障排除： 提供常见的错误代码及解决方案。

3. 技术架构与选型 (供内部参考)

前端： Web 技术栈（例如 React + ant design），通过 API 与后端交互。

后端： Python 语言，使用Fastapi  Web 框架。

自动化： Playwright (用于无头浏览器自动化)。
数据库：sqlite

4. 架构设计

web端-表示层：用户直接交互的地方
后端-路由层：与前端进行api交互
后端-业务层：实现路由层中的业务
后端-浏览器自动化层：通用可扩展的模块，一个base类，可以自定义扩展实现对页面的操作，使得支持更多平台
后端-持久层：sqlite提供持久化支持

