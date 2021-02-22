import { useEffect } from 'react'
import { Button, Icon, Tabs } from 'antd'
import getConfig from 'next/config'
import { connect } from 'react-redux'
import Router, { withRouter } from 'next/router'
import Repo from '../components/Repo'
import LRU from 'lru-cache'
import { cacheArray } from '../lib/repo-basic-cache'
import { getHtmlUrl, getUserInfo, getStarredByUser, getReposByUsers, computeSimilar } from '../lib/tools'

const cache = new LRU({
  maxAge: 1000 * 60 * 10
})
const api = require('../lib/api')
const { publicRuntimeConfig } = getConfig()
let cachedUserRepos, cachedUserStaredRepos

const isServer = typeof window === 'undefined'
function Index({ userRepos, userStaredRepos, userRecommendRepos, user, router }) {

  const tabKey = router.query.key || '1'
  const handleTabChange = (activeKey) => {
    Router.push(`/?key=${activeKey}`)
  }
  useEffect(() => {
    if (!isServer) {
      // cachedUserRepos = userRepos
      // cachedUserStaredRepos = userStaredRepos
      if (userRepos) {
        cache.set('userRepos', userRepos)
      }
      if (userStaredRepos) {
        cache.set('userStaredRepos', userStaredRepos)
      }
      if (userRecommendRepos) {
        cache.set('userRecommendRepos', userRecommendRepos)
      }
    }
  }, [userRepos, userStaredRepos])

  useEffect(() => {
    if (!isServer) {
      cacheArray(userRepos)
      cacheArray(userStaredRepos)
      // console.log((userStaredRepos))
      // console.log(getUserInfo(userStaredRepos))
      // console.log(alo7)
    }
  })
  if (!user || !user.id) {
    return <div className="root">
      <p>
        亲，您还没有登录哦~
      </p>
      <Button type="primary" href={publicRuntimeConfig.OAUTH_URL}>
        点击登录
      </Button>
      <style jsx>{`
        .root {
          height: 400px;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
        }
      `}</style>
    </div>
  }
  return (
    <div className={'root'}>
      <div className={'user-info'}>
        <img src={user.avatar_url} alt={'user avatar'} className={'avatar'} />
        <span className={'login'}>{user.login}</span>
        <span className={'name'}>{user.name}</span>
        <span className={'bio'}>{user.bio || 'do better!'}</span>
        <p className={'email'}>
          <Icon type={'mail'} style={{ marginRight: 10 }} />
          <a href={`mailto:${user.email}`}>{user.email || 'm139494110607@163.com'}</a>
        </p>
      </div>
      <div className={'user-repos'}>

        <Tabs activeKey={tabKey} onChange={handleTabChange} animated={false}>
          <Tabs.TabPane tab="你的仓库" key={'1'}>
            {
              userRepos.map(repo => {
                return <Repo repo={repo} key={repo.id} />
              })
            }
          </Tabs.TabPane>
          <Tabs.TabPane tab="你关注的仓库" key={'2'}>
            {
              userStaredRepos.map(repo => {
                return <Repo repo={repo} key={repo.id} />
              })
            }
          </Tabs.TabPane>
          <Tabs.TabPane tab="推荐" key={'3'}>
            {
              userRecommendRepos.map(repo => {
                return <Repo repo={repo} key={repo.id} />
              })
            }
          </Tabs.TabPane>
        </Tabs>
      </div>
      <style jsx>{`
          .root {
            display: flex;
            align-items: flex-start;
            padding: 20px 0
          }
          .user-info {
            width: 200px;
            margin-right: 40px;
            flex-shrink: 0;
            display: flex;
            flex-direction: column;
          }
          .login{
            font-weight: 800;
            font-size: 20px;
            margin-top: 20px;
          }
          .name{
            font-size: 16px;
            color: #777;
          }
          .bio{
            margin-rop: 20px;
            color: #333;
          }
          .avatar{
            width: 100%;
            border-radius: 5px;
          }
          .user-repos {
            flex-grow: 1;
          }
        `}</style>
    </div>
  )
}

Index.getInitialProps = async ({ ctx, reduxStore }) => {
  const user = reduxStore.getState().user
  if (!user || !user.id) {
    return {
      isLogin: false
    }
  }
  if (!isServer) {
    if (cache.get('userRepos') && cache.get('userStaredRepos') && cache.get('userRecommendRepos')) {
      return {
        userRepos: cache.get('userRepos'),
        userStaredRepos: cache.get('userStaredRepos'),
        userRecommendRepos: cache.get('userRecommendRepos'),
        isLogin: true
      }
    }
  }

  // 用户的项目列表
  const userRepos = await api.request({
    url: '/user/repos'
  }, ctx.req, ctx.res)

  // 用户的星标列表
  const userStaredRepos = await api.request({
    url: '/user/starred',
  }, ctx.req, ctx.res)

  // 用户列表
  const userList = getUserInfo(userStaredRepos.data)
  // 所有星标项目
  const totalStaredRepos = await getReposByUsers(userList, ctx)
  // 获取与自己最接近的用户
  console.log(user.login)
  const similarUserName = computeSimilar(totalStaredRepos, user.login, userStaredRepos)
  // 用户的推荐列表
  const userRecommendRepos = await api.request({
    url: `/users/${similarUserName}/starred`,
  }, ctx.req, ctx.res)


  return {
    userRepos: userRepos.data,
    userStaredRepos: userStaredRepos.data,
    userRecommendRepos: userRecommendRepos.data,
    isLogin: true
  }

}
export default withRouter(connect((state) => {
  return {
    user: state.user
  }
})(Index))
