import withRepoBasic from '../../components/with-repo-basic'
import api from '../../lib/api'
import 'github-markdown-css'
import MdRenderer from '../../components/MarkdownRender'

const Detail = ({readme}) => {
  return <MdRenderer content={readme.content} isBase64={true}/>
}
Detail.getInitialProps = async ({ ctx: { query: {owner, name}, req, res } }) => {

  const readmeResp = await api.request({
    url: `/repos/${owner}/${name}/readme`
  }, req, res)
  return {
    readme: readmeResp.data
  }
}
export default withRepoBasic(Detail, 'index')