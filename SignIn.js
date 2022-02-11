/**
 * @author JY
 * @version 3.0
 * 更新通过账号密码直接获取密钥,免去通过抓包获取。
 * 本地，服务器，或者云函数等均可执行
 * 如需使用自行在信息填写区域补充信息方可正常使用
 */


const Env = require('./Env');
const $ = new Env('智障学工签到');
const notify = $.isNode() ? require('./sendNotify') : '';
const signApi = 'https://wisestu.neumooc.com/nuit/api/student/apply/apply.api';
const loginApi = 'https://wisestu.neumooc.com/nuit/api/user/loginout.api';
const serverApi = 'https://wisestu.neumooc.com/portal/api/server.api';
const title = '智障学工签到情况'
//信息提交返回
let content = ''
//超时时间(单位毫秒)
const timeout = 15000;
//batch_no的值
let batch_no
//申请id
let apply_id
//生成随机uuid
const uuid = randomString(16)
//token配置文件
const tokenFile = './token.json'
//token
let tokenList = []
//授权密钥(无须抓包获取)
let authorization = ''
//客户端版本
let clientVersion = '1.1.21'
/***************************************************************************信息填写区域***********************************************************************************/
//登录用户名
const login_name = '12345'
//登录密码
const password = '12345'
//经度
const lng = 120.42836539654026
//纬度
const lat = 23.59599606513675
//地址（去app手动提交一次看 “提交的定位信息” 这个地址是什么,下面的address就填什么）
const address = "xxxxxxxx";
//省
const province = "xx省";
//市
const city = "xx市";
//区
const district = "xx区";
//pushplus推送加token(可微信搜索：pushplus 推送加 ,关注公众号获取推送token)
const PUSH_PLUS_TOKEN = 'xxx';
//群组推送（可选，没有需求不用填，一般不填）
const PUSH_PLUS_USER = '';
/***************************************************************************信息填写区域***********************************************************************************/
!(async () => {
  await getLatestVersion()
  await getToken()
  await initValue()
  await Sign()

})()
  .catch((e) => {
    $.log('', `错误, 失败！ 原因: ${e}!`, ``)
  })
  .finally(() => {
    $.done();
  })

exports.handler = async function (event, context) {
  try {
    await getLatestVersion()
    await getToken()
    await initValue()
    const result = await Sign()
    return result
  } catch (e) {
    throw e
  }
}

