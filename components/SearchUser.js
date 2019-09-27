import { useState, useCallback, useRef } from 'react'
import { Select, Spin } from 'antd'
import api from '../lib/api'
import debounce from 'lodash/debounce'

const Option = Select.Option
function SearchUser({ onChange, value }) {
  const lastFetchRef = useRef(0)
  const [fetching, setFetching] = useState(false)
  const [options, setOptions] = useState([])
  const fetchUser = useCallback(debounce(value => {

    lastFetchRef.current += 1
    const fetchId = lastFetchRef.current

    setFetching(true)
    setOptions([])

    api.request({
      url: `/search/users?q=${value}`
    })
      .then(resp => {
        console.log('user', resp.data)
        if (fetchId !== lastFetchRef.current) {
          return
        }
        const data = resp.data.items.map(user => ({
          text: user.login,
          value: user.login
        }))
        setFetching(false)
        setOptions(data)
      })
  }, 500), [])
  const handleChange = value => {
    setOptions([])
    setFetching(false)
    onChange(value)
  }
  return <Select
    style={{ width: 200 }}
    showSearch={true}
    notFoundContent={fetching ? <Spin size={'small'} /> : <span>nothing</span>}
    filterOption={false}
    value={value}
    placeholder={'创建者'}
    onSearch={fetchUser}
    onChange={handleChange}
    allowClear={true}
  >
    {
      options.map(op => (
        <Option value={op.value} key={op.value}>{op.text}</Option>
      ))
    }
  </Select>
}
export default SearchUser