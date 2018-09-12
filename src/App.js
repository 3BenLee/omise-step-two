import React, { Component } from 'react';
import { Link } from 'react-router-dom';

//import from 'react-easy-table/sharp-ocean.css';

import './App.css';
var ids = [];
class App extends Component {
  static defaultState = {
    user: '',
    page: 1,
    lastPage: 0,
    repos: [],
    loading: false,
  }

  state = Object.assign({}, App.defaultState)

  componentDidMount() {
    this.componentDidUpdate({match:{params:{}}})
  }

  componentDidUpdate(prevProps) {
    const prevUser = prevProps.match.params.user
    const prevPage = prevProps.match.params.page

    const user = this.props.match.params.user
    const page = this.props.match.params.page
    
    if(prevUser !== user || prevPage !== page) {
      if(user && page) {
        this.setState({loading: true})
        fetch(`https://api.github.com/users/${user}/repos?per_page=10&page=${page}`)
          .then(res => {
            const link = res.headers.get('Link')
            let lastPage = 0
            if(link) {
              if(link.indexOf('rel="last"') !== -1)
                lastPage = link.match(/&page=(\d+)>; rel="last"/)[1] * 1
              else
                lastPage = page * 1
            } 
            res.json().then(repos => {
              this.setState({repos, lastPage, user, page: page * 1, loading: false})
            })
          })
      } else {
        this.setState(App.defaultState)
      }
    }
  }

  search = e => {
    e.preventDefault()
    const form = e.currentTarget
    const userInput = form.querySelector('[name="user"]')
    const user = userInput.value
    const url = user ? `/${user}/1` : '/'
    this.props.history.push(url)
  }

  render() {
    // Get repo data and add it to the table
    const repos = this.state.repos.map((repo, i) => 
     <tr >
   <td key={i}>
        <a href={repo.html_url} target="_blank">{repo.name}</a>
      </td>
        <td key={i}>
        {repo.id}
      </td>
      <td key={i}>
        {repo.full_name}
      </td>
     </tr>
    )

    // Paginations
    const baseUrl = `/${this.state.user}/`
    const paginations = []
    for(let i = 1, l = this.state.lastPage; i <= l; i++) {
      paginations.push(
        <li key={i} className={i === this.state.page ? 'current' : null}>
          <Link to={`${baseUrl}${i}`}>{i}</Link>
        </li>
      )
    }
    if(this.state.page !== 1) {
      paginations.unshift(
        <li key='prev' className='prev'>
          <Link to={`${baseUrl}${this.state.page-1}`}>prev</Link>
        </li>
      )
    }
    if(this.state.page !== this.state.lastPage) {
      paginations.push(
        <li key='next' className='next'>
          <Link to={`${baseUrl}${this.state.page+1}`}>next</Link>
        </li>
      )
    }

    return (
      <div className="app">
        <header className="app-header">
          <h1>Github Repo Finder</h1>
          <form onSubmit={this.search}>
            <label>user: <input className="repo-input" name="user" defaultValue={this.state.user} /></label>
            <input className="search-button" type="submit" value="search repos" />
          </form>
        </header>

        {repos.length ? //ternary operator (?...:...) handles render of repos
        
          <main>
            <h2 className="user-repo">{this.state.user}'s repos</h2>
            <table> 
              <tr>
                <th>Repo Name</th>
                <th>ID Number</th>
                <th>Full Name</th>
              </tr>
                {repos}
            </table>

            {paginations.length ?
              <ul className="pagination">
                {paginations}
              </ul>
            : null} 
          </main>
        : this.state.user ? 
          <p>Not Found</p>
        : null}
      </div>
    )
  }
}


export default App;