function getToken() {
  return new Promise(async (resolve) => {
    const body = JSON.stringify({ "action": "loginStudent", "login_name": `${login_name}`, "password": `${password}`, "client_type": "App", "client_ver": `${clientVersion}`, "client_extra": `{\"available\":true,\"platform\":\"Android\",\"version\":\"11\",\"uuid\":\"${uuid}\",\"cordova\":\"8.1.0\",\"model\":\"M2011K2C\",\"manufacturer\":\"Xiaomi\",\"isVirtual\":false,\"serial\":\"unknown\"}` })
    const options = {
      method: 'POST',
      url: `${loginApi}`,
      headers: {
        "Host": "wisestu.neumooc.com",
        "Connection": "keep-alive",
        "Content-Length": "347",
        "Accept": "application/json, text/plain, */*",
        "forbid_notify": "",
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 11; M2011K2C Build/RKQ1.200928.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/96.0.4664.104 Mobile Safari/537.36",
        "App-Version": clientVersion,
        "X-Requested-With": "com.neuedu.wisestu",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      body: body,
    };
    //console.log(options)
    $.post(options, async (err, resp, data) => {
      try {
        let token = resp.headers.token

        if (token != undefined && token != null) {
          console.log("本次token: " + token)
          authorization = token;
        } else {
          await pushPlusNotify(title, "token获取失败")
        }
        data = JSON.parse(data);
        if (data) {
          if (data.code == 0) {
            console.log(`${data.message}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}


function Sign() {
  return new Promise(async (resolve) => {
    const body = JSON.stringify({ "action": "updateApplyDetail", "apply_id": `${apply_id}`, "batch_no": `${batch_no}`, "info_result": "[\"绿色\",\"正常（37.3℃以下）\",\"健康\",\"以上情况均不存在\",\"否\",\"否\",\"否\"]", "apply_location": `{\"point\":{\"lng\":${lng},\"lat\":${lat}},\"address\":\"${address}\",\"addressComponents\":{\"streetNumber\":\"\",\"street\":\"\",\"district\":\"${district}\",\"city\":\"${city}\",\"province\":\"${province}\"}}`, "updateBefor": 0 })
    const options = {
      method: 'POST',
      url: `${signApi}`,
      headers: {
        "Host": "wisestu.neumooc.com",
        "Connection": "keep-alive",
        "Content-Length": "465",
        "Accept": "application/json, text/plain, */*",
        "forbid_notify": "",
        "Authorization": `${authorization}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi K30 Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.101 Mobile Safari/537.36",
        "App-Version": clientVersion,
        "X-Requested-With": "com.neuedu.wisestu",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      body: body,
    };
    console.log(options)
    $.post(options, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        //console.log(data)
        if (data) {
          if (data.code == 0) {
            console.log(`签到，${data.message}`)
            await pushPlusNotify(title, "签到成功")
          } else if (data.code == 2002) {
            console.log(`您已经签到过啦~`)
            await pushPlusNotify(title, "您已经签到过啦~")
          } else {
            console.log(`未知异常响应如下：\n${data}`)
            await pushPlusNotify(title, `未知异常响应如下：\n${data}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function initValue() {
  return new Promise(async (resolve) => {
    console.log(`正在初始化变量`)
    const body = JSON.stringify({ "action": "getApplyList", "pageSize": 30, "pageNum": 1, "apply_type": "C" })
    const options = {
      method: 'POST',
      url: `${signApi}`,
      headers: {
        "Host": "wisestu.neumooc.com",
        "Connection": "keep-alive",
        "Content-Length": "465",
        "Accept": "application/json, text/plain, */*",
        "forbid_notify": "",
        "Authorization": `${authorization}`,
        "Content-Type": "application/json",
        "User-Agent": "Mozilla/5.0 (Linux; Android 10; Redmi K30 Build/QKQ1.190825.002; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.101 Mobile Safari/537.36",
        "App-Version": clientVersion,
        "X-Requested-With": "com.neuedu.wisestu",
        "Sec-Fetch-Site": "cross-site",
        "Sec-Fetch-Mode": "cors",
        "Sec-Fetch-Dest": "empty",
        "Accept-Encoding": "gzip, deflate",
        "Accept-Language": "zh-CN,zh;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      body: body,
    };
    $.post(options, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        if (data) {
          if (data.code == 0) {
            let result = data.result
            if (result.list.length != 0) {
              batch_no = result.list[0].batch_no
              apply_id = result.list[0].apply_id
              console.log(`本次 batch_no:${batch_no} apply_id:${apply_id} `)

            }
            if (batch_no == undefined || apply_id == undefined) {
              await pushPlusNotify(title, `batch_no或者apply_id的值不存在`)
            }
          } else {
            await pushPlusNotify(title, `未知异常响应如下：\n${data}`)
          }
        }
      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function getLatestVersion() {
  return new Promise(async (resolve) => {
    const body = JSON.stringify({ "action": "queryVersion", "platform": "", "version": `${clientVersion}` })
    const options = {
      method: 'POST',
      url: `${serverApi}`,
      headers: {
        "Host": "wisestu.neumooc.com",
        "Content-Length": "57",
        "Content-Type": "application/json",
      },
      body: body,
    };
    $.post(options, async (err, resp, data) => {
      try {
        data = JSON.parse(data);
        console.log(data)
        if (data.upgrading === true) {
          console.log(`当前版本: ${clientVersion}, 最新版本: ${data.ver}`)
          clientVersion = data.ver
        } else {
          console.log('客户端版本为最新版本！')
        }

      } catch (e) {
        $.logErr(e, resp);
      } finally {
        resolve();
      }
    });
  });
}

function pushPlusNotify(text, desp) {
  return new Promise(resolve => {
    if (PUSH_PLUS_TOKEN) {
      desp = desp.replace(/[\n\r]/g, '<br>'); // 默认为html, 不支持plaintext
      const body = {
        token: `${PUSH_PLUS_TOKEN}`,
        title: `${text}`,
        content: `${desp}`,
        topic: `${PUSH_PLUS_USER}`
      };
      const options = {
        url: `http://www.pushplus.plus/send`,
        body: JSON.stringify(body),
        headers: {
          'Content-Type': ' application/json'
        },
        timeout
      }
      $.post(options, (err, resp, data) => {
        try {
          if (err) {
            console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败！！\n`)
            console.log(err);
          } else {
            data = JSON.parse(data);
            if (data.code === 200) {
              console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息完成。\n`)
            } else {
              console.log(`push+发送${PUSH_PLUS_USER ? '一对多' : '一对一'}通知消息失败：${data.msg}\n`)
            }
          }
        } catch (e) {
          $.logErr(e, resp);
        } finally {
          resolve(data);
        }
      })
    } else {
      console.log('您未提供push+推送所需的PUSH_PLUS_TOKEN，取消push+推送消息通知🚫\n');
      resolve()
    }
  })
}

//获取16位随机字符串用于生成uuid
function randomString(e) {
  e = e || 32
  let t = '0123456789abcdef',
    a = t.length,
    n = ''
  for (let i = 0; i < e; i++) n += t.charAt(Math.floor(Math.random() * a))
  return n
}

// function rsyncToken() {
//   if (tokenList.length == 0) {
//     try {
//       let data = fs.readFileSync(tokenFile).toString()
//       let array = JSON.parse(data)
//       console.log('tokenList读取成功')
//       return array
//     } catch (error) {
//       return []
//     }

//   } else {
//     // 写入
//     fs.writeFileSync(tokenFile, JSON.stringify(tokenList))
//     console.log('tokenList写入成功')
//   }
// }
// function updatetokenList(pin, data, shareCodes) {
//   const index = shareCodes.findIndex((c) => c.pin == pin)
//   if (index != -1) {
//     for (const key in data) {
//       if (Object.hasOwnProperty.call(data, key)) {
//         shareCodes[index][key] = data[key]
//       }
//     }
//   } else {
//     shareCodes.push({ ...data, pin })
//   }
//   return shareCodes
// }
