import Link from 'next/link'
import moment from 'moment'
import { Icon } from 'antd'
function getLicense(license) {
  return license ? `${license.spdx_id} license` : 'MIT'
}
function getUpdatedTime(time) {
  return moment(time).fromNow()
}
export default ({repo}) => {
  return (
    <div className={'root'}>
      <div className={'basic-info'}>
        <h3 className={'repo-title'}>
          <Link href={`/detail?owner=${repo.owner.login}&name=${repo.name}`} >
            <a>{repo.full_name}</a>
          </Link>
        </h3>
        <p className={'repo-desc'}>{repo.description}</p>
        <p className={'other-info'}>
          <span className={'license'}>{getLicense(repo.license)}</span>
          <span className={'last-updated'}>{getUpdatedTime(repo.updated_at)}</span>
          <span className={'open-issues'}>{repo.open_issues_count} open issues</span>
        </p>
      </div>
      <div className={'lang-star'}>
        <span className={'lang'} style={{marginRight: 20}}>{repo.language}</span>
        <span className={'stars'}>
          { repo.stargazers_count }<Icon type={'star'} theme={'filled'}/>
        </span>
      </div>
      <style jsx>{`
        .root{
          display: flex;
          justify-content: space-between;
        }
        .root + .root {
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .other-info span:not(:first-child){
          margin-left: 20px;
        }
        .repo-title{
          font-size: 20px;
        }
        .lang-start {
          display: flex;
        }
        .lang-star > span{
          width: 120px;
          text-align: right;
        }
        .repo-desc{
          width: 400px;
        }
        `}</style>
    </div>
  )
}