import withRepoBasic from '../../components/with-repo-basic'
import api from '../../lib/api'
import 'github-markdown-css'
import MdRenderer from '../../components/MarkdownRender'

const Detail = ({ readme }) => {
  return readme ? <MdRenderer content={readme.content} isBase64={true} /> : <div>这个项目没有readme</div>
}
Detail.getInitialProps = async ({ ctx: { query: { owner, name }, req, res } }) => {
  let readmeResp
  try {
    readmeResp = await api.request({
      url: `/repos/${owner}/${name}/readme`
    }, req, res)
  } catch (e) {
    readmeResp = {}
  }
  return {
    readme: readmeResp.data
  }
}
export default withRepoBasic(Detail, 'index')