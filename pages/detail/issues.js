import withRepoBasic from '../../components/with-repo-basic'
import api from '../../lib/api'
import { Avatar, Button, Select } from 'antd'
import dynamic from 'next/dynamic'
import moment from 'moment'
import { useState, useCallback } from 'react'
import SearchUser from '../../components/SearchUser'


const MdRenderer = dynamic(() => import('../../components/MarkdownRender'))
function formatData(str) {
  return moment(str).fromNow()
}
function IssueDetail({ issue }) {
  return <div className={'root'}>
    <MdRenderer content={issue.body} />
    <div className={'actions'}>
      <Button href={issue.html_url} target={'_blank'}>打开issue讨论页面</Button>
    </div>
    <style jsx>{`
      .root {
        background: #fefefe;
        padding: 20px;
      }
      .actions{
        text-align: right;
      }
      `}</style>
  </div>
}
function IssueItem({ issue }) {
  const [showDetail, setShowDetail] = useState(false)

  const toggleShowDetail = useCallback(() => {
    setShowDetail(showDetail => !showDetail)
  }, [])
  return <div><div className={'issue'}>
    <Button
      onClick={toggleShowDetail}
      type={'primary'}
      size="small"
      style={{ position: "absolute", right: 10, top: 10 }}>
      {showDetail ? '隐藏' : '查看'}
    </Button>
    <div className={'avatar'}>
      <Avatar src={issue.user.avatar_url} shape={'square'} size={50} />
    </div>
    <div className={'main-info'}>
      <h6>
        <span>{issue.title}</span>
        {
          issue.labels.map(label => <Label label={label} key={label.id}/> )
        }
      </h6>
      <p className={'sub-info'}>
        <span>Update at {formatData(issue.updated_at)}</span>
      </p>
    </div>
    <style jsx>{`
      .issue {
        display: flex;
        position: relative;
        padding: 10px;
      }
      .issue:hover{
        background: #fafafa;
      }
      .issue + .issue {
        border-top: 1px solid #eee;
      }
      .main-info > h6 {
        max-width: 600px;
        font-size: 16px;
        padding-right: 40px;
      }
      .avatar {
        margin-right: 20px;
      }
      .sub-info {
        margin-bottom: 0;
      }
      .sub-info > span + span {
        display: inline-block;
        margin-left: 20px;
        font-size: 12px;
      }
      `}</style>

  </div>{showDetail ? <IssueDetail issue={issue} /> : null}</div>
}

function makeQuery(creator, state, labels) {
  let creatorStr = creator ? `creator=${creator}` : ''
  let stateStr = state ? `state=${state}` : ''
  let labelsStr = ''
  if (labels && labels.length) {
    labelsStr = `labels=${labels.join(',')}`
  }
  const arr = []
  if (creatorStr) arr.push(creatorStr)
  if (stateStr) arr.push(stateStr)
  if (labelsStr) arr.push(labelsStr)
  return `?${arr.join('&')}`
}
function Label({label}) {
  return <>
    <span className={'label'} style={{backgroundColor: `#${label.color}`}}>{label.name}</span>
    <style jsx>{`
      .label {
        display: inline-block;
        line-height: 20px;
        padding: 3px 0px;
        margin-left: 15px
      }
      `}</style>
  </>
}
const Option = Select.Option
const Issues = ({ initialIssues, labels, owner, name }) => {
  const [creator, setCreator] = useState()
  const [state, setState] = useState()
  const [label, setLabel] = useState([])
  const [issues, setIssues] = useState(initialIssues)
  const [fetching, setFetching] = useState(false)
  const handleCreatorChange = useCallback((value) => {
    setCreator(value)
  })
  const handleStateChange = useCallback((value) => {
    setState(value)
  }, [])
  const handleLabelChange = useCallback((value) => {
    setLabel(value)
  }, [])
  const handleSearch = useCallback(() => {
    setFetching(true)
    api.request({
      url: `/repos/${owner}/${name}/issues${makeQuery(creator, state, label)}`
    })
      .then(resp => {
        setFetching(false)
        setIssues(resp.data)
      })
      .catch(err => {
        console.log(err)
        setFetching(false)
      })
  }, [creator, state, label])
  return <div className={'root'}>
    <div className={'search'}>
      <SearchUser onChange={handleCreatorChange} value={creator} />
      <Select placeholder={'状态'} onChange={handleStateChange} style={{ width: 200, marginLeft: 20 }} value={state}>
        <Option value={'all'}>all</Option>
        <Option value={'open'}>open</Option>
        <Option value={'closed'}>closed</Option>
      </Select>
      <Select
        mode={'multiple'}
        placeholder={'标签'}
        onChange={handleLabelChange}
        style={{ flexGrow: 1, marginLeft: 20, marginRight: 20 }}
        value={label}>
        {labels.map(la => (
          <Option value={la.name} key={la.id}>
            {la.name}
          </Option>
        ))}
      </Select>
      <Button type={'primary'} disabled={fetching} onClick={handleSearch}>搜索</Button>
    </div>
    <div className={'issues'}>
      {issues.map(issue => <IssueItem issue={issue} key={issue.id} />)}
    </div>
    <style jsx>{`
        .issues {
          border: 1px solid #eee;
          border-radius: 5px;
          margin-bottom: 20px;
          margin-top: 20px;
        }
        .search {
          display: flex;
        }
      `}</style>
  </div>
}
Issues.getInitialProps = async ({ ctx }) => {

  const { owner, name } = ctx.query
  const fetchs = await Promise.all([
    await api.request({
      url: `/repos/${owner}/${name}/issues`
    }, ctx.req, ctx.res),
    await api.request({
      url: `/repos/${owner}/${name}/labels`
    }, ctx.req, ctx.res)
  ])

  return {
    owner,
    name,
    initialIssues: fetchs[0].data,
    labels: fetchs[1].data
  }
}
export default withRepoBasic(Issues, 'issues')