# wechat-template-mass

微信模版消息群发功能模块。

### Usage

```bash
npm install @neuroo_fe/wechat-template-mass -S
```

```javascript
const MassFactory = require('wechat-template-mass')
const massFactory = new MassFactory(appId, appSecret [,getTokenFunction])

const openIds = [ 'oDetxwdKb1uyCTogQzFvYymlrcLc' ]
const concurrent = 10
const templateId = 'D_vgWaYRVADAtXKYPxWPlsRQ5tBY3R70Hig4W_LhsX8'
const url = 'https://google.com/'
const data = {
  first: {
    value: '测试内容',
    color: '#000000'
  },
  remark: {
    value: '测试内容',
    color: '#000000'
  }
}

const mass = massFactory.createMass(openIds, concurrent, templateId, url, data)

mass.on('finish', console.log)

mass.start()

/*
{ ok: 0,
  fail: 1,
  complete: 1,
  total: 1,
  startTime: '2017-8-18 14:53:41',
  endTime: '2017-8-18 14:53:45',
  duration: 23 }
*/
```

### MassFactory 构造函数

#### new MassFactory([appId, appSecret, getTokenFunction])

生成一个`MassFactory`实例对象

#### 参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| appId | String | 否 | 微信公众号appId |
| appSecret | String | 否 | 微信公众号appSecret |
| getTokenFunction | String | 否 | 获取公众号接口access_token方法 |

> 注意：需要传入 `appId` 或 `getTokenFunction` 其中一个。

#### 返回值

`MassFactory`实例对象。

### MassFactory 实例方法

- [createMass(openIds, concurrent, templateId, url, data)](#createmass)

#### createMass

生成 `Mass` 实例

#### 参数

| 名称 | 类型 | 必填 | 描述 |
| --- | --- | --- | --- |
| openIds | Array | 是 | 群发目标的openId数组 |
| concurrent | Number | 是 | 并发数 |
| templateId | String | 是 | 模板Id |
| url | String | 是 | 模板点击后跳转的URL |
| data | Object | 是 | 模板插值的填充数据 |

#### 返回值

`Mass` 实例对象。

### Mass 实例方法

- [start() 开始群发任务](#start)
- [stop() 停止群发任务](#stop)
- [resume() 恢复群发任务](#resume)

#### start

开始群发任务。重复调用无效。

#### stop

停止群发任务。重复调用无效，先恢复后才能再次暂停。

#### resume

恢复群发任务。重复调用无效，先暂停后才能再次恢复。

### Mass 实例事件

- [ok 发送成功。范围**单条**](#ok)
- [fail 发送失败。范围**单条**](#fail)
- [progress 进度事件。](#progress)
- [finish 发送完成。范围**全部**](#finish)

#### ok

当群发的消息中有一条成功时触发。参数为`result`对象。

#### result 对象属性

| 名称 | 类型 |  描述 |
| --- | --- | --- |
| openId | String | 用户openId |
| status | String | 发送状态 |

#### fail

当群发的消息中有一条失败时触发。参数为`result`对象。

#### result 对象属性

| 名称 | 类型 |  描述 |
| --- | --- | --- |
| openId | String | 用户openId |
| status | String | 发送状态 |
| response | Object | 错误对象 |

#### finish

当全部群发完成时触发。参数为`result`对象。

#### result 对象属性

| 名称 | 类型 |  描述 |
| --- | --- | --- |
| ok | Number | 成功数量 |
| fail | Number | 失败数量 |
| complete | Number | 完成的数量 |
| total | Number | 总数量。一般应该等于`complete`。 |
| startTime | String | 开始发送的时间。 |
| endTime | String | 完成时的时间。 |
| duration | Number | 发送的持续时间。单位：ms。当调用[`stop()`](#stop)方法暂停发送时,只在重新调用[`resume()`](#resume)方法恢复发送时才会重新计算`duration`,因此中间的等待时间不计入此属性。 |

#### progress

进度事件。参数为`result`对象。

#### result 对象属性

| 名称 | 类型 |  描述 |
| --- | --- | --- |
| ok | Number | 成功数量 |
| fail | Number | 失败数量 |
| complete | Number | 完成的数量 |
| total | Number | 总数量。一般应该等于`complete`。 |
| percent | String | 进度百分比。 |
