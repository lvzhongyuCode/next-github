import { resolve } from 'any-promise';
import { object } from 'prop-types';

const api = require('./api')
// 获取所有html的list
export function getHtmlUrl(repos) {
  const htmlUrlArr = []
  repos.forEach(element => {
    if (element.html_url) {
      htmlUrlArr.push(element.html_url)
    }
  });
  return htmlUrlArr
}

// 获取到用户的信息
export function getUserInfo(repos) {
  const repoUsers = []
  if (repos.length) {
    repos.forEach(element => {
      if (element.owner) {
        const userStr = element.owner.login
        userStr && repoUsers.push(element.owner.login)
      }
    })
  }
  const userArr = Array.from(new Set(repoUsers))
  return userArr
}
// promise写法
// export async function getStarredByUser(userName, ctx) {
//   return new Promise(async (resolve, reject) => {
//     try {
//       const currentUserStarred = await api.request({
//         url: `/users/${userName}/starred`,
//       }, ctx.req, ctx.res)
//       console.log(`用户${userName}查询成功`)
//       resolve(currentUserStarred.data || [])
//     } catch (e) {
//       console.log(`用户${userName}查询失败`)
//       reject([])
//     }
//   })
// }
// 根据用户名寻找其星标项目
export async function getStarredByUser(userName, ctx) {
  try {
    const currentUserStarred = await api.request({
      url: `/users/${userName}/starred`,
      data: {
        per_page: 100,
        page: 1
      }
    }, ctx.req, ctx.res)
    console.log(`用户${userName}查询成功`)
    return {
      status: 1,
      data: currentUserStarred.data,
      userName
    } || {}
  } catch (e) {
    console.log(`用户${userName}查询失败`)
    return {
      status: 0,
      data: [],
      userName
    }
  }
}

export async function getReposByUsers(userArr, ctx) {
  //输出格式Array[{user:string ,data:[]}]
  const totalRepos = []
  const promiseArr = []
  userArr.forEach(ele => {
    promiseArr.push(getStarredByUser(ele, ctx))
  })
  return Promise.all(promiseArr).then((values) => {
    // values是代表每个用户的关注的列表
    values.forEach(item => {
      if (item.status && item.data.length) {
        const data = item.data
        const ret = data.length ? data.map(i => {
          return i.html_url
        }) : []
        totalRepos.push({ user: item.userName, data: ret })
      }
    })
    return Array.from(new Set(totalRepos))
  }).catch(e => {
    return []
  })
}

// export async function getReposByUsers(userArr, ctx) {
//   const totalRepos = []
//   // const promiseArr = []
//   // userArr.forEach(ele => {
//   //   promiseArr.push(getStarredByUser(ele, ctx))
//   // })
//   // Promise.all(promiseArr).then(values => {
//   //   console.log(values)
//   //   values.forEach(item => {
//   //     totalRepos.push(item.html_url)
//   //   })
//   // })
//   for (let i = 0; i < userArr.length; i++) {
//     const currentRet = await getStarredByUser(userArr[i], ctx)
//     console.log({ ...currentRet, data: currentRet.data.length })
//     if (currentRet.status && currentRet.data.length) {
//       try {
//         const htmlUrls = []
//         currentRet.data.forEach(item => {
//           htmlUrls.push(item.html_url)
//         })
//         totalRepos.push({ user: currentRet.userName, data: htmlUrls })
//       } catch (e) {

//       }
//     }
//   }
//   return Array.from(new Set(totalRepos))
// }

export function allStarredRepos(totalStaredRepos) {
  const totalProject = [] // 所有项目集合
  if (totalStaredRepos && totalStaredRepos.length) {
    totalStaredRepos.forEach((ele) => {
      totalProject.push(...ele.data)
    })
  }
  return Array.from(new Set(totalProject))
}

export function makeMap(totalStaredRepos) {
  const allRepos = allStarredRepos(totalStaredRepos) // 所有星标库

  const relationMap = {} // 关系对象模型
  if (totalStaredRepos && totalStaredRepos.length) {
    totalStaredRepos.forEach(item => {
      const currentRelationNum = []
      allRepos.forEach(ele => {
        currentRelationNum.push(item.data.indexOf(ele) === -1 ? 0 : 1)
      })
      relationMap[item.user] = currentRelationNum
    })
  }
  return relationMap
}

function getCosValue(me, other) {
  let meAvg = eval(me.join("+")) / me.length
  let otherAvg = eval(other.join('+')) / other.length
  let top = 0
  let left = 0
  let right = 0
  for (let i = 0; i < me.length; i++) {
    top += (me[i] - meAvg) * (other[i] - otherAvg)
    left += (me[i] - meAvg) * (me[i] - meAvg)
    right += (other[i] - otherAvg) * (other[i] - otherAvg)
  }
  return (top / Math.sqrt(left * right))

}

export function computeSimilar(totalStaredRepos, userName, userStaredRepos) {// 计算相似程度
  const relationMap = makeMap(totalStaredRepos)
  const users = Object.keys(relationMap)
  let max = 0
  let maxUser = users[0]
  const similarArr = {}
  users.forEach(item => {
    const val = getCosValue(relationMap[userName], relationMap[item])
    if (val > max && item !== userName) {
      max = val
      maxUser = item
    }
    similarArr[item] = val
  })
  console.log(similarArr)
  return maxUser
}